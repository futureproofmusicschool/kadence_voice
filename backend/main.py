from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers import config, stream
from config import settings

app = FastAPI(title="Gemini Voice Chat API", version=settings.APP_VERSION)

# Configure CORS for all origins to allow embedding on any website
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(config.router, tags=["Configuration"])
app.include_router(stream.router, tags=["WebSocket Stream"])

@app.get("/")
async def root():
    return {"status": "online", "version": settings.APP_VERSION}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# This is important for Vercel deployment
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)