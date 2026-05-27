"""SQLAlchemy declarative base and shared audit mixin."""

from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Project-wide declarative base.

    All models must inherit from this class so their metadata is registered
    for Alembic autogenerate and for the test schema fixture.
    """


class AuditMixin:
    """Adds created/updated audit columns to every inheriting model."""

    created_by: Mapped[str | None] = mapped_column(String(100))
    created_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False), server_default=func.now()
    )
    updated_by: Mapped[str | None] = mapped_column(String(100))
    updated_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False), onupdate=func.now()
    )
