from fastapi import APIRouter, HTTPException
from ...services.vibration_analysis import VibrationAnalysisService


router = APIRouter()


@router.post("/{record_id}")
def diagnose_record(record_id: str):
    try:
        service = VibrationAnalysisService()
        result = service.process_record(record_id)
        return result
    except NotImplementedError:
        raise HTTPException(status_code=501, detail="Diagnosis not implemented yet")
