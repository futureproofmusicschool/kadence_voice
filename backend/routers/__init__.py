# routers/__init__.py
from .config import router as config_router
from .stream import router as stream_router

__all__ = [
    "config_router",
    "stream_router",
]