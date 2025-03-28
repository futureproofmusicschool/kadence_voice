from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import APIKeyHeader
import redis.asyncio as redis
import secrets
import os
from config import settings
from models.config import Config
from utils.jwt_utils import generate_jwt

router = APIRouter()
redis_client = redis.from_url(settings.REDIS_URL)

# Get client verification token from environment variables
# Using the specified token as default
CLIENT_VERIFICATION_TOKEN = os.getenv("CLIENT_VERIFICATION_TOKEN", "3a7c6f8d2e1b4a9c8f7e6d5c4b3a2e1d")

async def verify_client_request(verification_token: str = Depends(APIKeyHeader(name="X-Client-Token"))) -> str:
    # This is for verifying front-end requests, not the same as the Gemini API key
    if verification_token == CLIENT_VERIFICATION_TOKEN:
        return verification_token
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid client token",
    )

@router.post("/config", status_code=status.HTTP_201_CREATED)
async def set_config(config: Config, client_token: str = Depends(verify_client_request)):
    session_id = config.session_id
    
    # Store configuration and user details
    user_data = {
        "voice": config.voice,
    }
    
    # Add user details if available
    if config.username:
        user_data["username"] = config.username
    if config.user_id:
        user_data["user_id"] = config.user_id
    if config.current_url:
        user_data["current_url"] = config.current_url
    
    # Store in Redis
    await redis_client.hset(f"config:{session_id}", mapping=user_data)
    await redis_client.expire(f"config:{session_id}", 1800)  # 30 minute expiry
    
    # Generate JWT token
    payload = {"session_id": session_id}
    token = generate_jwt(payload)
    
    return {"session_id": session_id, "token": token}