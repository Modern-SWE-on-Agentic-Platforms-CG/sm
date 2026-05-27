"""Demand and bench data routers."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.auth.dependencies import get_current_user
from smarthire.database import get_db_session
from smarthire.schemas.common import ResponseDto, ok_response

demand_router = APIRouter(
    prefix="/demandScreen",
    tags=["Demand"],
    dependencies=[Depends(get_current_user)],
)

demand_upload_router = APIRouter(
    prefix="/demandUpload",
    tags=["Demand"],
    dependencies=[Depends(get_current_user)],
)

bench_router = APIRouter(
    prefix="/benchScreen",
    tags=["Bench"],
    dependencies=[Depends(get_current_user)],
)

bench_upload_router = APIRouter(
    prefix="/benchUpload",
    tags=["Bench"],
    dependencies=[Depends(get_current_user)],
)

supply_router = APIRouter(
    prefix="/supplyScreen",
    tags=["Supply"],
    dependencies=[Depends(get_current_user)],
)


@demand_router.get("/getDemandInfo", response_model=ResponseDto)
async def get_demand_info(
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    from smarthire.models.demand import DemandData  # noqa: PLC0415
    from sqlalchemy import select  # noqa: PLC0415

    result = await db.execute(select(DemandData))
    rows = result.scalars().all()
    return ok_response([{k: v for k, v in r.__dict__.items() if not k.startswith('_')} for r in rows])


@demand_upload_router.post("/upload", response_model=ResponseDto)
async def upload_demand(
    file: Annotated[UploadFile, File()],
    created_by: Annotated[str, Form()],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.utils.excel_parser import parse_workbook  # noqa: PLC0415
    from smarthire.models.demand import DemandBatch, DemandData  # noqa: PLC0415

    file_bytes = await file.read()
    required_headers = ["JD Code", "Technology", "Account", "BU"]
    valid_rows, error_rows = parse_workbook(file_bytes, required_headers)
    batch = DemandBatch(created_by=created_by)
    db.add(batch)
    await db.flush()
    return ok_response(
        [{"valid": len(valid_rows), "errors": len(error_rows)}],
        "Demand upload processed",
    )


@bench_router.get("/getBenchInfo", response_model=ResponseDto)
async def get_bench_info(
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    from smarthire.models.bench import BenchData  # noqa: PLC0415
    from sqlalchemy import select  # noqa: PLC0415

    result = await db.execute(select(BenchData))
    rows = result.scalars().all()
    return ok_response([{k: v for k, v in r.__dict__.items() if not k.startswith('_')} for r in rows])


@bench_upload_router.post("/upload", response_model=ResponseDto)
async def upload_bench(
    file: Annotated[UploadFile, File()],
    created_by: Annotated[str, Form()],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.utils.excel_parser import parse_workbook  # noqa: PLC0415
    from smarthire.models.bench import BenchBatch  # noqa: PLC0415

    file_bytes = await file.read()
    required_headers = ["Employee ID", "Name", "Technology"]
    valid_rows, error_rows = parse_workbook(file_bytes, required_headers)
    batch = BenchBatch(created_by=created_by)
    db.add(batch)
    await db.flush()
    return ok_response(
        [{"valid": len(valid_rows), "errors": len(error_rows)}],
        "Bench upload processed",
    )


@supply_router.get("/getSupplyInfo", response_model=ResponseDto)
async def get_supply_info(
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    from smarthire.models.bench import BenchData  # noqa: PLC0415
    from sqlalchemy import select  # noqa: PLC0415

    result = await db.execute(select(BenchData))
    rows = result.scalars().all()
    return ok_response([{k: v for k, v in r.__dict__.items() if not k.startswith('_')} for r in rows])
