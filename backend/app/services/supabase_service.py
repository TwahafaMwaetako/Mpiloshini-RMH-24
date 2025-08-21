from typing import Tuple, Any, Dict, List, Optional
from ..core.config import settings
import datetime as _dt

try:
    from supabase import create_client, Client  # type: ignore
except Exception:  # pragma: no cover
    create_client = None
    Client = None  # type: ignore


class SupabaseService:
    _instance = None
    _local_records = {}
    _local_diagnoses = {}
    _local_fault_detections = {}
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SupabaseService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self) -> None:
        if hasattr(self, '_initialized'):
            return
        self._initialized = True
        if not settings.supabase_url or not settings.supabase_service_key:
            # Allow initialization in stub mode for local dev without envs
            self._client = None
        else:
            if create_client is None:
                raise RuntimeError("supabase client library not available")
            try:
                self._client: Client = create_client(
                    settings.supabase_url, 
                    settings.supabase_service_key,
                    options={
                        "schema": "public",
                        "auto_refresh_token": True,
                        "persist_session": True
                    }
                )
            except Exception as e:
                print(f"Failed to initialize Supabase client: {e}")
                # For development, allow fallback to None client
                self._client = None

    def create_signed_upload_url(self, file_name: str, content_type: str) -> Tuple[str, str]:
        raise NotImplementedError("Supabase signed upload URL (Python) not implemented")

    def create_vibration_record(self, payload: Any) -> Dict[str, Any]:
        if self._client is None:
            raise RuntimeError("Supabase client is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY")
        to_insert = {
            "sensor_id": payload.sensor_id,
            "file_path": payload.file_path,
            "timestamp": payload.timestamp.isoformat(),
            "status": "unprocessed",
        }
        resp = self._client.table("vibration_records").insert(to_insert).execute()
        if getattr(resp, "data", None):
            return resp.data[0]
        raise RuntimeError("Failed to insert vibration record into Supabase")

    def create_vibration_record_from_dict(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if self._client is None:
            # Fallback to in-memory storage for development
            import uuid
            record_id = str(uuid.uuid4())
            record = {
                "id": record_id,
                "sensor_id": payload["sensor_id"],
                "file_path": payload["file_path"],
                "timestamp": payload["timestamp"].isoformat() if hasattr(payload["timestamp"], "isoformat") else payload["timestamp"],
                "status": payload.get("status", "unprocessed"),
                "uploaded_by": payload.get("uploaded_by"),
                "created_at": payload.get("timestamp", "2025-01-21T12:00:00Z")
            }
            # Store in a simple in-memory dict for development
            SupabaseService._local_records[record_id] = record
            return record
            
        to_insert = {
            "sensor_id": payload["sensor_id"],
            "file_path": payload["file_path"],
            "timestamp": payload["timestamp"].isoformat() if hasattr(payload["timestamp"], "isoformat") else payload["timestamp"],
            "status": payload.get("status", "unprocessed"),
            "uploaded_by": payload.get("uploaded_by"),
        }
        resp = self._client.table("vibration_records").insert(to_insert).execute()
        if getattr(resp, "data", None):
            return resp.data[0]
        raise RuntimeError("Failed to insert vibration record into Supabase")

    def get_vibration_record(self, record_id: str) -> Optional[Dict[str, Any]]:
        if self._client is None:
            # Fallback to local storage
            return SupabaseService._local_records.get(record_id)
            
        resp = self._client.table("vibration_records").select("*").eq("id", record_id).single().execute()
        return getattr(resp, "data", None)

    def get_sensor(self, sensor_id: str) -> Optional[Dict[str, Any]]:
        if self._client is None:
            raise RuntimeError("Supabase client is not configured")
        resp = self._client.table("sensors").select("*").eq("id", sensor_id).single().execute()
        return getattr(resp, "data", None)

    def create_machine(self, name: str, type_: str, location: str | None = None) -> str:
        if self._client is None:
            raise RuntimeError("Supabase client is not configured")
        payload = {"name": name, "type": type_, "location": location}
        resp = self._client.table("machines").insert(payload).execute()
        data = getattr(resp, "data", None)
        if not data:
            raise RuntimeError("failed to insert machine")
        return data[0]["id"]

    def create_sensor(self, machine_id: str, position: str, axis: str, sampling_rate: float) -> str:
        if self._client is None:
            raise RuntimeError("Supabase client is not configured")
        payload = {
            "machine_id": machine_id,
            "position": position,
            "axis": axis,
            "sampling_rate": sampling_rate,
        }
        resp = self._client.table("sensors").insert(payload).execute()
        data = getattr(resp, "data", None)
        if not data:
            raise RuntimeError("failed to insert sensor")
        return data[0]["id"]

    def upsert_baseline(self, machine_id: str, feature_vector: Dict[str, Any]) -> str:
        if self._client is None:
            raise RuntimeError("Supabase client is not configured")
        payload = {"machine_id": machine_id, "feature_vector": feature_vector}
        resp = self._client.table("baseline_signatures").insert(payload).execute()
        data = getattr(resp, "data", None)
        if not data:
            raise RuntimeError("failed to insert baseline")
        return data[0]["id"]

    def insert_diagnosis(self, record_id: str, findings: List[Dict[str, Any]], health_score: int) -> str:
        if self._client is None:
            # Fallback to local storage
            import uuid
            diagnosis_id = str(uuid.uuid4())
            SupabaseService._local_diagnoses[diagnosis_id] = {
                "id": diagnosis_id,
                "record_id": record_id,
                "results": findings,
                "health_score": health_score,
                "created_at": "2025-01-21T12:00:00Z"
            }
            return diagnosis_id
            
        payload = {"record_id": record_id, "results": findings, "health_score": health_score}
        resp = self._client.table("diagnoses").insert(payload).execute()
        data = getattr(resp, "data", None)
        if not data:
            raise RuntimeError("failed to insert diagnosis")
        return data[0]["id"]

    def insert_fault_detections(self, record_id: str, findings: List[Dict[str, Any]]) -> None:
        if self._client is None:
            # Fallback to local storage
            for f in findings:
                import uuid
                detection_id = str(uuid.uuid4())
                SupabaseService._local_fault_detections[detection_id] = {
                    "id": detection_id,
                    "record_id": record_id,
                    "fault_type": f["fault_type"],
                    "severity_score": float(f.get("severity", 0.0)),
                    "confidence": float(f.get("confidence", 0.0)),
                    "details": f,
                    "created_at": "2025-01-21T12:00:00Z"
                }
            return
            
        rows = [
            {
                "record_id": record_id,
                "fault_type": f["fault_type"],
                "severity_score": float(f.get("severity", 0.0)),
                "confidence": float(f.get("confidence", 0.0)),
                "details": f,
            }
            for f in findings
        ]
        if rows:
            self._client.table("fault_detections").insert(rows).execute()

    def mark_record_processed(self, record_id: str) -> None:
        if self._client is None:
            # Fallback to local storage
            if record_id in SupabaseService._local_records:
                SupabaseService._local_records[record_id]["status"] = "processed"
            return
            
        self._client.table("vibration_records").update({"status": "processed"}).eq("id", record_id).execute()

    def download_storage_file(self, storage_path: str) -> bytes:
        # Check if it's a local file path
        if storage_path.startswith("local/"):
            # Local file fallback
            import os
            local_filename = storage_path.replace("local/", "")
            local_path = os.path.join("uploads", local_filename)
            if os.path.exists(local_path):
                with open(local_path, "rb") as f:
                    return f.read()
            else:
                raise RuntimeError(f"Local file not found: {local_path}")
        
        # Try Supabase storage
        if self._client is None:
            raise RuntimeError("Supabase client is not configured and file is not local")
        
        bucket = settings.supabase_bucket
        res = self._client.storage.from_(bucket).download(storage_path)
        if isinstance(res, bytes):
            return res
        data = getattr(res, "data", None)
        if isinstance(data, bytes):
            return data
        raise RuntimeError("Failed to download storage file")

    def upload_storage_file(self, storage_path: str, content: bytes, content_type: str = "text/csv") -> None:
        if self._client is None:
            raise RuntimeError("Supabase client is not configured")
        bucket = settings.supabase_bucket
        try:
            self._client.storage.from_(bucket).remove([storage_path])
        except Exception:
            pass
        res = self._client.storage.from_(bucket).upload(
            storage_path,
            content,
            {"contentType": content_type, "upsert": True},
        )
        # supabase-py raises on error; if returns dict, optionally verify 'error' key
        if isinstance(res, dict) and res.get("error"):
            raise RuntimeError(f"Upload failed: {res['error']}")

    def list_buckets(self) -> List[str]:
        if self._client is None:
            raise RuntimeError("Supabase client is not configured")
        buckets = self._client.storage.list_buckets() or []
        names: List[str] = []
        for b in buckets:
            if hasattr(b, "name"):
                names.append(getattr(b, "name"))
            elif isinstance(b, dict) and "name" in b:
                names.append(b["name"])
        return names

    def ensure_bucket(self, bucket_name: str) -> None:
        if self._client is None:
            raise RuntimeError("Supabase client is not configured")
        names = self.list_buckets()
        if bucket_name not in names:
            # private bucket
            self._client.storage.create_bucket(bucket_name, public=False)
    
    def get_latest_baseline(self, machine_id: str) -> Optional[Dict[str, Any]]:
        """Get the latest baseline signature for a machine"""
        if self._client is None:
            raise RuntimeError("Supabase client is not configured")
        try:
            resp = self._client.table("baseline_signatures").select("*").eq("machine_id", machine_id).order("created_at", desc=True).limit(1).execute()
            data = getattr(resp, "data", None)
            if data and len(data) > 0:
                return data[0]
            return None
        except Exception:
            return None
