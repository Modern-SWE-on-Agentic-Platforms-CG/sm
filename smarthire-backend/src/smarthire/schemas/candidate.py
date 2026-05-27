"""Candidate Pydantic schemas."""

from __future__ import annotations

from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator


class CandidateDataRequest(BaseModel):
    candidate_name: str = Field(alias="candidateName")
    email_id: str | None = Field(default=None, alias="emailId")
    mobile_number: str | None = Field(default=None, alias="mobileNumber")
    current_company: str | None = Field(default=None, alias="currentCompany")
    current_location: str | None = Field(default=None, alias="currentLocation")
    total_exp: Decimal | None = Field(default=None, alias="totalExp", ge=0, le=60)
    relevant_exp: Decimal | None = Field(default=None, alias="relevantExp")
    current_ctc: Decimal | None = Field(default=None, alias="currentCtc")
    notice_period: str | None = Field(default=None, alias="noticePeriod")
    account_id: int | None = Field(default=None, alias="accountId")
    region: str | None = None
    recvd_date: date | None = Field(default=None, alias="recvdDate")
    is_referral: bool = Field(default=False, alias="isReferral")
    referrer_name: str | None = Field(default=None, alias="referrerName")
    is_rehire: bool = Field(default=False, alias="isRehire")
    prescreen_id: str | None = Field(default=None, alias="prescreenId")
    technology_id: int | None = Field(default=None, alias="technologyId")
    tower_id: int | None = Field(default=None, alias="towerId")
    practice_id: int | None = Field(default=None, alias="practiceId")

    model_config = {"populate_by_name": True}


class CandidateSearchRequest(BaseModel):
    skill: int | None = None
    status: int | None = None
    tower: int | None = None
    source: int | None = None
    from_date: date | None = Field(default=None, alias="fromDate")
    to_date: date | None = Field(default=None, alias="toDate")
    page: int = Field(default=0, ge=0)
    size: int = Field(default=20, ge=1, le=200)

    model_config = {"populate_by_name": True}


class StatusChangeRequest(BaseModel):
    candidate_id: int = Field(alias="candidateId")
    status_id: int = Field(alias="statusId")
    changed_by: str | None = Field(default=None, alias="changedBy")

    model_config = {"populate_by_name": True}


class CommentRequest(BaseModel):
    candidate_id: int = Field(alias="candidateId")
    comment_text: str = Field(alias="commentText", min_length=1)
    attachment_file_name: str | None = Field(default=None, alias="attachmentFileName")

    model_config = {"populate_by_name": True}


class CandidateResponse(BaseModel):
    id: int
    candidate_name: str
    email_id: str | None = None
    mobile_number: str | None = None
    total_exp: Decimal | None = None
    notice_period: str | None = None
    is_referral: bool = False
    active_flag: bool = True

    model_config = {"from_attributes": True}
