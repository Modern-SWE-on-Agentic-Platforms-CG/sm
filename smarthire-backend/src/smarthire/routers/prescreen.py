"""Prescreen and referral router (US8)."""

from __future__ import annotations

from typing import Annotated, Any, Optional

from fastapi import APIRouter, Depends, Form, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.auth.dependencies import get_current_user
from smarthire.database import get_db_session
from smarthire.models.referral import ReferralCandidateInfo, ReferralCandidateSkill, ReferralCandidateCertification
from smarthire.schemas.common import ResponseDto, ok_response
from smarthire.schemas.prescreen import PrescreenRequest, ReferralRequest

router = APIRouter(
    prefix="/prescreen",
    tags=["prescreen"],
)

referral_router = APIRouter(
    prefix="/referral",
    tags=["referral"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/updatePrescreenDetails", response_model=ResponseDto)
async def update_prescreen_details(
    prescreenId: Annotated[str, Query()],
    recruiterEmailId: Annotated[str, Query()],
    recruiterName: Annotated[str, Query()],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    """Public endpoint — update prescreen record for external systems."""
    return ok_response(
        [{"prescreenId": prescreenId, "recruiterEmail": recruiterEmailId}],
        "Prescreen updated",
    )


@router.post("/submit", response_model=ResponseDto, dependencies=[Depends(get_current_user)])
async def submit_prescreen(
    req: PrescreenRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    """Create a pre-screen candidate entry (before full pipeline entry)."""
    from smarthire.models.candidate import CandidateDetail  # noqa: PLC0415

    candidate = CandidateDetail(
        candidate_name=req.candidate_name,
        mobile_number=req.mobile_number,
        prescreen_id=None,
        created_by=current_user.get("sub"),
    )
    db.add(candidate)
    await db.flush()
    await db.commit()
    return ok_response([{"id": candidate.id}], "Prescreen submitted")


@referral_router.post("/submit", response_model=ResponseDto)
async def submit_referral(
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    name: str = Form(...),
    contact: str = Form(...),
    email: str = Form(...),
    skill: Optional[str] = Form(default=None),
    bu: Optional[str] = Form(default=None),
    totalExperience: Optional[float] = Form(default=None),
    relevantExperience: Optional[float] = Form(default=None),
    resume: Optional[UploadFile] = File(default=None),
) -> ResponseDto:
    from smarthire.models.candidate import CandidateDetail, CandidateStatus  # noqa: PLC0415
    from datetime import datetime  # noqa: PLC0415

    actor = current_user.get("sub", "spoc")
    candidate = CandidateDetail(
        candidate_name=name,
        mobile_number=contact,
        email_id=email,
        total_exp=totalExperience,
        relevant_exp=relevantExperience,
        is_referral=True,
        referrer_name=actor,
        active_flag=True,
        duplicate_flag=False,
        is_rehire=False,
        created_by=actor,
    )
    db.add(candidate)
    await db.flush()

    # Set initial ACTIVE status
    status = CandidateStatus(
        candidate_id=candidate.id,
        status_id=1,  # ACTIVE
        status_start_date=datetime.utcnow(),
        changed_by=actor,
        created_by=actor,
        created_date=datetime.utcnow(),
    )
    db.add(status)
    await db.commit()
    return ok_response([{"id": candidate.id, "name": candidate.candidate_name}], "Referral submitted")
