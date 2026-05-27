"""Calendar / slot repository."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.models.calendar import InterviewerCalendarDetails, RecruiterCalendarDetails
from smarthire.schemas.scheduling import BookSlotRequest, RescheduleRequest, SlotRequest


class CalendarRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_slot(
        self, req: SlotRequest, created_by: str | None = None
    ) -> InterviewerCalendarDetails:
        slot = InterviewerCalendarDetails(
            interviewer_id=req.interviewer_id,
            interview_date=req.slot_start.date(),
            start_time=req.slot_start.time(),
            end_time=req.slot_end.time(),
            interview_type_id=req.interview_type_id,
            booking_status="Free",
            feedback_status="Pending",
            created_by=created_by,
        )
        self._session.add(slot)
        await self._session.flush()
        return slot

    async def get_slot(self, slot_id: int) -> InterviewerCalendarDetails | None:
        result = await self._session.execute(
            select(InterviewerCalendarDetails).where(
                InterviewerCalendarDetails.id == slot_id
            )
        )
        return result.scalar_one_or_none()

    async def get_free_slots_for_interviewer(
        self, interviewer_id: int
    ) -> list[InterviewerCalendarDetails]:
        result = await self._session.execute(
            select(InterviewerCalendarDetails).where(
                and_(
                    InterviewerCalendarDetails.interviewer_id == interviewer_id,
                    InterviewerCalendarDetails.booking_status == "Free",
                )
            )
        )
        return list(result.scalars().all())

    async def book_slot(
        self,
        req: BookSlotRequest,
        meeting_link: str | None = None,
        created_by: str | None = None,
    ) -> RecruiterCalendarDetails:
        """Book an interviewer slot — mark it Booked and create a recruiter record."""
        await self._session.execute(
            update(InterviewerCalendarDetails)
            .where(InterviewerCalendarDetails.id == req.interviewer_calendar_id)
            .values(booking_status="Booked", meeting_link=meeting_link)
        )
        booking = RecruiterCalendarDetails(
            interviewer_calendar_id=req.interviewer_calendar_id,
            candidate_id=req.candidate_id,
            recruiter_id=req.recruiter_id,
            status="Scheduled",
            created_by=created_by,
        )
        self._session.add(booking)
        await self._session.flush()
        return booking

    async def reschedule_slot(self, req: RescheduleRequest) -> InterviewerCalendarDetails:
        await self._session.execute(
            update(InterviewerCalendarDetails)
            .where(InterviewerCalendarDetails.id == req.interviewer_calendar_id)
            .values(
                slot_start=req.new_slot_start,
                slot_end=req.new_slot_end,
                reschedule_flag=True,
                booking_status="Free",
            )
        )
        slot = await self.get_slot(req.interviewer_calendar_id)
        if slot is None:
            from fastapi import HTTPException  # noqa: PLC0415
            raise HTTPException(status_code=404, detail="Slot not found")
        return slot
