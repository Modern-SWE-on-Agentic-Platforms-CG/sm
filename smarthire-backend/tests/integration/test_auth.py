"""Integration tests for authentication endpoints (T039).

These tests use the in-process FastAPI test client with the DB session override.
They do not require a running Keycloak instance — the session service is mocked.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient
from jose import jwt

from smarthire.config import get_settings

_S = get_settings()


def _valid_token(sub: str = "user@example.com") -> str:
    payload = {
        "sub": sub,
        "exp": int((datetime.now(tz=timezone.utc) + timedelta(hours=1)).timestamp()),
    }
    return jwt.encode(payload, _S.jwt_secret, algorithm=_S.jwt_algorithm)


def _expired_token() -> str:
    payload = {
        "sub": "user@example.com",
        "exp": int((datetime.now(tz=timezone.utc) - timedelta(seconds=1)).timestamp()),
    }
    return jwt.encode(payload, _S.jwt_secret, algorithm=_S.jwt_algorithm)


# ---------------------------------------------------------------------------
# /health — public, no token required
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_health_no_token(http_client: AsyncClient) -> None:
    resp = await http_client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_health_with_token_still_200(http_client: AsyncClient) -> None:
    resp = await http_client.get(
        "/health", headers={"Authorization": f"Bearer {_valid_token()}"}
    )
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# /login/validateSession — requires valid JWT
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_validate_session_no_token_returns_401(http_client: AsyncClient) -> None:
    resp = await http_client.post(
        "/login/validateSession", json={"userName": "user@example.com"}
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_validate_session_expired_token_returns_401(http_client: AsyncClient) -> None:
    resp = await http_client.post(
        "/login/validateSession",
        json={"userName": "user@example.com"},
        headers={"Authorization": f"Bearer {_expired_token()}"},
    )
    assert resp.status_code == 401


from smarthire.schemas.auth import SessionValidationResponse


@pytest.mark.asyncio
async def test_validate_session_valid_token_returns_200(http_client: AsyncClient) -> None:
    mock_result = SessionValidationResponse(
        status="ok", user_name="user@example.com", session_count=1
    )
    with patch(
        "smarthire.routers.auth.validate_session",
        new=AsyncMock(return_value=mock_result),
    ):
        resp = await http_client.post(
            "/login/validateSession",
            json={"userName": "user@example.com"},
            headers={"Authorization": f"Bearer {_valid_token()}"},
        )
    assert resp.status_code == 200
    body = resp.json()
    assert body["message"] == "Session validated"
