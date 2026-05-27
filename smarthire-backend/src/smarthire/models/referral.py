"""Referral candidate models."""

from decimal import Decimal

from sqlalchemy import BigInteger, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from smarthire.models.base import AuditMixin, Base

_SCHEMA = "smarthire"


class ReferralCandidateInfo(AuditMixin, Base):
    __tablename__ = "referral_candidate_info"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    referrer_employee_id: Mapped[str | None] = mapped_column(String(50))
    referrer_name: Mapped[str | None] = mapped_column(String(255))
    candidate_name: Mapped[str | None] = mapped_column(String(255))
    email_id: Mapped[str | None] = mapped_column(String(255))
    mobile_number: Mapped[str | None] = mapped_column(String(20))
    total_exp: Mapped[Decimal | None] = mapped_column(Numeric(4, 1))
    current_ctc: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    notice_period: Mapped[str | None] = mapped_column(String(50))
    bu_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.referral_bu_master.id")
    )
    account_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.account_master.id")
    )
    resume_s3_key: Mapped[str | None] = mapped_column(String(500))
    image_s3_key: Mapped[str | None] = mapped_column(String(500))

    skills: Mapped[list["ReferralCandidateSkill"]] = relationship(
        back_populates="referral_candidate", cascade="all, delete-orphan"
    )
    certifications: Mapped[list["ReferralCandidateCertification"]] = relationship(
        back_populates="referral_candidate", cascade="all, delete-orphan"
    )


class ReferralCandidateSkill(AuditMixin, Base):
    __tablename__ = "referral_candidate_skill"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    referral_candidate_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.referral_candidate_info.id"), nullable=False
    )
    technology_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.referral_technology_master.id")
    )

    referral_candidate: Mapped["ReferralCandidateInfo"] = relationship(back_populates="skills")


class ReferralCandidateCertification(AuditMixin, Base):
    __tablename__ = "referral_candidate_certification"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    referral_candidate_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.referral_candidate_info.id"), nullable=False
    )
    certification_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.referral_certifications_master.id")
    )

    referral_candidate: Mapped["ReferralCandidateInfo"] = relationship(
        back_populates="certifications"
    )
