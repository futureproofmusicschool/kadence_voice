from pydantic import BaseModel
from typing import Optional

class Config(BaseModel):
    voice: str
    session_id: str
    username: Optional[str] = None
    user_id: Optional[str] = None
    current_url: Optional[str] = None