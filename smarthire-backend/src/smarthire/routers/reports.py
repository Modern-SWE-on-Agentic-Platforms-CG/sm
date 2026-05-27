"""Reports router (US5)."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.auth.dependencies import get_current_user
from smarthire.database import get_db_session
from smarthire.schemas.common import ResponseDto, ok_response
from smarthire.schemas.reports import ReportRequest
from smarthire.services.reports_service import ReportsService

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
    dependencies=[Depends(get_current_user)],
)


@router.post("/candidatePipeline", response_model=ResponseDto)
async def candidate_pipeline_report(
    req: ReportRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> Any:
    svc = ReportsService(db)

    if req.format == "excel":
        data = await svc.generate_excel(req)
        return Response(
            content=data,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": 'attachment; filename="report.xlsx"'},
        )

    if req.format == "pdf":
        data = await svc.generate_pdf(req)
        return Response(
            content=data,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="report.pdf"'},
        )

    rows = await svc.generate_json(req)
    return ok_response(rows, f"Report: {len(rows)} records")
