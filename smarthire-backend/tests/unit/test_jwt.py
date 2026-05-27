"""Unit tests for JWT token verification (T038).

Tests run without a database — only the verify_token() function is exercised.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException
from jose import jwt

from smarthire.auth.jwt import verify_token
from smarthire.config import get_settings

_SETTINGS = get_settings()
_SECRET = _SETTINGS.jwt_secret
_ALGO = _SETTINGS.jwt_algorithm


def _make_token(payload: dict, secret: str = _SECRET, algorithm: str = _ALGO) -> str:
    return jwt.encode(payload, secret, algorithm=algorithm)


def _exp(delta: timedelta) -> int:
    return int((datetime.now(tz=timezone.utc) + delta).timestamp())


# ---------------------------------------------------------------------------
# Happy-path
# ---------------------------------------------------------------------------


def test_valid_token_returns_payload() -> None:
    payload = {"sub": "user@example.com", "exp": _exp(timedelta(hours=1))}
    token = _make_token(payload)
    result = verify_token(token)
    assert result["sub"] == "user@example.com"


def test_extra_claims_preserved() -> None:
    payload = {
        "sub": "user@example.com",
        "exp": _exp(timedelta(hours=1)),
        "role": "recruiter",
    }
    token = _make_token(payload)
    result = verify_token(token)
    assert result["role"] == "recruiter"


# ---------------------------------------------------------------------------
# Failure cases — all must raise HTTP 401
# ---------------------------------------------------------------------------


def test_expired_token_raises_401() -> None:
    payload = {"sub": "user@example.com", "exp": _exp(timedelta(seconds=-1))}
    token = _make_token(payload)
    with pytest.raises(HTTPException) as exc_info:
        verify_token(token)
    assert exc_info.value.status_code == 401


def test_wrong_secret_raises_401() -> None:
    payload = {"sub": "user@example.com", "exp": _exp(timedelta(hours=1))}
    token = _make_token(payload, secret="wrong-secret")
    with pytest.raises(HTTPException) as exc_info:
        verify_token(token)
    assert exc_info.value.status_code == 401


def test_malformed_token_raises_401() -> None:
    with pytest.raises(HTTPException) as exc_info:
        verify_token("this.is.not.a.jwt")
    assert exc_info.value.status_code == 401


def test_empty_string_raises_401() -> None:
    with pytest.raises(HTTPException) as exc_info:
        verify_token("")
    assert exc_info.value.status_code == 401
