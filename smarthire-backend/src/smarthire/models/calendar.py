"""Calendar / interview slot models."""

from datetime import date, time

from sqlalchemy import BigInteger, Boolean, Date, ForeignKey, String, Text, Time, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from smarthire.models.base import AuditMixin, Base

_SCHEMA = "smarthire"


class InterviewerCalendarDetails(AuditMixin, Base):
    __tablename__ = "interviewer_calendar_details"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    interviewer_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.employee_master.id"), nullable=False
    )
    interviewer_email: Mapped[str | None] = mapped_column(String(255))
    interview_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time | None] = mapped_column(Time)
    interview_type_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.interview_type_master.id")
    )
    technology_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.technology_master.id")
    )
    account_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.account_master.id")
    )
    participation_type: Mapped[str | None] = mapped_column(String(50))
    booking_status: Mapped[str | None] = mapped_column(String(50), default="Free")
    candidate_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.candidate_detail.id")
    )
    feedback_status: Mapped[str | None] = mapped_column(String(50), default="Pending")
    feedback_submitted_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    meeting_link: Mapped[str | None] = mapped_column(String(1000))
    meeting_request_sent_flag: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    reminder_sent_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reschedule_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    cancellation_reason: Mapped[str | None] = mapped_column(Text)
    bu_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey(f"{_SCHEMA}.bu_master.id"))
    s3_file_key: Mapped[str | None] = mapped_column(String(500))

    recruiter_slot: Mapped["RecruiterCalendarDetails | None"] = relationship(
        back_populates="interviewer_slot", uselist=False, cascade="all, delete-orphan"
    )


class RecruiterCalendarDetails(AuditMixin, Base):
    __tablename__ = "recruiter_calendar_details"
    __table_args__ = (
        UniqueConstraint("interviewer_calendar_id", name="uq_recruiter_slot_per_interview"),
        {"schema": _SCHEMA},
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    recruiter_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.employee_master.id"), nullable=False
    )
    recruiter_email: Mapped[str | None] = mapped_column(String(255))
    interviewer_calendar_id: Mapped[int | None] = mapped_column(
        BigInteger,
        ForeignKey(f"{_SCHEMA}.interviewer_calendar_details.id"),
    )
    candidate_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.candidate_detail.id"), nullable=False
    )
    interview_type_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.interview_type_master.id")
    )
    technology_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.technology_master.id")
    )
    slot_date: Mapped[date | None] = mapped_column(Date)
    slot_start_time: Mapped[time | None] = mapped_column(Time)
    status: Mapped[str | None] = mapped_column(String(50), default="Scheduled")

    interviewer_slot: Mapped["InterviewerCalendarDetails | None"] = relationship(
        back_populates="recruiter_slot"
    )
