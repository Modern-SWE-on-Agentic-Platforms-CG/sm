"""Feedback form and submission models."""

from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from smarthire.models.base import AuditMixin, Base

_SCHEMA = "smarthire"


class FeedbackTemplate(AuditMixin, Base):
    __tablename__ = "feedback_template"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    template_name: Mapped[str] = mapped_column(String(255), nullable=False)
    technology_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.technology_master.id")
    )
    practice_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.practice_master.id")
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    form_nodes: Mapped[list["FeedbackFormDetails"]] = relationship(
        back_populates="template", cascade="all, delete-orphan"
    )


class FeedbackFormDetails(AuditMixin, Base):
    """Hierarchical feedback form node — sections and questions."""

    __tablename__ = "feedback_form_details"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    template_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.feedback_template.id"), nullable=False
    )
    parent_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.feedback_form_details.id")
    )
    heading: Mapped[str] = mapped_column(String(500), nullable=False)
    data_type_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.data_type_master.id")
    )
    required_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    order_index: Mapped[int | None] = mapped_column(Integer)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    template: Mapped["FeedbackTemplate"] = relationship(back_populates="form_nodes")
    children: Mapped[list["FeedbackFormDetails"]] = relationship(
        back_populates="parent",
        cascade="all, delete-orphan",
        foreign_keys=[parent_id],
    )
    parent: Mapped["FeedbackFormDetails | None"] = relationship(
        back_populates="children",
        remote_side=[id],  # type: ignore[list-item]
        foreign_keys=[parent_id],
    )


class FeedbackFormPlaceholder(AuditMixin, Base):
    __tablename__ = "feedback_form_placeholder"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    form_detail_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.feedback_form_details.id")
    )
    placeholder_text: Mapped[str | None] = mapped_column(Text)
    active_flag: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class InterviewerFeedback(AuditMixin, Base):
    __tablename__ = "interviewer_feedback"
    __table_args__ = {"schema": _SCHEMA}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    interviewer_calendar_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey(f"{_SCHEMA}.interviewer_calendar_details.id"),
        unique=True,
        nullable=False,
    )
    candidate_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.candidate_detail.id")
    )
    template_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey(f"{_SCHEMA}.feedback_template.id")
    )
    response_json: Mapped[dict | None] = mapped_column(JSONB)  # type: ignore[type-arg]
    feedback_status: Mapped[str | None] = mapped_column(String(50))
    rating: Mapped[int | None] = mapped_column(Integer)
    pdf_s3_key: Mapped[str | None] = mapped_column(String(500))
    old_feedback_form_pdf_link: Mapped[str | None] = mapped_column(String(500))
