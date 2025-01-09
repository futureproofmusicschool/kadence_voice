from pydantic import BaseModel

class MediaChunk(BaseModel):
    session_id: str
    data: str | None = None
    text: str | None = None
    sequence_number: int

class AudioResponse(BaseModel):
    session_id: str
    data: str
    end_of_stream: bool