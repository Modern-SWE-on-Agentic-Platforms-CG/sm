"""User registration and role management router (US6)."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.auth.dependencies import get_current_user
from smarthire.database import get_db_session
from smarthire.schemas.common import ResponseDto, ok_response
from smarthire.schemas.user import RoleAssignRequest, UserRegistrationRequest
from smarthire.services.user_service import UserService

router = APIRouter(
    prefix="/user",
    tags=["user"],
    dependencies=[Depends(get_current_user)],
)


@router.post("/register", response_model=ResponseDto)
async def register_user(
    data: UserRegistrationRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    svc = UserService(db)
    emp = await svc.register_user(data, actor=current_user.get("sub"))
    return ok_response([{"id": emp.id}], "User registered")


@router.get("/{employee_pk}", response_model=ResponseDto)
async def get_user(
    employee_pk: int,
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    svc = UserService(db)
    emp = await svc.get_user(employee_pk)
    if emp is None:
        raise HTTPException(status_code=404, detail="User not found")
    return ok_response([emp.__dict__])


@router.post("/assignRole", response_model=ResponseDto)
async def assign_role(
    req: RoleAssignRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    svc = UserService(db)
    result = await svc.assign_role(req, actor=current_user.get("sub"))
    return ok_response([result], "Role assigned")
