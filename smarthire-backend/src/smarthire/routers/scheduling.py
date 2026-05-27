"""Interview scheduling router (US2)."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.auth.dependencies import get_current_user
from smarthire.database import get_db_session
from smarthire.schemas.common import ResponseDto, ok_response
from smarthire.schemas.scheduling import BookSlotRequest, RescheduleRequest, SlotRequest
from smarthire.services.scheduling_service import SchedulingService

router = APIRouter(
    prefix="/calendar",
    tags=["scheduling"],
    dependencies=[Depends(get_current_user)],
)


@router.post("/addSlot", response_model=ResponseDto)
async def add_slot(
    req: SlotRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    svc = SchedulingService(db)
    slot = await svc.add_slot(req, actor=current_user.get("sub"))
    return ok_response([{"id": slot.id}], "Slot added")


@router.get("/getAvailableSlots/{interviewer_id}", response_model=ResponseDto)
async def get_available_slots(
    interviewer_id: int,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    svc = SchedulingService(db)
    slots = await svc.get_available_slots(interviewer_id)
    return ok_response([s.__dict__ for s in slots])


@router.post("/bookSlot", response_model=ResponseDto)
async def book_slot(
    req: BookSlotRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    svc = SchedulingService(db)
    result = await svc.book_slot(req, actor=current_user.get("sub"))
    return ok_response([result], "Slot booked")


@router.post("/rescheduleSlot", response_model=ResponseDto)
async def reschedule_slot(
    req: RescheduleRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    svc = SchedulingService(db)
    slot = await svc.reschedule(req, actor=current_user.get("sub"))
    return ok_response([{"id": slot.id}], "Slot rescheduled")
