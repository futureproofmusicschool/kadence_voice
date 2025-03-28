from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers import config, stream
from config import settings
import os

# Get port from Railway environment or use default
PORT = int(os.getenv("PORT", "8000"))

app = FastAPI(title="Gemini Voice Chat API", version=settings.APP_VERSION)

# Configure CORS for specific origin (LearnWorlds)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://learn.futureproofmusicschool.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Client-Token"],
)

app.include_router(config.router, tags=["Configuration"])
app.include_router(stream.router, tags=["WebSocket Stream"])

@app.get("/")
async def root():
    return {"status": "online", "version": settings.APP_VERSION}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# This is used for local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)