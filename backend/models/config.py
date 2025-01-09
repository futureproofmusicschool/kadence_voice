from pydantic import BaseModel

class Config(BaseModel):
    voice: str
    session_id: str