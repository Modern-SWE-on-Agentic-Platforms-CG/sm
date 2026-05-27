"""Master / lookup tables — all follow the same id / name / active_flag pattern."""

from sqlalchemy import BigInteger, Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from smarthire.models.base import AuditMixin, Base

__all__ = [
    "GradeMaster",
    "BuMaster",
    "PracticeMaster",
    "TechnologyMaster",
    "TowerMaster",
    "SkillGroupMaster",
    "StatusMaster",
    "RoleMaster",
    "AccountMaster",
    "MarketUnit",
    "LocationMaster",
    "InterviewTypeMaster",
    "SourceMaster",
    "RejectionReasonMaster",
    "DeclineReasonMaster",
    "DataTypeMaster",
    "NotificationTypeMaster",
    "BenchStatusMaster",
    "ReferralBuMaster",
    "ReferralTechnologyMaster",
    "ReferralCertificationsMaster",
    "SkillGroupDlMaster",
    "TowerLeadMaster",
]

_SCHEMA = "smarthire"


def _master(table_name: str, extra_columns: dict | None = None):  # type: ignore[type-arg]
    """Factory that builds a simple master-table model class."""

    class_attrs: dict = {  # type: ignore[type-arg]
        "__tablename__": table_name,
        "__table_args__": {"schema": _SCHEMA},
        "id": mapped_column(BigInteger, primary_key=True, autoincrement=True),
        "name": mapped_column(String(255), nullable=False),
        "active_flag": mapped_column(Boolean, default=True, nullable=False),
    }
    if extra_columns:
        class_attrs.update(extra_columns)

    return type(
        table_name.replace("_", " ").title().replace(" ", ""),
        (AuditMixin, Base),
        class_attrs,
    )


# ---------------------------------------------------------------------------
# Simple master tables (id, name, active_flag, audit)
# ---------------------------------------------------------------------------

class GradeMaster(AuditMixin, Base):
    __tablename__ = "grade_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class BuMaster(AuditMixin, Base):
    __tablename__ = "bu_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class PracticeMaster(AuditMixin, Base):
    __tablename__ = "practice_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class TechnologyMaster(AuditMixin, Base):
    __tablename__ = "technology_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class TowerMaster(AuditMixin, Base):
    __tablename__ = "tower_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class SkillGroupMaster(AuditMixin, Base):
    __tablename__ = "skill_group_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class StatusMaster(AuditMixin, Base):
    __tablename__ = "status_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_terminal: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class RoleMaster(AuditMixin, Base):
    __tablename__ = "role_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class AccountMaster(AuditMixin, Base):
    __tablename__ = "account_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class MarketUnit(AuditMixin, Base):
    __tablename__ = "market_unit"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    bu_id: Mapped[int | None] = mapped_column(BigInteger)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class LocationMaster(AuditMixin, Base):
    __tablename__ = "location_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class InterviewTypeMaster(AuditMixin, Base):
    __tablename__ = "interview_type_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class SourceMaster(AuditMixin, Base):
    __tablename__ = "source_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class RejectionReasonMaster(AuditMixin, Base):
    __tablename__ = "rejection_reason_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class DeclineReasonMaster(AuditMixin, Base):
    __tablename__ = "decline_reason_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class DataTypeMaster(AuditMixin, Base):
    __tablename__ = "data_type_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class NotificationTypeMaster(AuditMixin, Base):
    __tablename__ = "notification_type_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class BenchStatusMaster(AuditMixin, Base):
    __tablename__ = "bench_status_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class ReferralBuMaster(AuditMixin, Base):
    __tablename__ = "referral_bu_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class ReferralTechnologyMaster(AuditMixin, Base):
    __tablename__ = "referral_technology_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class ReferralCertificationsMaster(AuditMixin, Base):
    __tablename__ = "referral_certifications_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class SkillGroupDlMaster(AuditMixin, Base):
    """Distribution list email per skill group — used by aging SLA alerts."""

    __tablename__ = "skill_group_dl_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    skill_group_id: Mapped[int | None] = mapped_column(BigInteger)
    dl_email: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class TowerLeadMaster(AuditMixin, Base):
    """Tower lead email — used by tower aging SLA alerts."""

    __tablename__ = "tower_lead_master"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    tower_id: Mapped[int | None] = mapped_column(BigInteger)
    lead_email: Mapped[str] = mapped_column(String(255), nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
