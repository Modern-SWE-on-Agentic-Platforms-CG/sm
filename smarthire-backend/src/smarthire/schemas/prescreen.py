"""Prescreen and referral schemas (US8)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class PrescreenRequest(BaseModel):
    candidate_name: str = Field(alias="candidateName")
    mobile_number: str | None = Field(default=None, alias="mobileNumber")
    technology_id: int | None = Field(default=None, alias="technologyId")
    years_exp: float | None = Field(default=None, alias="yearsExp")
    prescreen_notes: str | None = Field(default=None, alias="prescreenNotes")

    model_config = {"populate_by_name": True}


class ReferralRequest(BaseModel):
    referrer_employee_id: str = Field(alias="referrerEmployeeId")
    candidate_name: str = Field(alias="candidateName")
    email_id: str | None = Field(default=None, alias="emailId")
    mobile_number: str | None = Field(default=None, alias="mobileNumber")
    technology_id: int | None = Field(default=None, alias="technologyId")
    certification_ids: list[int] = Field(default_factory=list, alias="certificationIds")

    model_config = {"populate_by_name": True}
