"""Candidate-related SQLAlchemy models."""

from datetime import date
from decimal import Decimal

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from smarthire.models.base import AuditMixin, Base

_SCHEMA = "smarthire"


class CandidateDetail(AuditMixin, Base):
    __tablename__ = "candidate_detail"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    candidate_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email_id: Mapped[str | None] = mapped_column(String(255))
    mobile_number: Mapped[str | None] = mapped_column(String(20))
    current_company: Mapped[str | None] = mapped_column(String(255))
    current_location: Mapped[str | None] = mapped_column(String(100))
    total_exp: Mapped[Decimal | None] = mapped_column(Numeric(4, 1))
    relevant_exp: Mapped[Decimal | None] = mapped_column(Numeric(4, 1))
    current_ctc: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    notice_period: Mapped[str | None] = mapped_column(String(50))
    account_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.account_master.id")
    )
    region: Mapped[str | None] = mapped_column(String(100))
    recvd_date: Mapped[date | None] = mapped_column(Date)
    is_referral: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    referrer_name: Mapped[str | None] = mapped_column(String(255))
    is_rehire: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    prescreen_id: Mapped[str | None] = mapped_column(String(100))
    duplicate_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    info_detail: Mapped["CandidateInfoDetail | None"] = relationship(
        back_populates="candidate", uselist=False, cascade="all, delete-orphan"
    )
    status_history: Mapped[list["CandidateStatus"]] = relationship(
        back_populates="candidate",
        order_by="CandidateStatus.status_start_date.desc()",
        cascade="all, delete-orphan",
    )
    skills: Mapped[list["CandidateSkill"]] = relationship(
        back_populates="candidate", cascade="all, delete-orphan"
    )
    panel_details: Mapped["CandidatePanelDetails | None"] = relationship(
        back_populates="candidate", uselist=False, cascade="all, delete-orphan"
    )
    comments: Mapped[list["CandidateComments"]] = relationship(
        back_populates="candidate",
        order_by="CandidateComments.created_date.desc()",
        cascade="all, delete-orphan",
    )


class CandidateInfoDetail(AuditMixin, Base):
    __tablename__ = "candidate_info_detail"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    candidate_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.candidate_detail.id"), nullable=False
    )
    offered_ctc: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    negotiated_ctc: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    date_of_joining: Mapped[date | None] = mapped_column(Date)
    joining_bonus: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    bu_approval: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    tower_approval: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    dg_approval: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    na_approval: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    arc_deviation_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deviation_reason: Mapped[str | None] = mapped_column(Text)
    l3_escalation_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    revisit_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    candidate: Mapped["CandidateDetail"] = relationship(back_populates="info_detail")


class CandidateStatus(AuditMixin, Base):
    """Status history — only one open record (status_end_date IS NULL) per candidate."""

    __tablename__ = "candidate_status"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    candidate_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.candidate_detail.id"), nullable=False
    )
    status_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.status_master.id"), nullable=False
    )
    status_start_date: Mapped[DateTime] = mapped_column(
        DateTime(timezone=False), nullable=False
    )
    status_end_date: Mapped[DateTime | None] = mapped_column(DateTime(timezone=False))
    changed_by: Mapped[str | None] = mapped_column(String(100))

    candidate: Mapped["CandidateDetail"] = relationship(back_populates="status_history")


class CandidateSkill(AuditMixin, Base):
    __tablename__ = "candidate_skill"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    candidate_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.candidate_detail.id"), nullable=False
    )
    technology_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.technology_master.id")
    )
    tower_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.tower_master.id")
    )
    practice_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.practice_master.id")
    )
    skill_group_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.skill_group_master.id")
    )
    primary_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    candidate: Mapped["CandidateDetail"] = relationship(back_populates="skills")


class CandidatePanelDetails(AuditMixin, Base):
    __tablename__ = "candidate_panel_details"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    candidate_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.candidate_detail.id"), nullable=False
    )
    l1_panel_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.employee_master.id")
    )
    l2_panel_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.employee_master.id")
    )
    l3_panel_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.employee_master.id")
    )
    rejection_reason_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.rejection_reason_master.id")
    )
    decline_reason_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.decline_reason_master.id")
    )
    l3_escalation_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    candidate: Mapped["CandidateDetail"] = relationship(back_populates="panel_details")


class CandidateComments(AuditMixin, Base):
    __tablename__ = "candidate_comments"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    candidate_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.candidate_detail.id"), nullable=False
    )
    comment_text: Mapped[str] = mapped_column(Text, nullable=False)
    attachment_s3_key: Mapped[str | None] = mapped_column(String(500))
    attachment_file_name: Mapped[str | None] = mapped_column(String(255))

    candidate: Mapped["CandidateDetail"] = relationship(back_populates="comments")
