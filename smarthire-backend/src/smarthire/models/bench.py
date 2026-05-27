"""Bench data models."""

from datetime import date, datetime

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from smarthire.models.base import AuditMixin, Base

_SCHEMA = "smarthire"


class BenchBatch(AuditMixin, Base):
    __tablename__ = "bench_batch"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    batch_name: Mapped[str | None] = mapped_column(String(255))
    upload_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=False))
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class BenchData(AuditMixin, Base):
    __tablename__ = "bench_data"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    batch_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.bench_batch.id")
    )
    employee_id: Mapped[str | None] = mapped_column(String(50))
    employee_name: Mapped[str | None] = mapped_column(String(255))
    technology_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.technology_master.id")
    )
    practice_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.practice_master.id")
    )
    skill_group_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.skill_group_master.id")
    )
    bench_start_date: Mapped[date | None] = mapped_column(Date)
    location_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.location_master.id")
    )
    status_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.bench_status_master.id")
    )
