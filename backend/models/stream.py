from pydantic import BaseModel

class AudioChunk(BaseModel):
    session_id: str
    data: str
    sequence_number: int

class AudioResponse(BaseModel):
    session_id: str
    data: str
    end_of_stream: bool