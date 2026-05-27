"""Keycloak Admin API client."""

import logging
from typing import Any

import httpx
from fastapi import HTTPException, status

from smarthire.config import get_settings

logger = logging.getLogger(__name__)


class KeycloakClient:
    """Async Keycloak Admin API client using httpx."""

    def __init__(self) -> None:
        self._settings = get_settings()

    def _base_url(self) -> str:
        s = self._settings
        return f"{s.keycloak_url}/auth/admin/realms/{s.keycloak_realm}"

    async def _get_admin_token(self) -> str:
        """Obtain a Keycloak admin access token."""
        s = self._settings
        token_url = f"{s.keycloak_url}/auth/realms/master/protocol/openid-connect/token"
        async with httpx.AsyncClient(verify=s.keycloak_verify_ssl) as client:
            resp = await client.post(
                token_url,
                data={
                    "client_id": "admin-cli",
                    "username": s.keycloak_admin_username,
                    "password": s.keycloak_admin_password,
                    "grant_type": "password",
                },
            )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Keycloak admin authentication failed",
                )
            token: str = resp.json()["access_token"]
            return token

    async def get_user_sessions(self, username: str) -> list[dict[str, Any]]:
        """Return active sessions for a user identified by username/email."""
        admin_token = await self._get_admin_token()
        base = self._base_url()
        s = self._settings

        try:
            async with httpx.AsyncClient(verify=s.keycloak_verify_ssl) as client:
                # First look up the user by username
                users_resp = await client.get(
                    f"{base}/users",
                    params={"username": username, "exact": "true"},
                    headers={"Authorization": f"Bearer {admin_token}"},
                )
                users_resp.raise_for_status()
                users: list[dict[str, Any]] = users_resp.json()
                if not users:
                    return []

                user_id = users[0]["id"]
                sessions_resp = await client.get(
                    f"{base}/users/{user_id}/sessions",
                    headers={"Authorization": f"Bearer {admin_token}"},
                )
                sessions_resp.raise_for_status()
                sessions: list[dict[str, Any]] = sessions_resp.json()
                return sessions
        except httpx.HTTPError as exc:
            logger.error("Keycloak session lookup failed: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Keycloak service unavailable",
            ) from exc

    async def count_active_sessions(self, username: str) -> int:
        """Return the number of active sessions for a user."""
        sessions = await self.get_user_sessions(username)
        return len(sessions)
