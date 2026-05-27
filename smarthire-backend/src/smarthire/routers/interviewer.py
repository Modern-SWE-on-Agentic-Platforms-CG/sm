"""Interviewer calendar router — contract paths from openapi.yaml."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.auth.dependencies import get_current_user
from smarthire.database import get_db_session
from smarthire.schemas.common import ResponseDto, ok_response

router = APIRouter(
    prefix="/interviewer",
    tags=["Interviewer"],
    dependencies=[Depends(get_current_user)],
)


@router.post("/getInterviewerSlots", response_model=ResponseDto)
async def get_interviewer_slots(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    from smarthire.models.calendar import InterviewerCalendarDetails  # noqa: PLC0415
    from sqlalchemy import select, and_  # noqa: PLC0415

    stmt = select(InterviewerCalendarDetails).where(
        InterviewerCalendarDetails.booking_status == "Free"
    )
    if body.get("technologyId"):
        stmt = stmt.where(InterviewerCalendarDetails.technology_id == body["technologyId"])
    result = await db.execute(stmt)
    slots = result.scalars().all()
    return ok_response([s.__dict__ for s in slots])


@router.post("/saveFreeSlot", response_model=ResponseDto)
async def save_free_slot(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.models.calendar import InterviewerCalendarDetails  # noqa: PLC0415
    from datetime import datetime  # noqa: PLC0415

    slot = InterviewerCalendarDetails(
        interviewer_id=body.get("interviewerId"),
        interview_type_id=body.get("interviewTypeId"),
        technology_id=body.get("technologyId"),
        account_id=body.get("accountId"),
        bu_id=body.get("buId"),
        booking_status="Free",
        created_by=current_user.get("sub"),
    )
    db.add(slot)
    await db.flush()
    await db.commit()
    return ok_response([{"id": slot.id}], "Free slot saved")


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


@router.post("/saveFeedback", response_model=ResponseDto)
async def save_feedback(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.schemas.feedback import FeedbackSubmitRequest  # noqa: PLC0415
    from smarthire.services.feedback_service import FeedbackService  # noqa: PLC0415

    req = FeedbackSubmitRequest(
        interviewerCalendarId=body["interviewerCalendarId"],
        rating=body.get("rating", 3),
        responseJson=body.get("responseJson", {}),
        feedbackStatus=body.get("feedbackStatus", "Submitted"),
    )
    svc = FeedbackService(db)
    fb = await svc.submit(req, actor=current_user.get("sub"))
    return ok_response([{"id": fb.id}], "Feedback saved")


@router.post("/rescheduledRequest", response_model=ResponseDto)
async def rescheduled_request(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.models.calendar import InterviewerCalendarDetails  # noqa: PLC0415
    from sqlalchemy import update  # noqa: PLC0415

    await db.execute(
        update(InterviewerCalendarDetails)
        .where(InterviewerCalendarDetails.id == body["interviewerCalendarId"])
        .values(reschedule_flag=True)
    )
    await db.commit()
    return ok_response([], "Reschedule request recorded")


@router.delete("/deleteSlot", response_model=ResponseDto)
async def delete_slot(
    interviewerCalendarId: Annotated[int, Query()],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.models.calendar import InterviewerCalendarDetails  # noqa: PLC0415
    from sqlalchemy import update  # noqa: PLC0415

    await db.execute(
        update(InterviewerCalendarDetails)
        .where(InterviewerCalendarDetails.id == interviewerCalendarId)
        .values(booking_status="Cancelled")
    )
    await db.commit()
    return ok_response([], "Slot cancelled")
