"""Lookup (master data) service."""

from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.repositories.lookup_repo import LookupRepository


class LookupService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = LookupRepository(session)

    async def get_all(self, model_class: Any) -> list[Any]:
        return await self._repo.get_all(model_class)

    async def get_active(self, model_class: Any) -> list[Any]:
        return await self._repo.get_active(model_class)
