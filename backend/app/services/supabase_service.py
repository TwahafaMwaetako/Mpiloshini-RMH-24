from typing import Tuple, Any, Dict
from ..core.config import settings

try:
    from supabase import create_client, Client  # type: ignore
except Exception:  # pragma: no cover
    create_client = None
    Client = None  # type: ignore


class SupabaseService:
    def __init__(self) -> None:
        if not settings.supabase_url or not settings.supabase_service_key:
            # Allow initialization in stub mode for local dev without envs
            self._client = None
        else:
            if create_client is None:
                raise RuntimeError("supabase client library not available")
            self._client: Client = create_client(
                settings.supabase_url, settings.supabase_service_key
            )

    def create_signed_upload_url(self, file_name: str, content_type: str) -> Tuple[str, str]:
        # Note: Signed upload URLs may not be supported by the current Python storage client.
        # This is intentionally left unimplemented pending storage3 support parity.
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
            raise RuntimeError("Supabase client is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY")
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
