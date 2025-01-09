# services/__init__.py
from .gemini import GeminiService, GeminiAPIError

__all__ = [
    "GeminiService",
    "GeminiAPIError"
]