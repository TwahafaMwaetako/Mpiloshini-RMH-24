from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ...services.supabase_service import SupabaseService


router = APIRouter()


class SignedUrlRequest(BaseModel):
    fileName: str
    contentType: str


@router.post("/signed-url")
def create_signed_url(payload: SignedUrlRequest):
    try:
        service = SupabaseService()
        url, path = service.create_signed_upload_url(payload.fileName, payload.contentType)
        return {"signedUrl": url, "filePath": path}
    except NotImplementedError:
        raise HTTPException(
            status_code=501,
            detail=(
                "Signed URL generation via Python client is not implemented yet. "
                "Use client-side Supabase JS upload or provide a pre-signed URL via Edge Function."
            ),
        )
