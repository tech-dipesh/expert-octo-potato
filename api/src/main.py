import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.accuracy.routes import router as accuracy
from src.elexon.snapshot import FILE
from src.forecasts.routes import router as forecasts
from src.infra import env
from src.infra.errors import register

app = FastAPI(title="api")
app.add_middleware(CORSMiddleware, allow_origins=env.ORIGINS, allow_methods=["GET"], allow_headers=["*"])
register(app)
app.include_router(forecasts)
app.include_router(accuracy)

@app.get("/health")
def health(): return {"ok": True, "snapshot": FILE.exists()}

def dev(): uvicorn.run("src.main:app", port=env.PORT, reload=True)
