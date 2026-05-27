"""File management routers — image, MSG, PDF manual, slot bulk upload."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.auth.dependencies import get_current_user
from smarthire.database import get_db_session
from smarthire.schemas.common import ResponseDto, ok_response

image_router = APIRouter(
    prefix="/image",
    tags=["Files"],
    dependencies=[Depends(get_current_user)],
)

msg_router = APIRouter(
    prefix="/msg",
    tags=["Files"],
    dependencies=[Depends(get_current_user)],
)

pdf_router = APIRouter(
    prefix="/pdfDownload",
    tags=["Files"],
    dependencies=[Depends(get_current_user)],
)

slot_router = APIRouter(
    prefix="/slot",
    tags=["Slot"],
    dependencies=[Depends(get_current_user)],
)


@image_router.get("/getCandidateImage", response_model=ResponseDto)
async def get_candidate_image(
    candidateId: Annotated[int, Query()],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.models.candidate import CandidateDetail  # noqa: PLC0415
    from smarthire.utils.s3_client import s3_client  # noqa: PLC0415
    from sqlalchemy import select  # noqa: PLC0415

    result = await db.execute(
        select(CandidateDetail).where(CandidateDetail.id == candidateId)
    )
    candidate = result.scalar_one_or_none()
    if not candidate or not candidate.profile_image_s3_key:
        return ok_response([])
    url = await s3_client.generate_presigned_url(candidate.profile_image_s3_key)
    return ok_response([{"url": url}])


@image_router.post("/uploadProfileImage", response_model=ResponseDto)
async def upload_profile_image(
    file: Annotated[UploadFile, File()],
    candidateId: Annotated[int, Form()],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.models.candidate import CandidateDetail  # noqa: PLC0415
    from smarthire.utils.s3_client import s3_client  # noqa: PLC0415
    from sqlalchemy import update  # noqa: PLC0415

    file_bytes = await file.read()
    s3_key = f"profile_images/{candidateId}/{file.filename}"
    await s3_client.upload_file(file_bytes, s3_key)
    await db.execute(
        update(CandidateDetail)
        .where(CandidateDetail.id == candidateId)
        .values(profile_image_s3_key=s3_key)
    )
    await db.commit()
    return ok_response([{"s3_key": s3_key}], "Image uploaded")


@msg_router.get("/getMSGAttachment", response_model=ResponseDto)
async def get_msg_attachment(
    candidateId: Annotated[int, Query()],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.utils.s3_client import s3_client  # noqa: PLC0415

    s3_key = f"msg_attachments/{candidateId}/attachment.msg"
    url = await s3_client.generate_presigned_url(s3_key)
    return ok_response([{"url": url}])


@pdf_router.post("/uploadUserManual", response_model=ResponseDto)
async def upload_user_manual(
    file: Annotated[UploadFile, File()],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.utils.s3_client import s3_client  # noqa: PLC0415

    file_bytes = await file.read()
    s3_key = "manuals/user_manual.pdf"
    await s3_client.upload_file(file_bytes, s3_key)
    return ok_response([{"s3_key": s3_key}], "Manual uploaded")


@slot_router.post("/panelSlotUpload", response_model=ResponseDto)
async def panel_slot_upload(
    file: Annotated[UploadFile, File()],
    createdBy: Annotated[str, Form()],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.utils.excel_parser import parse_workbook  # noqa: PLC0415

    file_bytes = await file.read()
    required = ["Interviewer ID", "Interview Date", "Start Time", "Interview Type"]
    valid_rows, error_rows = parse_workbook(file_bytes, required)
    return ok_response(
        [{"valid": len(valid_rows), "errors": len(error_rows)}],
        "Panel slot upload processed",
    )
