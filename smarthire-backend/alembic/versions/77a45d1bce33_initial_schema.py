"""Initial schema — creates all smarthire tables.

Revision ID: 77a45d1bce33
Revises:
Create Date: 2026-05-26 15:35:54.722424

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '77a45d1bce33'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the smarthire schema and all application tables."""
    op.execute("CREATE SCHEMA IF NOT EXISTS smarthire")

    # ------------------------------------------------------------------
    # Master / Lookup tables (no FK dependencies)
    # ------------------------------------------------------------------
    _simple_masters = [
        "grade_master", "bu_master", "practice_master", "technology_master",
        "tower_master", "skill_group_master", "status_master", "role_master",
        "account_master", "location_master", "interview_type_master",
        "source_master", "rejection_reason_master", "decline_reason_master",
        "data_type_master", "notification_type_master", "bench_status_master",
        "referral_bu_master", "referral_technology_master",
        "referral_certifications_master",
    ]
    for table in _simple_masters:
        op.create_table(
            table,
            sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
            sa.Column("name", sa.String(255), nullable=False),
            sa.Column("active_flag", sa.Boolean, nullable=False, server_default="true"),
            sa.Column("created_by", sa.String(100)),
            sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
            sa.Column("updated_by", sa.String(100)),
            sa.Column("updated_date", sa.DateTime),
            schema="smarthire",
        )

    # status_master needs is_terminal column
    op.add_column(
        "status_master",
        sa.Column("is_terminal", sa.Boolean, nullable=False, server_default="false"),
        schema="smarthire",
    )

    # market_unit has an optional bu_id
    op.create_table(
        "market_unit",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("bu_id", sa.BigInteger),
        sa.Column("active_flag", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "skill_group_dl_master",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("skill_group_id", sa.BigInteger),
        sa.Column("dl_email", sa.String(255), nullable=False),
        sa.Column("active_flag", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "tower_lead_master",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("tower_id", sa.BigInteger),
        sa.Column("lead_email", sa.String(255), nullable=False),
        sa.Column("active_flag", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    # ------------------------------------------------------------------
    # Employee tables
    # ------------------------------------------------------------------
    op.create_table(
        "employee_master",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("employee_id", sa.String(50), nullable=False, unique=True),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100)),
        sa.Column("email_id", sa.String(255), nullable=False, unique=True),
        sa.Column("grade_id", sa.BigInteger, sa.ForeignKey("smarthire.grade_master.id")),
        sa.Column("practice_id", sa.BigInteger, sa.ForeignKey("smarthire.practice_master.id")),
        sa.Column("bu_id", sa.BigInteger, sa.ForeignKey("smarthire.bu_master.id")),
        sa.Column("supervisor_email", sa.String(255)),
        sa.Column("active_flag", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("profile_image_s3_key", sa.String(500)),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "employee_role_details",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("employee_id", sa.BigInteger, sa.ForeignKey("smarthire.employee_master.id"), nullable=False),
        sa.Column("role_id", sa.BigInteger, sa.ForeignKey("smarthire.role_master.id"), nullable=False),
        sa.Column("active_flag", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "employee_technology_details",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("employee_id", sa.BigInteger, sa.ForeignKey("smarthire.employee_master.id"), nullable=False),
        sa.Column("technology_id", sa.BigInteger, sa.ForeignKey("smarthire.technology_master.id"), nullable=False),
        sa.Column("primary_flag", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("active_flag", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    # ------------------------------------------------------------------
    # Candidate tables
    # ------------------------------------------------------------------
    op.create_table(
        "candidate_detail",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("candidate_name", sa.String(255), nullable=False),
        sa.Column("email_id", sa.String(255)),
        sa.Column("mobile_number", sa.String(20)),
        sa.Column("current_company", sa.String(255)),
        sa.Column("current_location", sa.String(100)),
        sa.Column("total_exp", sa.Numeric(4, 1)),
        sa.Column("relevant_exp", sa.Numeric(4, 1)),
        sa.Column("current_ctc", sa.Numeric(12, 2)),
        sa.Column("notice_period", sa.String(50)),
        sa.Column("account_id", sa.BigInteger, sa.ForeignKey("smarthire.account_master.id")),
        sa.Column("region", sa.String(100)),
        sa.Column("recvd_date", sa.Date),
        sa.Column("is_referral", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("referrer_name", sa.String(255)),
        sa.Column("is_rehire", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("prescreen_id", sa.String(100)),
        sa.Column("duplicate_flag", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("active_flag", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "candidate_info_detail",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("candidate_id", sa.BigInteger, sa.ForeignKey("smarthire.candidate_detail.id"), nullable=False),
        sa.Column("offered_ctc", sa.Numeric(12, 2)),
        sa.Column("negotiated_ctc", sa.Numeric(12, 2)),
        sa.Column("date_of_joining", sa.Date),
        sa.Column("joining_bonus", sa.Numeric(12, 2)),
        sa.Column("bu_approval", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("tower_approval", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("dg_approval", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("na_approval", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("arc_deviation_flag", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("deviation_reason", sa.Text),
        sa.Column("l3_escalation_flag", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("revisit_flag", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "candidate_status",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("candidate_id", sa.BigInteger, sa.ForeignKey("smarthire.candidate_detail.id"), nullable=False),
        sa.Column("status_id", sa.BigInteger, sa.ForeignKey("smarthire.status_master.id"), nullable=False),
        sa.Column("status_start_date", sa.DateTime, nullable=False),
        sa.Column("status_end_date", sa.DateTime),
        sa.Column("changed_by", sa.String(100)),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "candidate_skill",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("candidate_id", sa.BigInteger, sa.ForeignKey("smarthire.candidate_detail.id"), nullable=False),
        sa.Column("technology_id", sa.BigInteger, sa.ForeignKey("smarthire.technology_master.id")),
        sa.Column("tower_id", sa.BigInteger, sa.ForeignKey("smarthire.tower_master.id")),
        sa.Column("practice_id", sa.BigInteger, sa.ForeignKey("smarthire.practice_master.id")),
        sa.Column("skill_group_id", sa.BigInteger, sa.ForeignKey("smarthire.skill_group_master.id")),
        sa.Column("primary_flag", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "candidate_panel_details",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("candidate_id", sa.BigInteger, sa.ForeignKey("smarthire.candidate_detail.id"), nullable=False),
        sa.Column("l1_panel_id", sa.BigInteger, sa.ForeignKey("smarthire.employee_master.id")),
        sa.Column("l2_panel_id", sa.BigInteger, sa.ForeignKey("smarthire.employee_master.id")),
        sa.Column("l3_panel_id", sa.BigInteger, sa.ForeignKey("smarthire.employee_master.id")),
        sa.Column("rejection_reason_id", sa.BigInteger, sa.ForeignKey("smarthire.rejection_reason_master.id")),
        sa.Column("decline_reason_id", sa.BigInteger, sa.ForeignKey("smarthire.decline_reason_master.id")),
        sa.Column("l3_escalation_flag", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "candidate_comments",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("candidate_id", sa.BigInteger, sa.ForeignKey("smarthire.candidate_detail.id"), nullable=False),
        sa.Column("comment_text", sa.Text, nullable=False),
        sa.Column("attachment_s3_key", sa.String(500)),
        sa.Column("attachment_file_name", sa.String(255)),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    # ------------------------------------------------------------------
    # Calendar tables
    # ------------------------------------------------------------------
    op.create_table(
        "interviewer_calendar_details",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("interviewer_id", sa.BigInteger, sa.ForeignKey("smarthire.employee_master.id"), nullable=False),
        sa.Column("interviewer_email", sa.String(255)),
        sa.Column("interview_date", sa.Date, nullable=False),
        sa.Column("start_time", sa.Time, nullable=False),
        sa.Column("end_time", sa.Time),
        sa.Column("interview_type_id", sa.BigInteger, sa.ForeignKey("smarthire.interview_type_master.id")),
        sa.Column("technology_id", sa.BigInteger, sa.ForeignKey("smarthire.technology_master.id")),
        sa.Column("account_id", sa.BigInteger, sa.ForeignKey("smarthire.account_master.id")),
        sa.Column("participation_type", sa.String(50)),
        sa.Column("booking_status", sa.String(50), server_default="Free"),
        sa.Column("candidate_id", sa.BigInteger, sa.ForeignKey("smarthire.candidate_detail.id")),
        sa.Column("feedback_status", sa.String(50), server_default="Pending"),
        sa.Column("feedback_submitted_flag", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("meeting_link", sa.String(1000)),
        sa.Column("meeting_request_sent_flag", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("reminder_sent_flag", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("reschedule_flag", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("cancellation_reason", sa.Text),
        sa.Column("bu_id", sa.BigInteger, sa.ForeignKey("smarthire.bu_master.id")),
        sa.Column("s3_file_key", sa.String(500)),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "recruiter_calendar_details",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("recruiter_id", sa.BigInteger, sa.ForeignKey("smarthire.employee_master.id"), nullable=False),
        sa.Column("recruiter_email", sa.String(255)),
        sa.Column("interviewer_calendar_id", sa.BigInteger, sa.ForeignKey("smarthire.interviewer_calendar_details.id"), unique=True),
        sa.Column("candidate_id", sa.BigInteger, sa.ForeignKey("smarthire.candidate_detail.id"), nullable=False),
        sa.Column("interview_type_id", sa.BigInteger, sa.ForeignKey("smarthire.interview_type_master.id")),
        sa.Column("technology_id", sa.BigInteger, sa.ForeignKey("smarthire.technology_master.id")),
        sa.Column("slot_date", sa.Date),
        sa.Column("slot_start_time", sa.Time),
        sa.Column("status", sa.String(50), server_default="Scheduled"),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    # ------------------------------------------------------------------
    # Feedback tables
    # ------------------------------------------------------------------
    op.create_table(
        "feedback_template",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("template_name", sa.String(255), nullable=False),
        sa.Column("technology_id", sa.BigInteger, sa.ForeignKey("smarthire.technology_master.id")),
        sa.Column("practice_id", sa.BigInteger, sa.ForeignKey("smarthire.practice_master.id")),
        sa.Column("version", sa.Integer, nullable=False, server_default="1"),
        sa.Column("active_flag", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "feedback_form_details",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("template_id", sa.BigInteger, sa.ForeignKey("smarthire.feedback_template.id"), nullable=False),
        sa.Column("parent_id", sa.BigInteger, sa.ForeignKey("smarthire.feedback_form_details.id")),
        sa.Column("heading", sa.String(500), nullable=False),
        sa.Column("data_type_id", sa.BigInteger, sa.ForeignKey("smarthire.data_type_master.id")),
        sa.Column("required_flag", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("order_index", sa.Integer),
        sa.Column("version", sa.Integer, nullable=False, server_default="1"),
        sa.Column("active_flag", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "feedback_form_placeholder",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("form_detail_id", sa.BigInteger, sa.ForeignKey("smarthire.feedback_form_details.id")),
        sa.Column("placeholder_text", sa.Text),
        sa.Column("active_flag", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "interviewer_feedback",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("interviewer_calendar_id", sa.BigInteger, sa.ForeignKey("smarthire.interviewer_calendar_details.id"), unique=True, nullable=False),
        sa.Column("candidate_id", sa.BigInteger, sa.ForeignKey("smarthire.candidate_detail.id")),
        sa.Column("template_id", sa.BigInteger, sa.ForeignKey("smarthire.feedback_template.id")),
        sa.Column("response_json", sa.JSON),
        sa.Column("feedback_status", sa.String(50)),
        sa.Column("rating", sa.Integer),
        sa.Column("pdf_s3_key", sa.String(500)),
        sa.Column("old_feedback_form_pdf_link", sa.String(500)),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    # ------------------------------------------------------------------
    # Demand / Bench tables
    # ------------------------------------------------------------------
    op.create_table(
        "demand_batch",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("batch_name", sa.String(255)),
        sa.Column("upload_date", sa.DateTime),
        sa.Column("active_flag", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "demand_data",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("batch_id", sa.BigInteger, sa.ForeignKey("smarthire.demand_batch.id")),
        sa.Column("technology_id", sa.BigInteger, sa.ForeignKey("smarthire.technology_master.id")),
        sa.Column("skill_group_id", sa.BigInteger, sa.ForeignKey("smarthire.skill_group_master.id")),
        sa.Column("grade_id", sa.BigInteger, sa.ForeignKey("smarthire.grade_master.id")),
        sa.Column("account_id", sa.BigInteger, sa.ForeignKey("smarthire.account_master.id")),
        sa.Column("market_unit_id", sa.BigInteger, sa.ForeignKey("smarthire.market_unit.id")),
        sa.Column("location_id", sa.BigInteger, sa.ForeignKey("smarthire.location_master.id")),
        sa.Column("demand_type", sa.String(50)),
        sa.Column("role_start_date", sa.Date),
        sa.Column("status", sa.String(50), server_default="Open"),
        sa.Column("quantity", sa.Integer),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "bench_batch",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("batch_name", sa.String(255)),
        sa.Column("upload_date", sa.DateTime),
        sa.Column("active_flag", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "bench_data",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("batch_id", sa.BigInteger, sa.ForeignKey("smarthire.bench_batch.id")),
        sa.Column("employee_id", sa.String(50)),
        sa.Column("employee_name", sa.String(255)),
        sa.Column("technology_id", sa.BigInteger, sa.ForeignKey("smarthire.technology_master.id")),
        sa.Column("practice_id", sa.BigInteger, sa.ForeignKey("smarthire.practice_master.id")),
        sa.Column("skill_group_id", sa.BigInteger, sa.ForeignKey("smarthire.skill_group_master.id")),
        sa.Column("bench_start_date", sa.Date),
        sa.Column("location_id", sa.BigInteger, sa.ForeignKey("smarthire.location_master.id")),
        sa.Column("status_id", sa.BigInteger, sa.ForeignKey("smarthire.bench_status_master.id")),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    # ------------------------------------------------------------------
    # Referral tables
    # ------------------------------------------------------------------
    op.create_table(
        "referral_candidate_info",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("referrer_employee_id", sa.String(50)),
        sa.Column("referrer_name", sa.String(255)),
        sa.Column("candidate_name", sa.String(255)),
        sa.Column("email_id", sa.String(255)),
        sa.Column("mobile_number", sa.String(20)),
        sa.Column("total_exp", sa.Numeric(4, 1)),
        sa.Column("current_ctc", sa.Numeric(12, 2)),
        sa.Column("notice_period", sa.String(50)),
        sa.Column("bu_id", sa.BigInteger, sa.ForeignKey("smarthire.referral_bu_master.id")),
        sa.Column("account_id", sa.BigInteger, sa.ForeignKey("smarthire.account_master.id")),
        sa.Column("resume_s3_key", sa.String(500)),
        sa.Column("image_s3_key", sa.String(500)),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "referral_candidate_skill",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("referral_candidate_id", sa.BigInteger, sa.ForeignKey("smarthire.referral_candidate_info.id"), nullable=False),
        sa.Column("technology_id", sa.BigInteger, sa.ForeignKey("smarthire.referral_technology_master.id")),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )

    op.create_table(
        "referral_candidate_certification",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("referral_candidate_id", sa.BigInteger, sa.ForeignKey("smarthire.referral_candidate_info.id"), nullable=False),
        sa.Column("certification_id", sa.BigInteger, sa.ForeignKey("smarthire.referral_certifications_master.id")),
        sa.Column("created_by", sa.String(100)),
        sa.Column("created_date", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_by", sa.String(100)),
        sa.Column("updated_date", sa.DateTime),
        schema="smarthire",
    )


def downgrade() -> None:
    """Drop all smarthire tables and the schema."""
    tables_in_reverse = [
        "referral_candidate_certification",
        "referral_candidate_skill",
        "referral_candidate_info",
        "bench_data", "bench_batch",
        "demand_data", "demand_batch",
        "interviewer_feedback",
        "feedback_form_placeholder",
        "feedback_form_details",
        "feedback_template",
        "recruiter_calendar_details",
        "interviewer_calendar_details",
        "candidate_comments",
        "candidate_panel_details",
        "candidate_skill",
        "candidate_status",
        "candidate_info_detail",
        "candidate_detail",
        "employee_technology_details",
        "employee_role_details",
        "employee_master",
        "tower_lead_master",
        "skill_group_dl_master",
        "market_unit",
        "grade_master", "bu_master", "practice_master", "technology_master",
        "tower_master", "skill_group_master", "status_master", "role_master",
        "account_master", "location_master", "interview_type_master",
        "source_master", "rejection_reason_master", "decline_reason_master",
        "data_type_master", "notification_type_master", "bench_status_master",
        "referral_bu_master", "referral_technology_master",
        "referral_certifications_master",
    ]
    for table in tables_in_reverse:
        op.drop_table(table, schema="smarthire")
    op.execute("DROP SCHEMA IF EXISTS smarthire CASCADE")
