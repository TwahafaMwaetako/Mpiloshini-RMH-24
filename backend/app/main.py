from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints.upload import router as upload_router
from .api.endpoints.records import router as records_router
from .api.endpoints.diagnose import router as diagnose_router
from .api.endpoints.machines import router as machines_router

app = FastAPI(title="Mpiloshini RMH 24 Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(upload_router, prefix="/upload", tags=["upload"])
app.include_router(machines_router, prefix="/records", tags=["machines", "records"])
app.include_router(records_router, prefix="/records", tags=["records"])
app.include_router(diagnose_router, prefix="/diagnose", tags=["diagnose"])
