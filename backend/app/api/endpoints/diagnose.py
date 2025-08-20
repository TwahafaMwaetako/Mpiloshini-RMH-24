from fastapi import APIRouter, HTTPException
from ...services.vibration_analysis import VibrationAnalysisService


router = APIRouter()


@router.post("/{record_id}")
def diagnose_record(record_id: str):
    try:
        service = VibrationAnalysisService()
        result = service.process_record(record_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analyze/{vibration_id}")
def analyze_vibration(vibration_id: str):
    """Analyze a vibration record - alias for diagnose_record to match frontend API"""
    try:
        service = VibrationAnalysisService()
        result = service.process_record(vibration_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
