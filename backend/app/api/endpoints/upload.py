from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
from typing import Optional
import os
import uuid
from datetime import datetime


router = APIRouter()


class SignedUrlRequest(BaseModel):
    fileName: str
    contentType: str


@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    machine_id: Optional[str] = Form(None),
    sensor_position: Optional[str] = Form(None),
    axis: Optional[str] = Form(None),
    sampling_rate: Optional[str] = Form(None)
):
    """Upload a vibration data file"""
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file locally (in production, you'd upload to cloud storage)
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Return file information
        return {
            "file_url": f"/uploads/{unique_filename}",
            "file_name": file.filename,
            "file_path": file_path,
            "size": len(contents),
            "uploaded_at": datetime.utcnow().isoformat(),
            "metadata": {
                "machine_id": machine_id,
                "sensor_position": sensor_position,
                "axis": axis,
                "sampling_rate": sampling_rate
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@router.post("/signed-url")
def create_signed_url(payload: SignedUrlRequest):
    """Legacy endpoint for signed URL generation"""
    # For now, return a mock response
    return {
        "signedUrl": f"http://localhost:8000/upload/file",
        "filePath": f"uploads/{payload.fileName}"
    }
