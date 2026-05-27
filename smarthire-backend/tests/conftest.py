"""Pytest configuration and shared fixtures.

The async DB session fixture creates a temporary test schema
(SMARTHIRE_TEST_SCHEMA env var) so integration tests never touch production data.
"""

from __future__ import annotations

import os
import asyncio
from collections.abc import AsyncGenerator
from typing import Any

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from smarthire.config import get_settings
from smarthire.database import get_db_session
from smarthire.main import app
from smarthire.models.base import Base


@pytest.fixture(scope="session")
def settings():
    return get_settings()


@pytest.fixture(scope="session")
def test_schema(settings) -> str:
    return settings.smarthire_test_schema


@pytest_asyncio.fixture(scope="session")
async def db_engine(settings, test_schema):
    """Create an async engine pointing at the test schema.

    The test schema is created before the session and dropped afterwards.
    """
    # Use the main DATABASE_URL but override search_path to test schema
    engine = create_async_engine(
        settings.database_url,
        echo=False,
        pool_pre_ping=True,
        connect_args={"server_settings": {"search_path": test_schema}},
    )
    async with engine.begin() as conn:
        await conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {test_schema}"))
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.execute(text(f"DROP SCHEMA IF EXISTS {test_schema} CASCADE"))

    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Yield a test AsyncSession that rolls back after each test."""
    factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
        bind=db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )
    async with factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def http_client() -> AsyncGenerator[AsyncClient, None]:
    """HTTPX AsyncClient with no DB override — for tests that don't touch the DB."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """HTTPX AsyncClient wired to the FastAPI test app with DB override."""

    async def override_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db_session] = override_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()
