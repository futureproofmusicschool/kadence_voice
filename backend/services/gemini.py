import asyncio
import base64
from typing import AsyncGenerator
from google import genai
from google.api_core.exceptions import GoogleAPIError
from google.genai.types import (
    LiveConnectConfig,
    PrebuiltVoiceConfig,
    SpeechConfig,
    VoiceConfig,
)
import numpy as np
from fastapi import WebSocket
from utils.audio_utils import encode_audio

class GeminiAPIError(Exception):
    pass

class GeminiService:
    def __init__(self, project_id: str, region: str, voice_name: str, session_id: str):
        self.project_id = project_id
        self.region = region
        self.voice_name = voice_name
        self.session_id = session_id
        self.input_queue = asyncio.Queue()
        self.output_queue = asyncio.Queue()
        self.quit = asyncio.Event()
        self.client = genai.Client(
            vertexai=True, project=self.project_id, location=self.region
        )

    async def stream_to_gemini(self) -> AsyncGenerator[str, None]:
        while not self.quit.is_set():
            try:
                audio_data = await asyncio.wait_for(
                    self.input_queue.get(), timeout=5.0
                )
                audio_chunk = encode_audio(audio_data)
                yield audio_chunk
            except asyncio.TimeoutError:
                continue

    async def process_audio_from_gemini(self, websocket: WebSocket):
        async for audio_response_chunk in self.output_queue:
            await websocket.send_json(
                {
                    "type": "audio_response",
                    "data": audio_response_chunk,
                    "end_of_stream": False,
                    "session_id": self.session_id,
                }
            )

    async def run(self, websocket: WebSocket):
        config = LiveConnectConfig(
            response_modalities=["AUDIO"],
            speech_config=SpeechConfig(
                voice_config=VoiceConfig(
                    prebuilt_voice_config=PrebuiltVoiceConfig(
                        voice_name=self.voice_name,
                    )
                )
            ),
        )
        retry_attempts = 0
        max_retry_attempts = 3
        while retry_attempts < max_retry_attempts:
            try:
                async with self.client.aio.live.connect(
                    model="gemini-2.0-flash-exp", config=config
                ) as session:
                    asyncio.create_task(self.process_audio_from_gemini(websocket))
                    async for audio in session.start_stream(
                        stream=self.stream_to_gemini(), mime_type="audio/pcm"
                    ):
                        if audio.data:
                            audio_data_str = encode_audio(audio.data)
                            await self.output_queue.put(audio_data_str)
                retry_attempts = 0
            except GoogleAPIError as e:
                print(f"Error connecting to Gemini API: {e}")
                if "Stream removed" in str(e):
                    retry_attempts += 1
                    print(
                        f"Retrying connection to Gemini API (attempt {retry_attempts}/{max_retry_attempts})..."
                    )
                    await asyncio.sleep(5)
                else:
                    raise GeminiAPIError(f"Failed to connect to Gemini API: {e}") from e
            except Exception as e:
                raise GeminiAPIError(
                    f"An unexpected error occurred with Gemini API: {e}"
                ) from e
            finally:
                if retry_attempts == max_retry_attempts:
                    await self.stop()

    async def stop(self):
        self.quit.set()