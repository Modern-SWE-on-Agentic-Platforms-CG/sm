"""Reports service (US5).

Generates candidate pipeline and interview statistics reports.
Supports JSON, Excel, and PDF output formats.
"""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.models.candidate import CandidateDetail, CandidateStatus
from smarthire.schemas.reports import ReportRequest

logger = logging.getLogger(__name__)

_EXCEL_HEADERS = [
    "Candidate ID",
    "Name",
    "Email",
    "Total Exp",
    "Notice Period",
    "Is Referral",
    "Status",
]


class ReportsService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def _get_rows(self, req: ReportRequest) -> list[dict[str, Any]]:
        stmt = (
            select(CandidateDetail)
            .where(CandidateDetail.active_flag == True)  # noqa: E712
        )
        if req.from_date:
            stmt = stmt.where(CandidateDetail.recvd_date >= req.from_date)
        if req.to_date:
            stmt = stmt.where(CandidateDetail.recvd_date <= req.to_date)

        result = await self._session.execute(stmt)
        candidates = result.scalars().all()
        return [
            {
                "Candidate ID": c.id,
                "Name": c.candidate_name,
                "Email": c.email_id,
                "Total Exp": str(c.total_exp),
                "Notice Period": c.notice_period,
                "Is Referral": c.is_referral,
                "Status": "",
            }
            for c in candidates
        ]

    async def generate_json(self, req: ReportRequest) -> list[dict[str, Any]]:
        return await self._get_rows(req)

    async def generate_excel(self, req: ReportRequest) -> bytes:
        from smarthire.utils.excel_exporter import create_workbook  # noqa: PLC0415

        rows_data = await self._get_rows(req)
        rows = [[r[h] for h in _EXCEL_HEADERS] for r in rows_data]
        return create_workbook(headers=_EXCEL_HEADERS, rows=rows, sheet_title="Candidates")

    async def generate_pdf(self, req: ReportRequest) -> bytes:
        from smarthire.utils.pdf_generator import pdf_generator  # noqa: PLC0415

        rows_data = await self._get_rows(req)
        rows = [(r["Name"], str(r["Email"])) for r in rows_data]
        return pdf_generator.create_pdf(
            title="Candidate Pipeline Report",
            sections=[{"heading": "Candidates", "rows": rows}],
        )
