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
                "id": str(uuid.uuid4()),
                "name": "Motor Pump 001",
                "type": "Centrifugal Pump",
                "manufacturer": "Grundfos",
                "model": "CR 32-4",
                "location": "Plant A - Section 1",
                "status": "operational",
                "rpm_nominal": 1800,
                "power_kw": 15.0,
                "description": "Main cooling water pump",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Compressor Unit 002", 
                "type": "Rotary Compressor",
                "manufacturer": "Atlas Copco",
                "model": "GA 22",
                "location": "Plant A - Section 2", 
                "status": "operational",
                "rpm_nominal": 3600,
                "power_kw": 22.0,
                "description": "Air compressor for pneumatic systems",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Fan Motor 003",
                "type": "Axial Fan",
                "manufacturer": "ABB",
                "model": "M3BP 160",
                "location": "Plant B - Ventilation",
                "status": "operational", 
                "rpm_nominal": 1450,
                "power_kw": 7.5,
                "description": "Ventilation system fan",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
        ]
        
        for machine_data in default_machines:
            machines_db[machine_data["id"]] = machine_data

# Initialize default machines
initialize_default_machines()

@router.get("/machines")
async def get_machines():
    """Get all machines"""
    return list(machines_db.values())

@router.get("/machines/{machine_id}")
async def get_machine(machine_id: str):
    """Get a specific machine by ID"""
    if machine_id not in machines_db:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machines_db[machine_id]

@router.post("/machines")
async def create_machine(machine: MachineCreate):
    """Create a new machine"""
    machine_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    new_machine = {
        "id": machine_id,
        "created_at": now,
        "updated_at": now,
        **machine.dict()
    }
    
    machines_db[machine_id] = new_machine
    return new_machine

@router.put("/machines/{machine_id}")
async def update_machine(machine_id: str, machine: MachineUpdate):
    """Update an existing machine"""
    if machine_id not in machines_db:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    existing_machine = machines_db[machine_id]
    update_data = machine.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        existing_machine[field] = value
    
    existing_machine["updated_at"] = datetime.utcnow().isoformat()
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

@router.get("/vibrations")
async def get_vibration_records():
    """Get all vibration records from both in-memory and Supabase storage"""
    from ...services.supabase_service import SupabaseService
    
    print(f"Fetching vibration records. In-memory database contains {len(vibration_records_db)} records:")
    for record_id, record in vibration_records_db.items():
        print(f"  - {record_id}: {record.get('file_name', 'Unknown')} (processed: {record.get('processed', False)})")
    
    # Also get records from Supabase service local storage
    supabase_service = SupabaseService()
    supabase_records = []
    
    try:
        # Access the local records from SupabaseService
        local_records = getattr(supabase_service, '_local_records', {})
        print(f"Supabase local storage contains {len(local_records)} records:")
        
        for record_id, record in local_records.items():
            print(f"  - {record_id}: {record.get('file_name', 'Unknown')} (status: {record.get('status', 'unknown')})")
            
            # Convert Supabase record format to match the expected format
            converted_record = {
                "id": record_id,
                "machine_id": record.get("sensor_id", "unknown"),  # Use sensor_id as machine_id for now
                "file_url": f"/uploads/{record.get('file_path', '').split('/')[-1]}" if record.get('file_path') else "",
                "file_name": record.get("file_name", "Unknown"),
                "sensor_position": "Drive End",  # Default value
                "axis": "Horizontal",  # Default value
                "sampling_rate": 12000,  # Default value
                "measurement_date": record.get("timestamp", record.get("created_at", "")),
                "created_at": record.get("created_at", record.get("timestamp", "")),
                "processed": record.get("status") == "processed"
            }
            supabase_records.append(converted_record)
    except Exception as e:
        print(f"Error accessing Supabase local records: {e}")
    
    # Combine records from both sources, avoiding duplicates
    all_records = list(vibration_records_db.values())
    
    # Add Supabase records that aren't already in the in-memory database
    existing_ids = set(vibration_records_db.keys())
    for record in supabase_records:
        if record["id"] not in existing_ids:
            all_records.append(record)
    
    print(f"Total records returned: {len(all_records)}")
    return all_records

@router.get("/vibrations/machine/{machine_id}")
async def get_vibration_records_by_machine(machine_id: str):
    """Get vibration records for a specific machine"""
    records = [r for r in vibration_records_db.values() if r.get("machine_id") == machine_id]
    return records

@router.post("/vibrations")
async def create_vibration_record(record: VibrationRecordCreate):
    """Create a new vibration record"""
    record_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    new_record = {
        "id": record_id,
        "created_at": now,
        **record.dict()
    }
    
    vibration_records_db[record_id] = new_record
    return new_record

@router.delete("/vibrations/{record_id}")
async def delete_vibration_record(record_id: str):
    """Delete a vibration record"""
    if record_id not in vibration_records_db:
        raise HTTPException(status_code=404, detail="Vibration record not found")
    
    del vibration_records_db[record_id]
    return {"message": "Vibration record deleted successfully"}

@router.get("/debug/storage")
async def debug_storage():
    """Debug endpoint to see what's in each storage system"""
    from ...services.supabase_service import SupabaseService
    
    supabase_service = SupabaseService()
    local_records = getattr(supabase_service, '_local_records', {})
    local_diagnoses = getattr(supabase_service, '_local_diagnoses', {})
    local_fault_detections = getattr(supabase_service, '_local_fault_detections', {})
    
    return {
        "in_memory_db": {
            "vibration_records": len(vibration_records_db),
            "records": list(vibration_records_db.keys())
        },
        "supabase_local": {
            "vibration_records": len(local_records),
            "diagnoses": len(local_diagnoses),
            "fault_detections": len(local_fault_detections),
            "record_ids": list(local_records.keys())
        },
        "sample_records": {
            "in_memory": list(vibration_records_db.values())[:2],
            "supabase_local": list(local_records.values())[:2]
        }
    }

@router.post("/debug/sync-storage")
async def sync_storage():
    """Sync records from Supabase local storage to in-memory database"""
    from ...services.supabase_service import SupabaseService
    
    supabase_service = SupabaseService()
    local_records = getattr(supabase_service, '_local_records', {})
    
    synced_count = 0
    
    for record_id, record in local_records.items():
        if record_id not in vibration_records_db:
            # Convert Supabase record format to in-memory format
            converted_record = {
                "id": record_id,
                "machine_id": record.get("machine_id", record.get("sensor_id", "unknown")),
                "file_url": f"/uploads/{record.get('file_path', '').split('/')[-1]}" if record.get('file_path') else "",
                "file_name": record.get("file_name", "Unknown"),
                "sensor_position": record.get("sensor_position", "Drive End"),
                "axis": record.get("axis", "Horizontal"),
                "sampling_rate": record.get("sampling_rate", 12000),
                "measurement_date": record.get("timestamp", record.get("created_at", "")),
                "created_at": record.get("created_at", record.get("timestamp", "")),
                "processed": record.get("status") == "processed"
            }
            
            vibration_records_db[record_id] = converted_record
            synced_count += 1
    
    return {
        "message": f"Synced {synced_count} records from Supabase local storage to in-memory database",
        "total_records_now": len(vibration_records_db)
    }
