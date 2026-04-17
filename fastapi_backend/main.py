import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.alert_routes import router as alert_router
from routes.case_routes import router as case_router
from routes.support_routes import router as support_router
from storage import init_storage


def _parse_cors_origins() -> list[str]:
    raw = os.getenv("DV_CORS_ORIGINS", "")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app = FastAPI(
    title="Domestic Violence Case Analysis API",
    version="1.0.0",
    description="Minimal FastAPI backend for hackathon case intake and analysis.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_cors_origins(),
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(case_router)
app.include_router(alert_router)
app.include_router(support_router)


@app.on_event("startup")
def startup() -> None:
    init_storage()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
