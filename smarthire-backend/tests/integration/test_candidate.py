"""Integration tests for candidate endpoints.

These tests mock the CandidateService to avoid DB calls.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient
from jose import jwt

from smarthire.config import get_settings

_S = get_settings()


def _token(sub: str = "test@example.com") -> str:
    payload = {
        "sub": sub,
        "exp": int((datetime.now(tz=timezone.utc) + timedelta(hours=1)).timestamp()),
    }
    return jwt.encode(payload, _S.jwt_secret, algorithm=_S.jwt_algorithm)


@pytest.mark.asyncio
async def test_add_candidate_returns_201(http_client: AsyncClient) -> None:
    mock_candidate = MagicMock()
    mock_candidate.id = 99
    with patch(
        "smarthire.routers.candidate.CandidateService.add_candidate",
        new=AsyncMock(return_value=mock_candidate),
    ):
        resp = await http_client.post(
            "/candidateData/addCandidateData",
            json={"candidateName": "Jane Doe", "isReferral": False, "isRehire": False},
            headers={"Authorization": f"Bearer {_token()}"},
        )
    assert resp.status_code == 200
    body = resp.json()
    assert body["message"] == "Candidate added successfully"


@pytest.mark.asyncio
async def test_get_candidate_not_found(http_client: AsyncClient) -> None:
    with patch(
        "smarthire.routers.candidate.CandidateService.get_candidate",
        new=AsyncMock(return_value=None),
    ):
        resp = await http_client.get(
            "/candidateData/getCandidateData/9999",
            headers={"Authorization": f"Bearer {_token()}"},
        )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_search_candidates(http_client: AsyncClient) -> None:
    with patch(
        "smarthire.routers.candidate.CandidateService.search",
        new=AsyncMock(return_value=([], 0)),
    ):
        resp = await http_client.post(
            "/candidateData/searchCandidates",
            json={"page": 0, "size": 20},
            headers={"Authorization": f"Bearer {_token()}"},
        )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_search_requires_auth(http_client: AsyncClient) -> None:
    resp = await http_client.post(
        "/candidateData/searchCandidates",
        json={"page": 0, "size": 20},
    )
    assert resp.status_code == 401
