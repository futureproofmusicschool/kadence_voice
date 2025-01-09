import base64
import numpy as np

def encode_audio(data: np.ndarray) -> str:
    return base64.b64encode(data.tobytes()).decode("UTF-8")

def decode_audio(data: str) -> np.ndarray:
    audio_bytes = base64.b64decode(data)
    return np.frombuffer(audio_bytes, dtype=np.int16)