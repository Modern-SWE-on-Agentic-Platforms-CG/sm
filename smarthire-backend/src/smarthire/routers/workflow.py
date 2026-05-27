"""Workflow / approval chain router."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.auth.dependencies import get_current_user
from smarthire.database import get_db_session
from smarthire.models.candidate import CandidateDetail, CandidateStatus
from smarthire.schemas.common import ResponseDto, ok_response

router = APIRouter(
    prefix="/workflow",
    tags=["workflow"],
    dependencies=[Depends(get_current_user)],
)

# Candidates pending tower lead approval: status_id=2 (SHORTLISTED)
_PENDING_STATUS_ID = 2


@router.get("/candidates", response_model=ResponseDto)
async def get_workflow_candidates(
    db: Annotated[AsyncSession, Depends(get_db_session)],
    page: int = Query(default=0),
    pageSize: int = Query(default=20),
) -> ResponseDto:
    stmt = (
        select(CandidateDetail, CandidateStatus)
        .join(
            CandidateStatus,
            (CandidateStatus.candidate_id == CandidateDetail.id)
            & (CandidateStatus.status_end_date.is_(None)),
            isouter=True,
        )
        .where(CandidateDetail.active_flag == True)  # noqa: E712
        .where(CandidateStatus.status_id == _PENDING_STATUS_ID)
        .offset(page * pageSize)
        .limit(pageSize)
    )
    result = await db.execute(stmt)
    rows = result.all()

    items = [
        {
            "candidateId": str(c.id),
            "candidateName": c.candidate_name,
            "technology": "",
            "bu": "",
            "experience": float(c.total_exp) if c.total_exp else 0,
            "currentStage": "TOWER_LEAD",
            "currentDecision": "PENDING",
            "submittedAt": c.recvd_date.isoformat() if c.recvd_date else "",
            "submittedBy": c.created_by or "",
        }
        for c, _s in rows
    ]
    return ok_response({"items": items, "total": len(items), "page": page, "pageSize": pageSize})


@router.post("/approve", response_model=ResponseDto)
async def approve_candidates(
    body: dict,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[Any, Depends(get_current_user)],
) -> ResponseDto:
    candidate_ids = body.get("candidateIds", [])
    if candidate_ids:
        from datetime import datetime  # noqa: PLC0415
        from smarthire.models.candidate import CandidateInfoDetail  # noqa: PLC0415

        for cid in candidate_ids:
            await db.execute(
                update(CandidateStatus)
                .where(
                    CandidateStatus.candidate_id == int(cid),
                    CandidateStatus.status_end_date.is_(None),
                )
                .values(status_end_date=datetime.utcnow())
            )
            new_status = CandidateStatus(
                candidate_id=int(cid),
                status_id=7,  # L2_SELECTED (approved)
                status_start_date=datetime.utcnow(),
                changed_by=getattr(current_user, "email", "tower_lead"),
            )
            db.add(new_status)
        await db.commit()
    return ok_response({"approved": len(candidate_ids)}, "Candidates approved")


@router.post("/reject", response_model=ResponseDto)
async def reject_candidates(
    body: dict,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[Any, Depends(get_current_user)],
) -> ResponseDto:
    candidate_ids = body.get("candidateIds", [])
    if candidate_ids:
        from datetime import datetime  # noqa: PLC0415

        for cid in candidate_ids:
            await db.execute(
                update(CandidateStatus)
                .where(
                    CandidateStatus.candidate_id == int(cid),
                    CandidateStatus.status_end_date.is_(None),
                )
                .values(status_end_date=datetime.utcnow())
            )
            new_status = CandidateStatus(
                candidate_id=int(cid),
                status_id=8,  # L2_REJECTED
                status_start_date=datetime.utcnow(),
                changed_by=getattr(current_user, "email", "tower_lead"),
            )
            db.add(new_status)
        await db.commit()
    return ok_response({"rejected": len(candidate_ids)}, "Candidates rejected")


@router.post("/hold", response_model=ResponseDto)
async def hold_candidates(
    body: dict,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[Any, Depends(get_current_user)],
) -> ResponseDto:
    candidate_ids = body.get("candidateIds", [])
    if candidate_ids:
        from datetime import datetime  # noqa: PLC0415

        for cid in candidate_ids:
            await db.execute(
                update(CandidateStatus)
                .where(
                    CandidateStatus.candidate_id == int(cid),
                    CandidateStatus.status_end_date.is_(None),
                )
                .values(status_end_date=datetime.utcnow())
            )
            new_status = CandidateStatus(
                candidate_id=int(cid),
                status_id=14,  # ON_HOLD
                status_start_date=datetime.utcnow(),
                changed_by=getattr(current_user, "email", "tower_lead"),
            )
            db.add(new_status)
        await db.commit()
    return ok_response({"held": len(candidate_ids)}, "Candidates put on hold")


@router.get("/history/{candidate_id}", response_model=ResponseDto)
async def get_approval_history(
    candidate_id: str,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    stmt = (
        select(CandidateStatus)
        .where(CandidateStatus.candidate_id == int(candidate_id))
        .order_by(CandidateStatus.status_start_date.desc())
    )
    result = await db.execute(stmt)
    statuses = result.scalars().all()
    history = [
        {
            "statusId": s.status_id,
            "startDate": s.status_start_date.isoformat() if s.status_start_date else None,
            "endDate": s.status_end_date.isoformat() if s.status_end_date else None,
            "changedBy": s.changed_by,
        }
        for s in statuses
    ]
    return ok_response({"candidateId": candidate_id, "history": history})
