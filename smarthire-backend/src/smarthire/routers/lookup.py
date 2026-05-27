"""Lookup (master data) router.

Provides generic endpoints to retrieve all active master table entries.
Specific models are mapped by a path parameter.
"""

from __future__ import annotations

from typing import Annotated, Any, Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.auth.dependencies import get_current_user
from smarthire.database import get_db_session
from smarthire.models import masters as m
from smarthire.schemas.common import ResponseDto, ok_response
from smarthire.services.lookup_service import LookupService

router = APIRouter(
    prefix="/lookup",
    tags=["lookup"],
    dependencies=[Depends(get_current_user)],
)

# Map URL segment → SQLAlchemy model class
_MODEL_MAP: dict[str, Any] = {
    "grade": m.GradeMaster,
    "bu": m.BuMaster,
    "practice": m.PracticeMaster,
    "technology": m.TechnologyMaster,
    "tower": m.TowerMaster,
    "skillGroup": m.SkillGroupMaster,
    "status": m.StatusMaster,
    "role": m.RoleMaster,
    "account": m.AccountMaster,
    "marketUnit": m.MarketUnit,
    "location": m.LocationMaster,
    "interviewType": m.InterviewTypeMaster,
    "source": m.SourceMaster,
    "rejectionReason": m.RejectionReasonMaster,
    "declineReason": m.DeclineReasonMaster,
    "dataType": m.DataTypeMaster,
    "notificationType": m.NotificationTypeMaster,
    "benchStatus": m.BenchStatusMaster,
}


@router.get("/{entity}", response_model=ResponseDto)
async def get_lookup(
    entity: str,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    model_class = _MODEL_MAP.get(entity)
    if model_class is None:
        from fastapi import HTTPException  # noqa: PLC0415

        raise HTTPException(status_code=404, detail=f"Unknown lookup entity: {entity}")

    svc = LookupService(db)
    rows = await svc.get_active(model_class)
    return ok_response([{k: v for k, v in row.__dict__.items() if not k.startswith('_')} for row in rows])


@router.post("/{entity}", response_model=ResponseDto)
async def create_lookup(
    entity: str,
    body: dict,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[Any, Depends(get_current_user)],
) -> ResponseDto:
    from fastapi import HTTPException  # noqa: PLC0415
    from datetime import datetime  # noqa: PLC0415

    model_class = _MODEL_MAP.get(entity)
    if model_class is None:
        raise HTTPException(status_code=404, detail=f"Unknown lookup entity: {entity}")

    actor = current_user.get("sub", "admin")
    name = body.get("name") or body.get("tower_name") or body.get("skill_name") or body.get("group_name") or body.get("source_name") or ""
    if not name:
        raise HTTPException(status_code=422, detail="'name' field is required")

    # Determine the name column for this model
    col_names = [c.key for c in model_class.__table__.columns]
    name_col = next((c for c in col_names if 'name' in c.lower()), None)
    if not name_col:
        raise HTTPException(status_code=422, detail="Cannot determine name column for entity")

    kwargs: dict[str, Any] = {name_col: name, "active_flag": True}
    if "created_by" in col_names:
        kwargs["created_by"] = actor
    if "created_date" in col_names:
        kwargs["created_date"] = datetime.utcnow()

    record = model_class(**kwargs)
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return ok_response([{k: v for k, v in record.__dict__.items() if not k.startswith('_')}], "Record created")


@router.put("/{entity}/{record_id}", response_model=ResponseDto)
async def update_lookup(
    entity: str,
    record_id: int,
    body: dict,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[Any, Depends(get_current_user)],
) -> ResponseDto:
    from fastapi import HTTPException  # noqa: PLC0415
    from sqlalchemy import select  # noqa: PLC0415
    from datetime import datetime  # noqa: PLC0415

    model_class = _MODEL_MAP.get(entity)
    if model_class is None:
        raise HTTPException(status_code=404, detail=f"Unknown lookup entity: {entity}")

    result = await db.execute(select(model_class).where(model_class.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    col_names = [c.key for c in model_class.__table__.columns]
    name_col = next((c for c in col_names if 'name' in c.lower()), None)
    if name_col and body.get("name"):
        setattr(record, name_col, body["name"])
    if "updated_by" in col_names:
        setattr(record, "updated_by", current_user.get("sub", "admin"))
    if "updated_date" in col_names:
        setattr(record, "updated_date", datetime.utcnow())

    await db.commit()
    await db.refresh(record)
    return ok_response([{k: v for k, v in record.__dict__.items() if not k.startswith('_')}], "Record updated")


@router.delete("/{entity}/{record_id}", response_model=ResponseDto)
async def delete_lookup(
    entity: str,
    record_id: int,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[Any, Depends(get_current_user)],
) -> ResponseDto:
    from fastapi import HTTPException  # noqa: PLC0415
    from sqlalchemy import select  # noqa: PLC0415

    model_class = _MODEL_MAP.get(entity)
    if model_class is None:
        raise HTTPException(status_code=404, detail=f"Unknown lookup entity: {entity}")

    result = await db.execute(select(model_class).where(model_class.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    col_names = [c.key for c in model_class.__table__.columns]
    if "active_flag" in col_names:
        setattr(record, "active_flag", False)
        await db.commit()
    else:
        await db.delete(record)
        await db.commit()
    return ok_response([], "Record deleted")





# ===========================================================================
# Contract-specific named lookup endpoints
# ===========================================================================


@router.get("/skills", response_model=ResponseDto)
async def get_skills(db: Annotated[AsyncSession, Depends(get_db_session)]) -> ResponseDto:
    svc = LookupService(db)
    return ok_response([{k: v for k, v in r.__dict__.items() if not k.startswith('_')} for r in await svc.get_active(m.TechnologyMaster)])


@router.get("/grade", response_model=ResponseDto)
async def get_grades(db: Annotated[AsyncSession, Depends(get_db_session)]) -> ResponseDto:
    svc = LookupService(db)
    return ok_response([{k: v for k, v in r.__dict__.items() if not k.startswith('_')} for r in await svc.get_active(m.GradeMaster)])


@router.get("/locations", response_model=ResponseDto)
async def get_locations(db: Annotated[AsyncSession, Depends(get_db_session)]) -> ResponseDto:
    svc = LookupService(db)
    return ok_response([{k: v for k, v in r.__dict__.items() if not k.startswith('_')} for r in await svc.get_active(m.LocationMaster)])


@router.get("/roles", response_model=ResponseDto)
async def get_roles(db: Annotated[AsyncSession, Depends(get_db_session)]) -> ResponseDto:
    svc = LookupService(db)
    return ok_response([{k: v for k, v in r.__dict__.items() if not k.startswith('_')} for r in await svc.get_active(m.RoleMaster)])


@router.get("/getRejectionReasons", response_model=ResponseDto)
async def get_rejection_reasons(
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    svc = LookupService(db)
    return ok_response([{k: v for k, v in r.__dict__.items() if not k.startswith('_')} for r in await svc.get_active(m.RejectionReasonMaster)])


@router.get("/getDeclineReasons", response_model=ResponseDto)
async def get_decline_reasons(
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    svc = LookupService(db)
    return ok_response([{k: v for k, v in r.__dict__.items() if not k.startswith('_')} for r in await svc.get_active(m.DeclineReasonMaster)])


@router.post("/fetchDropdown", response_model=ResponseDto)
async def fetch_dropdown(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    """Generic dropdown fetch by screen ID."""
    return ok_response([])


@router.post("/fetchMarketUnit", response_model=ResponseDto)
async def fetch_market_unit(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    from sqlalchemy import select  # noqa: PLC0415

    stmt = select(m.MarketUnit)
    if body.get("buId"):
        stmt = stmt.where(m.MarketUnit.bu_id == body["buId"])
    result = await db.execute(stmt)
    rows = result.scalars().all()
    return ok_response([{k: v for k, v in r.__dict__.items() if not k.startswith('_')} for r in rows])


@router.post("/fetchPractices", response_model=ResponseDto)
async def fetch_practices(
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    svc = LookupService(db)
    return ok_response([{k: v for k, v in r.__dict__.items() if not k.startswith('_')} for r in await svc.get_active(m.PracticeMaster)])

