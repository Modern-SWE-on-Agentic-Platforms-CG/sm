"""Integration tests for scheduling endpoints (US2)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient
from jose import jwt

from smarthire.config import get_settings

_S = get_settings()


def _token(sub: str = "interviewer@example.com") -> str:
    payload = {
        "sub": sub,
        "exp": int((datetime.now(tz=timezone.utc) + timedelta(hours=1)).timestamp()),
    }
    return jwt.encode(payload, _S.jwt_secret, algorithm=_S.jwt_algorithm)


@pytest.mark.asyncio
async def test_add_slot(http_client: AsyncClient) -> None:
    mock_slot = MagicMock()
    mock_slot.id = 1
    with patch(
        "smarthire.routers.scheduling.SchedulingService.add_slot",
        new=AsyncMock(return_value=mock_slot),
    ):
        resp = await http_client.post(
            "/calendar/addSlot",
            json={
                "interviewerId": 1,
                "slotStart": "2025-01-15T10:00:00",
                "slotEnd": "2025-01-15T11:00:00",
            },
            headers={"Authorization": f"Bearer {_token()}"},
        )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_book_slot(http_client: AsyncClient) -> None:
    mock_result = {"booking_id": 5, "interviewer_calendar_id": 1, "meeting_link": None}
    with patch(
        "smarthire.routers.scheduling.SchedulingService.book_slot",
        new=AsyncMock(return_value=mock_result),
    ):
        resp = await http_client.post(
            "/calendar/bookSlot",
            json={"interviewerCalendarId": 1, "candidateId": 10},
            headers={"Authorization": f"Bearer {_token()}"},
        )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_scheduling_requires_auth(http_client: AsyncClient) -> None:
    resp = await http_client.get("/calendar/getAvailableSlots/1")
    assert resp.status_code == 401
