"""Excel download and report generation routers (contract paths)."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.auth.dependencies import get_current_user
from smarthire.database import get_db_session
from smarthire.schemas.common import ResponseDto, ok_response
from smarthire.schemas.reports import ReportRequest

_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

excel_router = APIRouter(
    prefix="/downloadExcel",
    tags=["Reports"],
    dependencies=[Depends(get_current_user)],
)

report_router = APIRouter(
    prefix="/report",
    tags=["Reports"],
    dependencies=[Depends(get_current_user)],
)


async def _build_excel(body: dict[str, Any], db: AsyncSession, title: str) -> Response:
    from smarthire.services.reports_service import ReportsService  # noqa: PLC0415

    req = ReportRequest(
        fromDate=body.get("fromDate"),
        toDate=body.get("toDate"),
        technologyId=body.get("technologyId"),
        buId=body.get("buId"),
    )
    svc = ReportsService(db)
    data = await svc.generate_excel(req)
    return Response(
        content=data,
        media_type=_XLSX,
        headers={"Content-Disposition": f'attachment; filename="{title}.xlsx"'},
    )


@excel_router.post("/exportExcel")
async def export_excel(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> Response:
    return await _build_excel(body, db, "candidate_pipeline")


@excel_router.post("/exportExcelPMO")
async def export_excel_pmo(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> Response:
    return await _build_excel(body, db, "pmo_demand")


@excel_router.post("/exportExcelL2AgingReport")
async def export_excel_l2_aging(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> Response:
    return await _build_excel(body, db, "l2_aging_report")


@report_router.put("/generateReport")
async def generate_report(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> Response:
    return await _build_excel(body, db, "pipeline_report")


@report_router.get("/generatePdf", response_model=ResponseDto)
async def generate_pdf(
    interviewerCalendarId: Annotated[int, Query()],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.services.feedback_service import FeedbackService  # noqa: PLC0415
    from smarthire.utils.s3_client import s3_client  # noqa: PLC0415

    svc = FeedbackService(db)
    fb = await svc.get_feedback(interviewerCalendarId)
    if fb and fb.pdf_s3_key:
        url = await s3_client.generate_presigned_url(fb.pdf_s3_key)
        return ok_response([{"url": url}])
    return ok_response([], "No PDF available")
