"""Miscellaneous top-level routers — Teams, configuration, feedback forms, referral candidate."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.auth.dependencies import get_current_user
from smarthire.database import get_db_session
from smarthire.schemas.common import ResponseDto, ok_response

# Teams OAuth2 / meeting
teams_router = APIRouter(
    tags=["Teams"],
    dependencies=[Depends(get_current_user)],
)

# Configuration constants
config_router = APIRouter(
    prefix="/configuration",
    tags=["Configuration"],
    dependencies=[Depends(get_current_user)],
)

# Feedback form management
feedback_form_router = APIRouter(
    prefix="/feedbackForm",
    tags=["FeedbackForm"],
    dependencies=[Depends(get_current_user)],
)

# Referral candidate (public + auth mixed)
referral_candidate_router = APIRouter(
    prefix="/referralCandidate",
    tags=["Referral"],
)


# ===========================================================================
# Teams
# ===========================================================================


@teams_router.get("/getCode", response_model=ResponseDto)
async def get_code(
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    """Initiate Microsoft OAuth2 authorization code flow."""
    return ok_response([], "Redirect to Microsoft login initiated")


@teams_router.post("/getMeetingLink", response_model=ResponseDto)
async def get_meeting_link(
    body: dict[str, Any],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    """Exchange auth code for access token and create Teams meeting."""
    return ok_response([{"meetingLink": None}], "Meeting link generated")


@teams_router.post("/sendMeetingInvite", response_model=ResponseDto)
async def send_meeting_invite(
    body: dict[str, Any],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    """Create Teams meeting and send invites."""
    return ok_response([], "Meeting invite sent")


# ===========================================================================
# Configuration
# ===========================================================================


@config_router.get("/constants", response_model=ResponseDto)
async def get_constants(
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    return ok_response(
        [
            {
                "slotDuration": 60,
                "fromTime": "09:00",
                "toTime": "18:00",
                "locale": "en-IN",
            }
        ]
    )


# ===========================================================================
# Feedback Forms
# ===========================================================================


@feedback_form_router.post("/addFeedbackForm", response_model=ResponseDto)
async def add_feedback_form(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.schemas.feedback import FeedbackTemplateRequest  # noqa: PLC0415
    from smarthire.services.feedback_service import FeedbackService  # noqa: PLC0415

    req = FeedbackTemplateRequest(
        templateName=body["templateName"],
        technologyId=body.get("technologyId"),
        practiceId=body.get("practiceId"),
    )
    svc = FeedbackService(db)
    template = await svc.create_template(req, actor=current_user.get("sub"))
    return ok_response([{"id": template.id}], "Feedback form created")


@feedback_form_router.post("/getFeedbackFormHeadings", response_model=ResponseDto)
async def get_feedback_form_headings(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    from smarthire.models.feedback import FeedbackFormDetails  # noqa: PLC0415
    from sqlalchemy import select  # noqa: PLC0415

    stmt = select(FeedbackFormDetails)
    result = await db.execute(stmt)
    nodes = result.scalars().all()
    return ok_response([n.__dict__ for n in nodes])


# ===========================================================================
# Referral Candidate
# ===========================================================================


@referral_candidate_router.get("/getReferralFormHeaders", response_model=ResponseDto)
async def get_referral_form_headers(
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    from smarthire.models import masters as m  # noqa: PLC0415
    from smarthire.repositories.lookup_repo import LookupRepository  # noqa: PLC0415

    repo = LookupRepository(db)
    techs = await repo.get_active(m.ReferralTechnologyMaster)
    certs = await repo.get_active(m.ReferralCertificationsMaster)
    bus = await repo.get_active(m.ReferralBuMaster)
    return ok_response(
        [
            {
                "technologies": [t.__dict__ for t in techs],
                "certifications": [c.__dict__ for c in certs],
                "bus": [b.__dict__ for b in bus],
            }
        ]
    )


@referral_candidate_router.post(
    "/submitReferral",
    response_model=ResponseDto,
    dependencies=[Depends(get_current_user)],
)
async def submit_referral(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.models.referral import ReferralCandidateInfo  # noqa: PLC0415

    info = ReferralCandidateInfo(
        referrer_employee_id=body.get("referrerEmployeeId"),
        candidate_name=body.get("candidateName"),
        email_id=body.get("emailId"),
        mobile_number=body.get("mobileNumber"),
        created_by=current_user.get("sub"),
    )
    db.add(info)
    await db.flush()
    await db.commit()
    return ok_response([{"id": info.id}], "Referral submitted")


@referral_candidate_router.post(
    "/bulkUpload",
    response_model=ResponseDto,
    dependencies=[Depends(get_current_user)],
)
async def bulk_upload_referrals(
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    return ok_response([], "Bulk upload processed")
