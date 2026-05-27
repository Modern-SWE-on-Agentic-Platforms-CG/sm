"""Feedback router (US3)."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.auth.dependencies import get_current_user
from smarthire.database import get_db_session
from smarthire.schemas.common import ResponseDto, ok_response
from smarthire.schemas.feedback import FeedbackSubmitRequest, FeedbackTemplateRequest
from smarthire.services.feedback_service import FeedbackService

router = APIRouter(
    prefix="/feedback",
    tags=["feedback"],
    dependencies=[Depends(get_current_user)],
)


@router.post("/submit", response_model=ResponseDto)
async def submit_feedback(
    req: FeedbackSubmitRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    svc = FeedbackService(db)
    fb = await svc.submit(req, actor=current_user.get("sub"))
    return ok_response([{"id": fb.id}], "Feedback submitted")


@router.get("/get/{interviewer_calendar_id}", response_model=ResponseDto)
async def get_feedback(
    interviewer_calendar_id: int,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    svc = FeedbackService(db)
    fb = await svc.get_feedback(interviewer_calendar_id)
    if fb is None:
        from fastapi import HTTPException  # noqa: PLC0415

        raise HTTPException(status_code=404, detail="Feedback not found")
    return ok_response([fb.__dict__])


@router.get("/pdf/{interviewer_calendar_id}")
async def get_feedback_pdf(
    interviewer_calendar_id: int,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> Response:
    svc = FeedbackService(db)
    pdf_bytes = await svc.generate_pdf(interviewer_calendar_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="feedback_{interviewer_calendar_id}.pdf"'
        },
    )


@router.post("/template", response_model=ResponseDto)
async def create_template(
    req: FeedbackTemplateRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    svc = FeedbackService(db)
    template = await svc.create_template(req, actor=current_user.get("sub"))
    return ok_response([{"id": template.id}], "Template created")


@router.get("/templates", response_model=ResponseDto)
async def list_templates(
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    svc = FeedbackService(db)
    templates = await svc.list_templates()
    return ok_response([t.__dict__ for t in templates])
