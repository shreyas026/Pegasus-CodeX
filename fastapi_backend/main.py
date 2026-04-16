from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.case_routes import router as case_router


app = FastAPI(
    title="Domestic Violence Case Analysis API",
    version="1.0.0",
    description="Minimal FastAPI backend for hackathon case intake and analysis.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(case_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
