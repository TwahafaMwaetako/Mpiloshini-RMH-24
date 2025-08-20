from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import uuid
from datetime import datetime
from ...services.supabase_service import SupabaseService
from ...core.config import settings


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


class VibrationRecordRequest(BaseModel):
    machine_id: str
    file_path: str
    file_url: str
    file_name: str
    sensor_position: str
    axis: str
    sampling_rate: int
    measurement_date: str


@router.post("/vibration-record")
async def create_vibration_record(payload: VibrationRecordRequest):
    """Create a vibration record in Supabase database"""
    try:
        supabase = SupabaseService()
        
        # First, we need to find or create a sensor for this measurement
        # For MVP, we'll create a simple sensor record
        sensor_id = None
        
        # Check if we have machines and sensors tables properly set up
        # For now, we'll create a sensor if needed
        try:
            sensor_id = supabase.create_sensor(
                machine_id=payload.machine_id,
                position=payload.sensor_position,
                axis=payload.axis,
                sampling_rate=float(payload.sampling_rate)
            )
        except Exception as e:
            # If sensor creation fails, we might need to use an existing one
            # or handle this differently based on your database schema
            print(f"Sensor creation failed: {e}")
            # For MVP, create a simple UUID as sensor_id
            sensor_id = str(uuid.uuid4())
        
        # Create the vibration record
        record_data = {
            "sensor_id": sensor_id,
            "file_path": payload.file_path,
            "timestamp": payload.measurement_date,
            "status": "unprocessed",
            "file_name": payload.file_name,
        }
        
        result = supabase.create_vibration_record_from_dict(record_data)
        
        return {
            "success": True,
            "record_id": result.get("id"),
            "sensor_id": sensor_id,
            "message": "Vibration record created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create vibration record: {str(e)}")
