from pydantic import BaseModel

class Config(BaseModel):
    project_id: str
    region: str
    voice: str
    session_id: str