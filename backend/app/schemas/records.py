from pydantic import BaseModel
from datetime import datetime


class CreateRecordRequest(BaseModel):
    sensor_id: str
    file_path: str
    timestamp: datetime
