from fastapi import FastAPI
from starlette_exporter import PrometheusMiddleware, handle_metrics
from routers import config, stream
from config import settings

app = FastAPI(title="Gemini Voice Chat API", version=settings.APP_VERSION)

app.add_middleware(PrometheusMiddleware)
app.add_route("/metrics", handle_metrics)

app.include_router(config.router)
app.include_router(stream.router)

@app.get("/")
async def read_root():
    return {"message": "Gemini Voice Chat API is running!"}