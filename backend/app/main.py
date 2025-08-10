from fastapi import FastAPI
from .api.endpoints.upload import router as upload_router
from .api.endpoints.records import router as records_router
from .api.endpoints.diagnose import router as diagnose_router

app = FastAPI(title="Mpiloshini RMH 24 Backend")

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(upload_router, prefix="/upload", tags=["upload"])
app.include_router(records_router, prefix="/records", tags=["records"])
app.include_router(diagnose_router, prefix="/diagnose", tags=["diagnose"])
