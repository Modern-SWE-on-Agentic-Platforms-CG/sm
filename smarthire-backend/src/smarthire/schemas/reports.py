"""Reports schemas (US5)."""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field


class ReportRequest(BaseModel):
    from_date: date | None = Field(default=None, alias="fromDate")
    to_date: date | None = Field(default=None, alias="toDate")
    technology_id: int | None = Field(default=None, alias="technologyId")
    practice_id: int | None = Field(default=None, alias="practiceId")
    bu_id: int | None = Field(default=None, alias="buId")
    format: str = Field(default="json")  # "json" | "excel" | "pdf"

    model_config = {"populate_by_name": True}
