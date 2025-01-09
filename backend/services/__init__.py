# services/__init__.py
from .gemini_service import GeminiService, GeminiAPIError

__all__ = [
    "GeminiService",
    "GeminiAPIError"
]