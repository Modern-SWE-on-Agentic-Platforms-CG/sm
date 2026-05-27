"""Contract test — every FastAPI route must appear in openapi.yaml and vice versa."""

from __future__ import annotations

import re
from pathlib import Path

import yaml
import pytest
from fastapi.routing import APIRoute

from smarthire.main import app

OPENAPI_PATH = (
    Path(__file__).parents[2]
    / "specs"
    / "001-smarthire-backend-platform"
    / "contracts"
    / "openapi.yaml"
)

# Paths that are infrastructure-only and intentionally excluded from the contract
_EXCLUDED_APP_PATHS = {"/docs", "/redoc", "/openapi.json"}


def _normalise(path: str) -> str:
    """Convert FastAPI {param:type} notation to OpenAPI {param} and strip trailing slash."""
    # FastAPI allows {param:path} for greedy path params; OpenAPI uses plain {param}
    path = re.sub(r"\{(\w+):[^}]+\}", r"{\1}", path)
    return path.rstrip("/")


def _load_openapi_paths() -> set[str]:
    with OPENAPI_PATH.open(encoding="utf-8") as fh:
        spec = yaml.safe_load(fh)
    return {_normalise(p) for p in spec.get("paths", {}).keys()}


def _collect_app_paths() -> set[str]:
    paths: set[str] = set()
    for route in app.routes:
        if isinstance(route, APIRoute):
            path = _normalise(route.path)
            if path not in _EXCLUDED_APP_PATHS:
                paths.add(path)
    return paths


@pytest.mark.skipif(not OPENAPI_PATH.exists(), reason="openapi.yaml not found")
def test_all_app_routes_in_contract() -> None:
    """Every registered FastAPI route must have a matching path in openapi.yaml."""
    app_paths = _collect_app_paths()
    contract_paths = _load_openapi_paths()
    missing = app_paths - contract_paths
    assert not missing, (
        f"Routes in app but missing from openapi.yaml:\n" + "\n".join(sorted(missing))
    )


@pytest.mark.skipif(not OPENAPI_PATH.exists(), reason="openapi.yaml not found")
def test_all_contract_paths_in_app() -> None:
    """Every path in openapi.yaml must have a matching route in the FastAPI app."""
    app_paths = _collect_app_paths()
    contract_paths = _load_openapi_paths()
    missing = contract_paths - app_paths
    assert not missing, (
        f"Paths in openapi.yaml but missing from app:\n" + "\n".join(sorted(missing))
    )
