"""Feedback schemas (US3)."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class FeedbackSubmitRequest(BaseModel):
    interviewer_calendar_id: int = Field(alias="interviewerCalendarId")
    rating: int = Field(alias="rating", ge=1, le=5)
    response_json: dict[str, Any] = Field(alias="responseJson")
    feedback_status: str = Field(default="Submitted", alias="feedbackStatus")

    model_config = {"populate_by_name": True}


class FeedbackTemplateRequest(BaseModel):
    template_name: str = Field(alias="templateName")
    technology_id: int | None = Field(default=None, alias="technologyId")
    practice_id: int | None = Field(default=None, alias="practiceId")
    version: int = Field(default=1)
    active_flag: bool = Field(default=True, alias="activeFlag")

    model_config = {"populate_by_name": True}
