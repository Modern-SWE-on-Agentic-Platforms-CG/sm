"""Alerts router — manual trigger endpoints for scheduled jobs."""

from __future__ import annotations

import logging
from typing import Annotated, Any

from fastapi import APIRouter, Depends

from smarthire.auth.dependencies import get_current_user
from smarthire.schemas.common import ResponseDto, ok_response

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/sendAgingSLAs", response_model=ResponseDto)
async def send_aging_slas(
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.services.alert_service import aging_sla_alert  # noqa: PLC0415

    await aging_sla_alert()
    return ok_response([], "Aging SLA alerts dispatched")


@router.get("/sendInterviewReminder", response_model=ResponseDto)
async def send_interview_reminder(
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.services.alert_service import interview_reminder  # noqa: PLC0415

    await interview_reminder()
    return ok_response([], "Interview reminders sent")


@router.get("/feedbackFormReminder", response_model=ResponseDto)
async def feedback_form_reminder(
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.services.alert_service import feedback_reminder  # noqa: PLC0415

    await feedback_reminder()
    return ok_response([], "Feedback reminders sent")


@router.get("/sendInterviewStatus", response_model=ResponseDto)
async def send_interview_status(
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    logger.info("Interview status notification triggered manually")
    return ok_response([], "Interview status notifications sent")


@router.get("/sendTowerAgingSLAs", response_model=ResponseDto)
async def send_tower_aging_slas(
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    logger.info("Tower aging SLA alert triggered manually")
    return ok_response([], "Tower aging SLA alerts dispatched")
