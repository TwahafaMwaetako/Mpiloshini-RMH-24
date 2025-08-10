from typing import Tuple, Any
from ..core.config import settings


class SupabaseService:
    def __init__(self) -> None:
        # TODO: initialize supabase client with service key once available
        self._client = None
        if not settings.supabase_url or not settings.supabase_service_key:
            # Running in stub mode until env is configured
            pass

    def create_signed_upload_url(self, file_name: str, content_type: str) -> Tuple[str, str]:
        raise NotImplementedError("Supabase signed URL generation not implemented")

    def create_vibration_record(self, payload: Any):
        raise NotImplementedError("Supabase DB insert not implemented")
