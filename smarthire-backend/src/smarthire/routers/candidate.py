"""Candidate data router.

Endpoints mirror the contract in docs/02-candidate-management.md:
  POST  /candidateData/addCandidateData
  GET   /candidateData/getCandidateData/{id}
  POST  /candidateData/searchCandidates
  POST  /candidateData/changeCandidateStatus
  GET   /candidateData/getStatusHistory/{id}
  POST  /candidateData/addComment
  GET   /candidateData/getComments/{id}
  GET   /candidateData/getAttachment/{s3_key:path}
"""

from __future__ import annotations

import logging
from typing import Annotated, Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.auth.dependencies import get_current_user
from smarthire.database import get_db_session
from smarthire.schemas.candidate import (
    CandidateDataRequest,
    CandidateSearchRequest,
    CommentRequest,
    StatusChangeRequest,
)
from smarthire.schemas.common import ResponseDto, error_response, ok_response
from smarthire.services.candidate_service import CandidateService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/candidateData",
    tags=["candidate"],
    dependencies=[Depends(get_current_user)],
)


@router.post("/addCandidateData", response_model=ResponseDto)
async def add_candidate_data(
    data: CandidateDataRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    svc = CandidateService(db)
    candidate = await svc.add_candidate(data, actor=current_user.get("sub"))
    return ok_response([{"id": candidate.id}], "Candidate added successfully")


@router.get("/getCandidateData/{candidate_id}", response_model=ResponseDto)
async def get_candidate_data(
    candidate_id: int,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    svc = CandidateService(db)
    candidate = await svc.get_candidate(candidate_id)
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return ok_response([{k: v for k, v in candidate.__dict__.items() if not k.startswith('_')}])


@router.post("/searchCandidates", response_model=ResponseDto)
async def search_candidates(
    filters: CandidateSearchRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    from sqlalchemy import select, and_  # noqa: PLC0415
    from smarthire.models.candidate import CandidateStatus  # noqa: PLC0415
    from smarthire.models.masters import StatusMaster  # noqa: PLC0415

    svc = CandidateService(db)
    rows, total = await svc.search(filters)

    # Fetch current status for each candidate in one query
    candidate_ids = [r.id for r in rows]
    status_map: dict[int, tuple[int, str]] = {}
    if candidate_ids:
        status_result = await db.execute(
            select(CandidateStatus.candidate_id, CandidateStatus.status_id, StatusMaster.name)
            .join(StatusMaster, CandidateStatus.status_id == StatusMaster.id)
            .where(
                and_(
                    CandidateStatus.candidate_id.in_(candidate_ids),
                    CandidateStatus.status_end_date.is_(None),
                )
            )
        )
        for row in status_result:
            status_map[row.candidate_id] = (row.status_id, row.name)

    def row_to_dict(r: Any) -> dict[str, Any]:
        d = {k: v for k, v in r.__dict__.items() if not k.startswith('_')}
        status_id, status_name = status_map.get(r.id, (1, "ACTIVE"))
        d["current_status_id"] = status_id
        d["status"] = status_name
        return d

    return ok_response(
        [row_to_dict(r) for r in rows],
        f"Found {total} candidates",
    )


@router.post("/changeCandidateStatus", response_model=ResponseDto)
async def change_candidate_status(
    req: StatusChangeRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    svc = CandidateService(db)
    result = await svc.change_status(req, actor=current_user.get("sub"))
    return ok_response([result], "Status updated")


@router.get("/getStatusHistory/{candidate_id}", response_model=ResponseDto)
async def get_status_history(
    candidate_id: int,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    svc = CandidateService(db)
    history = await svc.get_status_history(candidate_id)
    return ok_response([h.__dict__ for h in history])


@router.post("/addComment", response_model=ResponseDto)
async def add_comment(
    candidate_id: Annotated[int, Form()],
    comment_text: Annotated[str, Form()],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    attachment: UploadFile | None = File(default=None),
) -> ResponseDto:
    req = CommentRequest(
        candidateId=candidate_id,
        commentText=comment_text,
        attachmentFileName=attachment.filename if attachment else None,
    )
    file_bytes = await attachment.read() if attachment else None
    svc = CandidateService(db)
    result = await svc.add_comment(
        req,
        file_bytes=file_bytes,
        file_name=attachment.filename if attachment else None,
        actor=current_user.get("sub"),
    )
    return ok_response([result], "Comment added")


@router.get("/getComments/{candidate_id}", response_model=ResponseDto)
async def get_comments(
    candidate_id: int,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    svc = CandidateService(db)
    comments = await svc.get_comments(candidate_id)
    return ok_response([c.__dict__ for c in comments])


@router.get("/getAttachment/{s3_key:path}", response_model=ResponseDto)
async def get_attachment(
    s3_key: str,
    _current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.utils.s3_client import s3_client  # noqa: PLC0415

    url = await s3_client.generate_presigned_url(s3_key)
    return ok_response([{"url": url}])


# ===========================================================================
# Additional contract paths matching openapi.yaml
# ===========================================================================


@router.post("/saveCandidateData", response_model=ResponseDto)
async def save_candidate_data(
    data: CandidateDataRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    """Create or update candidate (contract alias for addCandidateData)."""
    svc = CandidateService(db)
    candidate = await svc.add_candidate(data, actor=current_user.get("sub"))
    return ok_response([{"id": candidate.id}], "Candidate saved")


@router.post("/getCandidateData", response_model=ResponseDto)
async def get_candidate_data_search(
    filters: CandidateSearchRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    """Search candidates — contract POST variant (no path param)."""
    svc = CandidateService(db)
    rows, total = await svc.search(filters)
    return ok_response([{k: v for k, v in r.__dict__.items() if not k.startswith('_')} for r in rows], f"Found {total} candidates")


@router.post("/createNewEntry", response_model=ResponseDto)
async def create_new_entry(
    data: CandidateDataRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    """Create a candidate with a new skill."""
    svc = CandidateService(db)
    candidate = await svc.add_candidate(data, actor=current_user.get("sub"))
    return ok_response([{"id": candidate.id}], "Entry created")


@router.post("/saveSkillDL", response_model=ResponseDto)
async def save_skill_dl(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    """Map technology to DL email address."""
    from smarthire.models.masters import SkillGroupDlMaster  # noqa: PLC0415

    dl = SkillGroupDlMaster(
        dl_email=body.get("dlEmail"),
        skill_group_id=body.get("technologyId"),
        created_by=_user.get("sub"),
    )
    db.add(dl)
    await db.flush()
    await db.commit()
    return ok_response([{"id": dl.id}], "Skill DL mapping saved")
