import asyncio
import base64
from typing import AsyncGenerator
from google import genai
import numpy as np
from fastapi import WebSocket
from utils.audio_utils import encode_audio

class GeminiAPIError(Exception):
    pass

class GeminiService:
    def __init__(self, api_key: str, voice_name: str, session_id: str):
        self.api_key = api_key
        self.voice_name = voice_name
        self.session_id = session_id
        self.input_queue = asyncio.Queue()
        self.output_queue = asyncio.Queue()
        self.quit = asyncio.Event()
        self.client = genai.Client(api_key=self.api_key, http_options={'api_version': 'v1alpha'})
        self.model_id = "gemini-2.0-flash-exp"

    async def send_message(self, message):
        if isinstance(message, str):
            await self.session.send(message, end_of_turn=True)
        else:
            await self.session.send(message)

    async def stream_to_gemini(self) -> AsyncGenerator[str | bytes, None]:
        while not self.quit.is_set():
            try:
                message = await asyncio.wait_for(
                    self.input_queue.get(), timeout=5.0
                )
                if isinstance(message, str):
                    yield message
                else:
                    yield encode_audio(message)

            except asyncio.TimeoutError:
                continue

    async def process_audio_from_gemini(self, websocket: WebSocket):
        async for response in self.session.receive():
            if response.data:
                audio_data_str = base64.b64encode(response.data).decode("UTF-8")
                await websocket.send_json(
                    {
                        "type": "audio_response",
                        "data": audio_data_str,
                        "end_of_stream": False,
                        "session_id": self.session_id,
                    }
                )
            elif response.text:
                print(f"Received text response: {response.text}")

    async def run(self, websocket: WebSocket):
        config = {
            "response_modalities": ["AUDIO"],
            "speech_config": {
                "voice_config": {
                    "prebuilt_voice_config": {"voice_name": self.voice_name}
                }
            },
        }

        retry_attempts = 0
        max_retry_attempts = 3
        try:
            async with self.client.aio.live.connect(
                model=self.model_id, config=config
            ) as session:
                self.session = session
                asyncio.create_task(self.process_audio_from_gemini(websocket))
                async for message in self.stream_to_gemini():
                    await self.send_message(message)
            retry_attempts = 0
        except Exception as e:
            print(f"Error connecting to Gemini API: {e}")
            if "Stream removed" in str(e):
                retry_attempts += 1
                print(
                    f"Retrying connection to Gemini API (attempt {retry_attempts}/{max_retry_attempts})..."
                )
                await asyncio.sleep(5)
            else:
                raise GeminiAPIError(f"Failed to connect to Gemini API: {e}") from e
        finally:
            if retry_attempts == max_retry_attempts:
                await self.stop()

    async def stop(self):
        self.quit.set()