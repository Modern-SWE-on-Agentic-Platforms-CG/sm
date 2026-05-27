"""Development-only router — issues mock JWT tokens for local testing.

This router is ONLY registered when the APP_ENV environment variable is set
to "development" (the default for local runs).  It MUST NOT be available in
staging or production environments.

Endpoint:
    POST /dev/token   — returns a signed JWT for a given role, no password needed.
"""

from __future__ import annotations

import datetime
import logging
from typing import Any

from fastapi import APIRouter
from jose import jwt
from pydantic import BaseModel

from smarthire.config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dev", tags=["dev"])


class MockLoginRequest(BaseModel):
    role: str
    email: str
    name: str


@router.post("/token")
async def dev_token(req: MockLoginRequest) -> dict[str, Any]:
    """Issue a signed JWT for a mock user — local development only."""
    settings = get_settings()
    payload = {
        "sub": req.email,
        "emp_id": "dev-001",
        "email": req.email,
        "name": req.name,
        "roles": [req.role],
        "exp": datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=12),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    logger.info("Dev token issued for role=%s email=%s", req.role, req.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": 43200,
        "role": req.role,
    }
