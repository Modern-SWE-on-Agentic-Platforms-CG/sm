"""FastAPI dependency for authenticated requests.

Usage:
    from smarthire.auth.dependencies import get_current_user

    @router.get("/protected")
    async def protected(user: dict = Depends(get_current_user)):
        ...
"""

from typing import Annotated, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from smarthire.auth.jwt import verify_token

_bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)],
) -> dict[str, Any]:
    """Extract and validate the JWT bearer token from the Authorization header.

    Raises:
        HTTPException(401): If no credentials are provided or the token is invalid.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return verify_token(credentials.credentials)
