from fastapi import FastAPI
from .config import setup_cors
from .api import regression

app = FastAPI(title="ohmystats API", version="1.0.0")

setup_cors(app)

app.include_router(regression.router, prefix="/api", tags=["regression"])
