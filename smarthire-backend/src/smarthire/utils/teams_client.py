"""Microsoft Teams meeting client.

Uses MS Graph API (https://graph.microsoft.com/v1.0) to create online meetings.
Credentials are client-credentials flow (app-only) using MS_TENANT_ID,
MS_CLIENT_ID, MS_CLIENT_SECRET from settings.
"""

from __future__ import annotations

import logging
from datetime import datetime

import httpx

from smarthire.config import get_settings

logger = logging.getLogger(__name__)

_GRAPH_BASE = "https://graph.microsoft.com/v1.0"
_TOKEN_URL_TMPL = "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"


class TeamsClient:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._access_token: str | None = None

    async def _get_access_token(self) -> str:
        """Obtain a client-credentials access token from Azure AD."""
        url = _TOKEN_URL_TMPL.format(tenant=self._settings.ms_tenant_id)
        data = {
            "grant_type": "client_credentials",
            "client_id": self._settings.ms_client_id,
            "client_secret": self._settings.ms_client_secret,
            "scope": "https://graph.microsoft.com/.default",
        }
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, data=data)
            resp.raise_for_status()
            return resp.json()["access_token"]

    async def create_meeting(
        self,
        subject: str,
        start_time: datetime,
        end_time: datetime,
        organizer_email: str,
    ) -> str:
        """Create a Teams online meeting and return the join URL.

        Args:
            subject: Meeting title.
            start_time: Start time (UTC).
            end_time: End time (UTC).
            organizer_email: Organizer UPN / email for /users/{email}/onlineMeetings.

        Returns:
            The joinWebUrl string from Graph API response.

        Raises:
            httpx.HTTPStatusError: If Graph API returns non-2xx.
        """
        token = await self._get_access_token()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        payload = {
            "subject": subject,
            "startDateTime": start_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "endDateTime": end_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        url = f"{_GRAPH_BASE}/users/{organizer_email}/onlineMeetings"
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            join_url: str = data["joinWebUrl"]
            logger.info("Teams meeting created for %s: %s", organizer_email, join_url)
            return join_url


teams_client = TeamsClient()
