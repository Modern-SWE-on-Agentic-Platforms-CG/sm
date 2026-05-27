"""Interview scheduling service (US2)."""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.models.calendar import InterviewerCalendarDetails, RecruiterCalendarDetails
from smarthire.repositories.calendar_repo import CalendarRepository
from smarthire.schemas.scheduling import BookSlotRequest, RescheduleRequest, SlotRequest

logger = logging.getLogger(__name__)


class SchedulingService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = CalendarRepository(session)
        self._session = session

    async def add_slot(
        self, req: SlotRequest, actor: str | None = None
    ) -> InterviewerCalendarDetails:
        slot = await self._repo.create_slot(req, created_by=actor)
        await self._session.commit()
        return slot

    async def get_available_slots(
        self, interviewer_id: int
    ) -> list[InterviewerCalendarDetails]:
        return await self._repo.get_free_slots_for_interviewer(interviewer_id)

    async def book_slot(
        self, req: BookSlotRequest, actor: str | None = None
    ) -> dict[str, Any]:
        """Book a slot, create a Teams meeting link if MS credentials configured."""
        meeting_link: str | None = None
        slot = await self._repo.get_slot(req.interviewer_calendar_id)
        if slot and slot.slot_start and slot.slot_end:
            try:
                from smarthire.utils.teams_client import teams_client  # noqa: PLC0415

                from smarthire.config import get_settings  # noqa: PLC0415

                s = get_settings()
                if s.ms_tenant_id and s.ms_client_id and s.ms_client_secret:
                    meeting_link = await teams_client.create_meeting(
                        subject="Interview",
                        start_time=slot.slot_start,
                        end_time=slot.slot_end,
                        organizer_email=actor or "smarthire@example.com",
                    )
            except Exception as exc:  # noqa: BLE001
                logger.warning("Failed to create Teams meeting: %s", exc)

        booking = await self._repo.book_slot(req, meeting_link=meeting_link, created_by=actor)
        await self._session.commit()
        return {
            "booking_id": booking.id,
            "interviewer_calendar_id": req.interviewer_calendar_id,
            "meeting_link": meeting_link,
        }

    async def reschedule(
        self, req: RescheduleRequest, actor: str | None = None
    ) -> InterviewerCalendarDetails:
        slot = await self._repo.reschedule_slot(req)
        await self._session.commit()
        return slot
