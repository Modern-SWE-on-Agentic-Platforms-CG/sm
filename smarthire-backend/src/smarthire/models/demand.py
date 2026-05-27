"""Demand data models."""

from datetime import date
from datetime import datetime

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from smarthire.models.base import AuditMixin, Base

_SCHEMA = "smarthire"


class DemandBatch(AuditMixin, Base):
    __tablename__ = "demand_batch"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    batch_name: Mapped[str | None] = mapped_column(String(255))
    upload_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=False))
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class DemandData(AuditMixin, Base):
    __tablename__ = "demand_data"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    batch_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.demand_batch.id")
    )
    technology_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.technology_master.id")
    )
    skill_group_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.skill_group_master.id")
    )
    grade_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.grade_master.id")
    )
    account_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.account_master.id")
    )
    market_unit_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.market_unit.id")
    )
    location_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.location_master.id")
    )
    demand_type: Mapped[str | None] = mapped_column(String(50))
    role_start_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str | None] = mapped_column(String(50), default="Open")
    quantity: Mapped[int | None] = mapped_column(Integer)
