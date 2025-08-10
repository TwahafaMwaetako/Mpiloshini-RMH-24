from fastapi import APIRouter, HTTPException
from ...schemas.records import CreateRecordRequest
from ...services.supabase_service import SupabaseService


router = APIRouter()


@router.post("")
def create_record(payload: CreateRecordRequest):
    if not payload.sensor_id or not payload.file_path:
        raise HTTPException(status_code=400, detail="sensor_id and file_path are required")

    try:
        service = SupabaseService()
        record = service.create_vibration_record(payload)
        return record
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except NotImplementedError:
        raise HTTPException(status_code=501, detail="Record creation not implemented yet")
