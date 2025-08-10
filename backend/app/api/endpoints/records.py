from fastapi import APIRouter, HTTPException, Depends
from ...schemas.records import CreateRecordRequest
from ...services.supabase_service import SupabaseService
from ...core.auth import get_current_user


router = APIRouter()


@router.post("")
def create_record(payload: CreateRecordRequest, user=Depends(get_current_user)):
    if not payload.sensor_id or not payload.file_path:
        raise HTTPException(status_code=400, detail="sensor_id and file_path are required")

    try:
        service = SupabaseService()
        # Attach uploader to payload using duck typing (schema remains minimal)
        payload_dict = payload.model_dump()
        payload_dict["uploaded_by"] = user["id"]
        record = service.create_vibration_record_from_dict(payload_dict)
        return record
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except NotImplementedError:
        raise HTTPException(status_code=501, detail="Record creation not implemented yet")
