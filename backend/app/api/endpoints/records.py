from fastapi import APIRouter, HTTPException
from ...schemas.records import CreateRecordRequest
from ...services.supabase_service import SupabaseService


router = APIRouter()


@router.post("")
def create_record(payload: CreateRecordRequest):
    try:
        service = SupabaseService()
        record = service.create_vibration_record(payload)
        return record
    except NotImplementedError:
        raise HTTPException(status_code=501, detail="Record creation not implemented yet")
