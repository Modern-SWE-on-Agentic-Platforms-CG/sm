"""JWT token verification.

Validates HS256 tokens signed with the JWT_SECRET environment variable.
Raises HTTP 401 on any validation failure — never logs the raw token value.
"""

import logging
from typing import Any

from fastapi import HTTPException, status
from jose import JWTError, jwt

from smarthire.config import get_settings

logger = logging.getLogger(__name__)


def verify_token(token: str) -> dict[str, Any]:
    """Decode and verify a JWT bearer token.

    Args:
        token: The raw JWT string (without the "Bearer " prefix).

    Returns:
        The decoded payload as a dictionary.

    Raises:
        HTTPException(401): If the token is expired, malformed, or the
            signature does not match.
    """
    settings = get_settings()
    try:
        payload: dict[str, Any] = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except JWTError:
        # Deliberately vague message — do not reveal whether the token was
        # expired or had a bad signature (OWASP A07).
        logger.warning("JWT validation failed (token details not logged)")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
