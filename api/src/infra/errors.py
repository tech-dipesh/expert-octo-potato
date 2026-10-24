import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

log = logging.getLogger("uvicorn.error")

class AppError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status

def reply(status: int, body: dict): return JSONResponse(body, status_code=status)

def register(app: FastAPI):
    @app.exception_handler(AppError)
    async def app_error(_req: Request, err: AppError): return reply(err.status, {"error": str(err)})
    @app.exception_handler(HTTPException)
    async def http_error(_req: Request, err: HTTPException): return reply(err.status_code, {"error": err.detail})
    @app.exception_handler(RequestValidationError)
    async def bad_input(_req: Request, err: RequestValidationError): return reply(422, {"error": "invalid request", "fields": [{"field": ".".join(str(p) for p in e["loc"][1:]), "message": e["msg"]} for e in err.errors()]})
    @app.exception_handler(Exception)
    async def fallback(_req: Request, err: Exception):
        log.error("unhandled", exc_info=err)
        return reply(500, {"error": "something went wrong"})
