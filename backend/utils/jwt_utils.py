from datetime import datetime, timedelta
import jwt
from config import settings

def generate_jwt(payload: dict) -> str:
    expiration = datetime.utcnow() + timedelta(minutes=60)
    payload["exp"] = expiration
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_jwt(token: str):
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])