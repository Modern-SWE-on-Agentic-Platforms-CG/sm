"""Recruiter calendar router — contract paths from openapi.yaml."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.auth.dependencies import get_current_user
from smarthire.database import get_db_session
from smarthire.schemas.common import ResponseDto, ok_response

router = APIRouter(
    prefix="/recruiter",
    tags=["Recruiter"],
    dependencies=[Depends(get_current_user)],
)


@router.post("/getDirectRecruiterSlots", response_model=ResponseDto)
async def get_direct_recruiter_slots(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    from smarthire.models.calendar import RecruiterCalendarDetails  # noqa: PLC0415
    from sqlalchemy import select  # noqa: PLC0415

    result = await db.execute(select(RecruiterCalendarDetails))
    slots = result.scalars().all()
    return ok_response([s.__dict__ for s in slots])


@router.post("/saveInterviewSlot", response_model=ResponseDto)
async def save_interview_slot(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.schemas.scheduling import BookSlotRequest  # noqa: PLC0415
    from smarthire.services.scheduling_service import SchedulingService  # noqa: PLC0415

    req = BookSlotRequest(
        interviewerCalendarId=body["interviewerCalendarId"],
        candidateId=body["candidateId"],
        recruiterId=body.get("recruiterId"),
    )
    svc = SchedulingService(db)
    result = await svc.book_slot(req, actor=current_user.get("sub"))
    return ok_response([result], "Slot booked")


@router.post("/rescheduleSlot", response_model=ResponseDto)
async def reschedule_slot(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.models.calendar import RecruiterCalendarDetails  # noqa: PLC0415
    from sqlalchemy import update  # noqa: PLC0415

    await db.execute(
        update(RecruiterCalendarDetails)
        .where(RecruiterCalendarDetails.id == body.get("recruiterCalendarId"))
        .values(status="Rescheduled")
    )
    await db.commit()
    return ok_response([], "Slot rescheduled")


@router.post("/deleteSlot", response_model=ResponseDto)
async def delete_slot(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.models.calendar import RecruiterCalendarDetails  # noqa: PLC0415
    from sqlalchemy import update  # noqa: PLC0415

    await db.execute(
        update(RecruiterCalendarDetails)
        .where(RecruiterCalendarDetails.id == body["recruiterCalendarId"])
        .values(status="Cancelled")
    )
    await db.commit()
    return ok_response([], "Slot deleted")


@router.post("/feedbackForm", response_model=ResponseDto)
async def get_feedback_form(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    from smarthire.services.feedback_service import FeedbackService  # noqa: PLC0415

    svc = FeedbackService(db)
    fb = await svc.get_feedback(body["interviewerCalendarId"])
    return ok_response([fb.__dict__] if fb else [])


@router.post("/feedbackFormPDF", response_model=ResponseDto)
async def get_feedback_form_pdf(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.services.feedback_service import FeedbackService  # noqa: PLC0415
    from smarthire.utils.s3_client import s3_client  # noqa: PLC0415

    calendar_id = body["interviewerCalendarId"]
    svc = FeedbackService(db)
    fb = await svc.get_feedback(calendar_id)
    if fb and fb.pdf_s3_key:
        url = await s3_client.generate_presigned_url(fb.pdf_s3_key)
        return ok_response([{"url": url}])
    return ok_response([], "No PDF available")
