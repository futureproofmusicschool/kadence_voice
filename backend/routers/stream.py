import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
import redis.asyncio as redis
from config import settings
from services.gemini_service import GeminiService, GeminiAPIError
from utils.jwt_utils import decode_jwt
from utils.audio_utils import decode_audio

router = APIRouter()
redis_client = redis.from_url(settings.REDIS_URL)

async def get_current_session(websocket: WebSocket, token: str):
    try:
        payload = decode_jwt(token)
        session_id: str = payload.get("session_id")
        if session_id is None:
            raise WebSocketDisconnect(code=status.WS_1008_POLICY_VIOLATION)
        return session_id
    except Exception:
        raise WebSocketDisconnect(code=status.WS_1008_POLICY_VIOLATION)

async def handle_audio_chunk(gemini_service: GeminiService, message: dict):
    try:
        audio_data = decode_audio(message["data"])
        await gemini_service.input_queue.put(audio_data)
    except Exception as e:
        print(f"Error decoding audio chunk: {e}")

@router.websocket("/stream/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    session_id = None
    gemini_service = None
    reconnect_attempts = 0
    max_reconnect_attempts = 5
    reconnect_delay = 5

    while reconnect_attempts < max_reconnect_attempts:
        try:
            session_id = await get_current_session(websocket, token)
            config_data = await redis_client.hgetall(f"config:{session_id}")

            if not config_data:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return

            await websocket.accept()
            reconnect_attempts = 0

            gemini_service = GeminiService(
                project_id=config_data[b"project_id"].decode(),
                region=config_data[b"region"].decode(),
                voice_name=config_data[b"voice"].decode(),
                session_id=session_id
            )

            asyncio.create_task(gemini_service.run(websocket))

            while True:
                data = await websocket.receive_text()
                message = json.loads(data)
                if message["type"] == "audio_chunk":
                    await handle_audio_chunk(gemini_service, message)

        except WebSocketDisconnect as e:
            print(f"WebSocket disconnected: {e}")
            if gemini_service:
                await gemini_service.stop()
            break

        except ConnectionRefusedError:
            print("Connection refused. Retrying...")
            reconnect_attempts += 1
            await asyncio.sleep(reconnect_delay)
            reconnect_delay *= 2

        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            if gemini_service:
                await gemini_service.stop()
            break

    if reconnect_attempts == max_reconnect_attempts:
        print("Max reconnect attempts reached. Closing connection.")
        if websocket:
            await websocket.close(code=status.WS_1001_GOING_AWAY)