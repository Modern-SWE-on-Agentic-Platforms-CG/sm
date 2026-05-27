"""Generic lookup repository used by all stories."""

from __future__ import annotations

from typing import Any, TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.models.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class LookupRepository:
    """Generic async repository for master/lookup tables."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_all(self, model_class: type[ModelT]) -> list[ModelT]:
        """Return every row in a master table."""
        result = await self._session.execute(select(model_class))
        return list(result.scalars().all())

    async def get_active(self, model_class: type[ModelT]) -> list[ModelT]:
        """Return rows where active_flag is True."""
        stmt = select(model_class).where(
            getattr(model_class, "active_flag", None) == True  # noqa: E712
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, model_class: type[ModelT], record_id: int) -> ModelT | None:
        """Return a single row by primary key, or None."""
        result = await self._session.execute(
            select(model_class).where(model_class.id == record_id)  # type: ignore[attr-defined]
        )
        return result.scalar_one_or_none()
