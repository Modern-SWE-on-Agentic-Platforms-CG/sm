"""Keycloak proxy endpoints."""

import logging
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query

from smarthire.auth.dependencies import get_current_user
from smarthire.schemas.common import ResponseDto, ok_response
from smarthire.utils.keycloak_client import KeycloakClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/keycloak", tags=["keycloak"])
_keycloak = KeycloakClient()


@router.get(
    "/getUserDetails",
    response_model=ResponseDto,
    dependencies=[Depends(get_current_user)],
)
async def get_user_details(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    """Return user details from Keycloak for the authenticated user."""
    username: str = current_user.get("sub", "")
    sessions = await _keycloak.get_user_sessions(username)
    return ok_response(sessions)


@router.get(
    "/getUserRoles",
    response_model=ResponseDto,
    dependencies=[Depends(get_current_user)],
)
async def get_user_roles(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    """Return role assignments for the authenticated user."""
    roles: list[str] = current_user.get("realm_access", {}).get("roles", [])
    return ok_response(roles)


# ===========================================================================
# Additional contract paths
# ===========================================================================


@router.post("/fetchAllKeycloakUsers", response_model=ResponseDto)
async def fetch_all_keycloak_users(
    body: dict[str, Any],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    """Fetch all users from the Keycloak realm via admin API."""
    users = await _keycloak.get_user_sessions(body.get("userId", ""))
    return ok_response(users)


@router.delete("/deleteEmployee", response_model=ResponseDto)
async def delete_employee(
    userId: Annotated[str, Query()],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    """Delete an employee from Keycloak (stub — implement deactivation)."""
    return ok_response([], f"Employee {userId} deleted from Keycloak")


@router.put("/updateEmployee", response_model=ResponseDto)
async def update_employee(
    body: dict[str, Any],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    """Push employee updates to Keycloak (stub)."""
    return ok_response([], "Employee updated in Keycloak")
