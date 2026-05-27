"""Keycloak session validation service."""

import logging

from smarthire.schemas.auth import SessionValidationResponse
from smarthire.utils.keycloak_client import KeycloakClient

logger = logging.getLogger(__name__)

_keycloak = KeycloakClient()


async def validate_session(username: str) -> SessionValidationResponse:
    """Check whether the user has an active session and detect duplicates.

    Args:
        username: The email / username of the authenticated user.

    Returns:
        SessionValidationResponse with status "ok", "duplicate", or "not_found".
    """
    try:
        count = await _keycloak.count_active_sessions(username)
    except Exception:
        logger.warning("Keycloak unavailable — treating session as ok")
        return SessionValidationResponse(status="ok", user_name=username, session_count=0)

    if count == 0:
        return SessionValidationResponse(status="not_found", user_name=username, session_count=0)
    if count > 1:
        return SessionValidationResponse(
            status="duplicate", user_name=username, session_count=count
        )
    return SessionValidationResponse(status="ok", user_name=username, session_count=count)
