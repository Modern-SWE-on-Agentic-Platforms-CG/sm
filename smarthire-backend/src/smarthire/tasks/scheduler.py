"""APScheduler configuration and cron-job registration.

All scheduled jobs are defined here and registered via register_all_jobs().
The scheduler is started/stopped in the FastAPI lifespan (main.py).
"""

import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from smarthire.config import Settings

logger = logging.getLogger(__name__)

_scheduler: AsyncIOScheduler | None = None


def get_scheduler() -> AsyncIOScheduler:
    """Return the process-wide AsyncIOScheduler (lazily created)."""
    global _scheduler
    if _scheduler is None:
        _scheduler = AsyncIOScheduler(timezone="UTC")
    return _scheduler


def register_all_jobs(scheduler: AsyncIOScheduler, settings: Settings) -> None:
    """Register all cron jobs.

    Jobs are imported lazily to avoid circular imports at startup.
    Each job is added only if not already registered (idempotent).
    """
    existing_ids = {job.id for job in scheduler.get_jobs()}

    if "aging_sla_alert" not in existing_ids:
        # Daily at 06:00 UTC
        scheduler.add_job(
            _run_aging_sla_alert,
            trigger="cron",
            hour=6,
            minute=0,
            id="aging_sla_alert",
            replace_existing=True,
        )
        logger.info("Registered job: aging_sla_alert")

    if "interview_reminder" not in existing_ids:
        # Daily at 07:00 UTC
        scheduler.add_job(
            _run_interview_reminder,
            trigger="cron",
            hour=7,
            minute=0,
            id="interview_reminder",
            replace_existing=True,
        )
        logger.info("Registered job: interview_reminder")

    if "feedback_reminder" not in existing_ids:
        # Daily at 09:00 UTC
        scheduler.add_job(
            _run_feedback_reminder,
            trigger="cron",
            hour=9,
            minute=0,
            id="feedback_reminder",
            replace_existing=True,
        )
        logger.info("Registered job: feedback_reminder")


async def _run_aging_sla_alert() -> None:
    """Cron wrapper for the aging SLA alert job."""
    try:
        from smarthire.services.alert_service import send_aging_sla_alerts  # noqa: PLC0415

        await send_aging_sla_alerts()
    except Exception:
        logger.exception("aging_sla_alert job failed")


async def _run_interview_reminder() -> None:
    """Cron wrapper for the interview reminder job."""
    try:
        from smarthire.services.alert_service import send_interview_reminders  # noqa: PLC0415

        await send_interview_reminders()
    except Exception:
        logger.exception("interview_reminder job failed")


async def _run_feedback_reminder() -> None:
    """Cron wrapper for the feedback reminder job."""
    try:
        from smarthire.services.alert_service import send_feedback_reminders  # noqa: PLC0415

        await send_feedback_reminders()
    except Exception:
        logger.exception("feedback_reminder job failed")
