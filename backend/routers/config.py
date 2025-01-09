from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import APIKeyHeader
import redis.asyncio as redis
from config import settings
from models.config import Config
from utils.jwt_utils import generate_jwt

router = APIRouter()
api_key_header = APIKeyHeader(name="X-API-Key")
redis_client = redis.from_url(settings.REDIS_URL)

async def get_api_key(api_key_header: str = Depends(api_key_header)) -> str:
    if api_key_header == settings.API_KEY:
        return api_key_header
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid API Key",
    )

@router.post("/config", status_code=status.HTTP_201_CREATED)
async def set_config(config: Config, api_key: str = Depends(get_api_key)):
    session_id = config.session_id
    await redis_client.hset(f"config:{session_id}", mapping={
        "voice": config.voice
    })
    await redis_client.expire(f"config:{session_id}", 1800)
    payload = {"session_id": session_id}
    token = generate_jwt(payload)
    return {"session_id": session_id, "token": token}