from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from .config import settings

bearer_scheme = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Dict[str, Any]:
    if not settings.supabase_url:
        raise HTTPException(status_code=500, detail="SUPABASE_URL not configured")

    token = credentials.credentials
    auth_url = settings.supabase_url.rstrip("/") + "/auth/v1/user"

    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": settings.supabase_service_key or "",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(auth_url, headers=headers)

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = resp.json()
    # Expected fields: id, aud, role, email, etc.
    if not user or "id" not in user:
        raise HTTPException(status_code=401, detail="Invalid user payload")

    return user
