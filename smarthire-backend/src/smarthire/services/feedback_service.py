"""Feedback service (US3)."""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.models.feedback import FeedbackTemplate, InterviewerFeedback
from smarthire.repositories.feedback_repo import FeedbackRepository
from smarthire.schemas.feedback import FeedbackSubmitRequest, FeedbackTemplateRequest

logger = logging.getLogger(__name__)


class FeedbackService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = FeedbackRepository(session)
        self._session = session

    async def submit(
        self, req: FeedbackSubmitRequest, actor: str | None = None
    ) -> InterviewerFeedback:
        fb = await self._repo.submit_feedback(req, created_by=actor)
        await self._session.commit()
        return fb

    async def get_feedback(self, interviewer_calendar_id: int) -> InterviewerFeedback | None:
        return await self._repo.get_feedback(interviewer_calendar_id)

    async def create_template(
        self, req: FeedbackTemplateRequest, actor: str | None = None
    ) -> FeedbackTemplate:
        template = await self._repo.create_template(req, created_by=actor)
        await self._session.commit()
        return template

    async def list_templates(self) -> list[FeedbackTemplate]:
        return await self._repo.list_templates()

    async def generate_pdf(self, interviewer_calendar_id: int) -> bytes:
        """Generate feedback PDF and return bytes."""
        fb = await self._repo.get_feedback(interviewer_calendar_id)
        if fb is None:
            from fastapi import HTTPException  # noqa: PLC0415

            raise HTTPException(status_code=404, detail="Feedback not found")

        from smarthire.utils.pdf_generator import pdf_generator  # noqa: PLC0415

        rows = [(k, str(v)) for k, v in (fb.response_json or {}).items()]
        return pdf_generator.create_pdf(
            title=f"Feedback — Interview {interviewer_calendar_id}",
            sections=[{"heading": "Responses", "rows": rows}],
        )
