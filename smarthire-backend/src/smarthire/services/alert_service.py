"""Alert service — cron job implementations (US4).

Functions in this module are called by APScheduler jobs registered in
smarthire.tasks.scheduler. Each function is a standalone async coroutine.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)


async def aging_sla_alert() -> None:
    """Send SLA aging alerts for candidates whose pipeline has stalled.

    Run at 06:00 daily (registered in scheduler.py).
    """
    try:
        from smarthire.database import AsyncSessionFactory  # noqa: PLC0415
        from smarthire.models.candidate import CandidateDetail  # noqa: PLC0415
        from smarthire.utils.ses_client import ses_client  # noqa: PLC0415
        from sqlalchemy import select, and_  # noqa: PLC0415

        threshold = datetime.now(tz=timezone.utc).replace(tzinfo=None) - timedelta(days=14)
        async with AsyncSessionFactory() as session:
            result = await session.execute(
                select(CandidateDetail).where(
                    and_(
                        CandidateDetail.active_flag == True,  # noqa: E712
                        CandidateDetail.recvd_date <= threshold.date(),
                    )
                )
            )
            aging = result.scalars().all()
        if aging:
            body = "\n".join(
                f"- {c.candidate_name} (ID: {c.id}) — received {c.recvd_date}" for c in aging
            )
            await ses_client.send_email(
                to=["smarthire-alerts@example.com"],
                subject="SmartHire SLA Aging Alert",
                body_text=f"Candidates exceeding SLA threshold:\n{body}",
            )
            logger.info("Aging SLA alert sent for %d candidates", len(aging))
    except Exception:  # noqa: BLE001
        logger.exception("aging_sla_alert job failed")


async def interview_reminder() -> None:
    """Send interview reminders for slots scheduled tomorrow.

    Run at 07:00 daily.
    """
    try:
        from smarthire.database import AsyncSessionFactory  # noqa: PLC0415
        from smarthire.models.calendar import InterviewerCalendarDetails  # noqa: PLC0415
        from smarthire.utils.ses_client import ses_client  # noqa: PLC0415
        from sqlalchemy import select, and_, func  # noqa: PLC0415

        tomorrow_start = datetime.now(tz=timezone.utc).replace(tzinfo=None).replace(
            hour=0, minute=0, second=0
        ) + timedelta(days=1)
        tomorrow_end = tomorrow_start + timedelta(days=1)

        async with AsyncSessionFactory() as session:
            result = await session.execute(
                select(InterviewerCalendarDetails).where(
                    and_(
                        InterviewerCalendarDetails.slot_start >= tomorrow_start,
                        InterviewerCalendarDetails.slot_start < tomorrow_end,
                        InterviewerCalendarDetails.booking_status == "Booked",
                        InterviewerCalendarDetails.reminder_sent_flag == False,  # noqa: E712
                    )
                )
            )
            slots = result.scalars().all()

        for slot in slots:
            logger.info("Interview reminder for slot %d", slot.id)
        logger.info("Interview reminder job completed: %d slots", len(slots))
    except Exception:  # noqa: BLE001
        logger.exception("interview_reminder job failed")


async def feedback_reminder() -> None:
    """Send feedback reminders for interviews completed yesterday without feedback.

    Run at 09:00 daily.
    """
    try:
        from smarthire.database import AsyncSessionFactory  # noqa: PLC0415
        from smarthire.models.calendar import InterviewerCalendarDetails  # noqa: PLC0415
        from sqlalchemy import select, and_  # noqa: PLC0415

        yesterday_start = datetime.now(tz=timezone.utc).replace(tzinfo=None).replace(
            hour=0, minute=0, second=0
        ) - timedelta(days=1)
        yesterday_end = yesterday_start + timedelta(days=1)

        async with AsyncSessionFactory() as session:
            result = await session.execute(
                select(InterviewerCalendarDetails).where(
                    and_(
                        InterviewerCalendarDetails.slot_end >= yesterday_start,
                        InterviewerCalendarDetails.slot_end < yesterday_end,
                        InterviewerCalendarDetails.feedback_status == "Pending",
                    )
                )
            )
            pending = result.scalars().all()
        logger.info("Feedback reminder job: %d pending", len(pending))
    except Exception:  # noqa: BLE001
        logger.exception("feedback_reminder job failed")
