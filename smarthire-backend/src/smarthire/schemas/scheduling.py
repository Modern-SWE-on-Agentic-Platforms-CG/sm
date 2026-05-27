"""Schemas for interview scheduling (US2)."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class SlotRequest(BaseModel):
    interviewer_id: int = Field(alias="interviewerId")
    slot_start: datetime = Field(alias="slotStart")
    slot_end: datetime = Field(alias="slotEnd")
    interview_type_id: int | None = Field(default=None, alias="interviewTypeId")

    model_config = {"populate_by_name": True}


class BookSlotRequest(BaseModel):
    interviewer_calendar_id: int = Field(alias="interviewerCalendarId")
    candidate_id: int = Field(alias="candidateId")
    recruiter_id: int | None = Field(default=None, alias="recruiterId")

    model_config = {"populate_by_name": True}


class RescheduleRequest(BaseModel):
    interviewer_calendar_id: int = Field(alias="interviewerCalendarId")
    new_slot_start: datetime = Field(alias="newSlotStart")
    new_slot_end: datetime = Field(alias="newSlotEnd")
    reason: str | None = None

    model_config = {"populate_by_name": True}


class SlotResponse(BaseModel):
    id: int
    interviewer_id: int
    slot_start: datetime
    slot_end: datetime
    booking_status: str
    meeting_link: str | None = None

    model_config = {"from_attributes": True}
