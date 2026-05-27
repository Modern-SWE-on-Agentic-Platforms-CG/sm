"""Employee-related SQLAlchemy models."""

from sqlalchemy import BigInteger, Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from smarthire.models.base import AuditMixin, Base

_SCHEMA = "smarthire"


class EmployeeMaster(AuditMixin, Base):
    __tablename__ = "employee_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    employee_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str | None] = mapped_column(String(100))
    email_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    grade_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.grade_master.id")
    )
    practice_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.practice_master.id")
    )
    bu_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.bu_master.id")
    )
    supervisor_email: Mapped[str | None] = mapped_column(String(255))
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    profile_image_s3_key: Mapped[str | None] = mapped_column(String(500))

    role_details: Mapped[list["EmployeeRoleDetails"]] = relationship(
        back_populates="employee", cascade="all, delete-orphan"
    )
    technology_details: Mapped[list["EmployeeTechnologyDetails"]] = relationship(
        back_populates="employee", cascade="all, delete-orphan"
    )


class EmployeeRoleDetails(AuditMixin, Base):
    __tablename__ = "employee_role_details"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    employee_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.employee_master.id"), nullable=False
    )
    role_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.role_master.id"), nullable=False
    )
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    employee: Mapped["EmployeeMaster"] = relationship(back_populates="role_details")


class EmployeeTechnologyDetails(AuditMixin, Base):
    __tablename__ = "employee_technology_details"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    employee_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.employee_master.id"), nullable=False
    )
    technology_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.technology_master.id"), nullable=False
    )
    primary_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    employee: Mapped["EmployeeMaster"] = relationship(back_populates="technology_details")
