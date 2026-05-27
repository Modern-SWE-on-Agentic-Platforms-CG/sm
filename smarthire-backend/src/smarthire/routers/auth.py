"""Auth and health endpoints."""

import logging
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from smarthire.auth.dependencies import get_current_user
from smarthire.schemas.auth import SessionValidationResponse, ValidateSessionRequest
from smarthire.schemas.common import ResponseDto, ok_response
from smarthire.services.keycloak_session import validate_session

logger = logging.getLogger(__name__)

router = APIRouter(tags=["auth"])


@router.get("/health")
async def health() -> dict[str, str]:
    """Public health-check endpoint — no JWT required."""
    return {"status": "ok"}


@router.post(
    "/login/validateSession",
    response_model=ResponseDto,
    dependencies=[Depends(get_current_user)],
)
async def validate_session_endpoint(
    request: ValidateSessionRequest,
) -> ResponseDto:
    """Validate an active session and detect duplicate logins.

    Requires a valid JWT bearer token in the Authorization header.
    """
    result: SessionValidationResponse = await validate_session(request.user_name)
    return ok_response(result.model_dump(), message="Session validated")
