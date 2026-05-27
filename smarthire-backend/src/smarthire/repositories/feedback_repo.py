"""Feedback repository."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.models.feedback import FeedbackTemplate, InterviewerFeedback
from smarthire.schemas.feedback import FeedbackSubmitRequest, FeedbackTemplateRequest


class FeedbackRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def submit_feedback(
        self, req: FeedbackSubmitRequest, created_by: str | None = None
    ) -> InterviewerFeedback:
        fb = InterviewerFeedback(
            interviewer_calendar_id=req.interviewer_calendar_id,
            rating=req.rating,
            response_json=req.response_json,
            feedback_status=req.feedback_status,
            created_by=created_by,
        )
        self._session.add(fb)
        await self._session.flush()
        return fb

    async def get_feedback(self, interviewer_calendar_id: int) -> InterviewerFeedback | None:
        result = await self._session.execute(
            select(InterviewerFeedback).where(
                InterviewerFeedback.interviewer_calendar_id == interviewer_calendar_id
            )
        )
        return result.scalar_one_or_none()

    async def create_template(
        self, req: FeedbackTemplateRequest, created_by: str | None = None
    ) -> FeedbackTemplate:
        template = FeedbackTemplate(
            template_name=req.template_name,
            technology_id=req.technology_id,
            practice_id=req.practice_id,
            version=req.version,
            active_flag=req.active_flag,
            created_by=created_by,
        )
        self._session.add(template)
        await self._session.flush()
        return template

    async def list_templates(self) -> list[FeedbackTemplate]:
        result = await self._session.execute(
            select(FeedbackTemplate).where(FeedbackTemplate.active_flag == True)  # noqa: E712
        )
        return list(result.scalars().all())
