from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter()

# Pydantic models for machines
class MachineBase(BaseModel):
    name: str
    type: str
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    installation_date: Optional[str] = None
    location: Optional[str] = None
    status: str = "operational"
    rpm_nominal: Optional[int] = None
    power_kw: Optional[float] = None
    description: Optional[str] = None

class MachineCreate(MachineBase):
    pass

class MachineUpdate(MachineBase):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None

class Machine(MachineBase):
    id: str
    created_at: datetime
    updated_at: datetime

# In-memory storage for now (replace with database later)
machines_db = {}

# Initialize with some default machines for testing
def initialize_default_machines():
    if not machines_db:  # Only initialize if empty
        default_machines = [
            {
                "name": "Motor Pump 001",
                "type": "Centrifugal Pump",
                "manufacturer": "Grundfos",
                "model": "CR 32-4",
                "location": "Plant A - Section 1",
                "status": "operational",
                "rpm_nominal": 1800,
                "power_kw": 15.0,
                "description": "Main cooling water pump"
            },
            {
                "name": "Compressor Unit 002", 
                "type": "Rotary Compressor",
                "manufacturer": "Atlas Copco",
                "model": "GA 22",
                "location": "Plant A - Section 2", 
                "status": "operational",
                "rpm_nominal": 3600,
                "power_kw": 22.0,
                "description": "Air compressor for pneumatic systems"
            },
            {
                "name": "Fan Motor 003",
                "type": "Axial Fan",
                "manufacturer": "ABB",
                "model": "M3BP 160",
                "location": "Plant B - Ventilation",
                "status": "operational", 
                "rpm_nominal": 1450,
                "power_kw": 7.5,
                "description": "Ventilation system fan"
            }
        ]
        
        for machine_data in default_machines:
            machine_id = str(uuid.uuid4())
            now = datetime.utcnow()
            
            machine = Machine(
                id=machine_id,
                created_at=now,
                updated_at=now,
                **machine_data
            )
            machines_db[machine_id] = machine

# Initialize default machines
initialize_default_machines()

@router.get("/machines", response_model=List[Machine])
async def get_machines():
    """Get all machines"""
    return list(machines_db.values())

@router.get("/machines/{machine_id}", response_model=Machine)
async def get_machine(machine_id: str):
    """Get a specific machine by ID"""
    if machine_id not in machines_db:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machines_db[machine_id]

@router.post("/machines", response_model=Machine)
async def create_machine(machine: MachineCreate):
    """Create a new machine"""
    machine_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    new_machine = Machine(
        id=machine_id,
        created_at=now,
        updated_at=now,
        **machine.dict()
    )
    
    machines_db[machine_id] = new_machine
    return new_machine

@router.put("/machines/{machine_id}", response_model=Machine)
async def update_machine(machine_id: str, machine: MachineUpdate):
    """Update an existing machine"""
    if machine_id not in machines_db:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    existing_machine = machines_db[machine_id]
    update_data = machine.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(existing_machine, field, value)
    
    existing_machine.updated_at = datetime.utcnow()
    machines_db[machine_id] = existing_machine
    
    return existing_machine

@router.delete("/machines/{machine_id}")
async def delete_machine(machine_id: str):
    """Delete a machine"""
    if machine_id not in machines_db:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    del machines_db[machine_id]
    return {"message": "Machine deleted successfully"}

# Vibration records endpoints
vibration_records_db = {}

class VibrationRecordBase(BaseModel):
    machine_id: str
    file_url: str
    file_name: str
    sensor_position: Optional[str] = None
    axis: Optional[str] = None
    sampling_rate: Optional[int] = None
    measurement_date: Optional[str] = None

class VibrationRecordCreate(VibrationRecordBase):
    pass

class VibrationRecord(VibrationRecordBase):
    id: str
    created_at: datetime

@router.get("/vibrations", response_model=List[VibrationRecord])
async def get_vibration_records():
    """Get all vibration records"""
    return list(vibration_records_db.values())

@router.get("/vibrations/machine/{machine_id}", response_model=List[VibrationRecord])
async def get_vibration_records_by_machine(machine_id: str):
    """Get vibration records for a specific machine"""
    records = [r for r in vibration_records_db.values() if r.machine_id == machine_id]
    return records

@router.post("/vibrations", response_model=VibrationRecord)
async def create_vibration_record(record: VibrationRecordCreate):
    """Create a new vibration record"""
    record_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    new_record = VibrationRecord(
        id=record_id,
        created_at=now,
        **record.dict()
    )
    
    vibration_records_db[record_id] = new_record
    return new_record

@router.delete("/vibrations/{record_id}")
async def delete_vibration_record(record_id: str):
    """Delete a vibration record"""
    if record_id not in vibration_records_db:
        raise HTTPException(status_code=404, detail="Vibration record not found")
    
    del vibration_records_db[record_id]
    return {"message": "Vibration record deleted successfully"}
