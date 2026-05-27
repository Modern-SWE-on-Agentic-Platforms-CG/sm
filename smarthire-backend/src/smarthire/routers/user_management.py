"""User management router — /register/*, /role/*, /users/* contract paths."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.auth.dependencies import get_current_user
from smarthire.database import get_db_session
from smarthire.schemas.common import ResponseDto, ok_response

# /register/* router
register_router = APIRouter(
    prefix="/register",
    tags=["UserManagement"],
    dependencies=[Depends(get_current_user)],
)

# /role/* router
role_router = APIRouter(
    prefix="/role",
    tags=["UserManagement"],
    dependencies=[Depends(get_current_user)],
)

# /users/* router
users_router = APIRouter(
    prefix="/users",
    tags=["UserManagement"],
    dependencies=[Depends(get_current_user)],
)


# ---------------------------------------------------------------------------
# /register/*
# ---------------------------------------------------------------------------


@register_router.post("/registerNewUser", response_model=ResponseDto)
async def register_new_user(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.schemas.user import UserRegistrationRequest  # noqa: PLC0415
    from smarthire.services.user_service import UserService  # noqa: PLC0415

    req = UserRegistrationRequest(**{
        "employeeId": body.get("employeeId", ""),
        "firstName": body.get("firstName", ""),
        "lastName": body.get("lastName", ""),
        "emailId": body.get("emailId", ""),
        "gradeId": body.get("gradeId"),
        "buId": body.get("buId"),
        "practiceId": body.get("practiceId"),
        "supervisorEmail": body.get("supervisorEmail"),
        "roleIds": body.get("roleIds", []),
        "technologyIds": body.get("technologyIds", []),
    })
    svc = UserService(db)
    emp = await svc.register_user(req, actor=current_user.get("sub"))
    return ok_response([{"id": emp.id}], "User registered")


@register_router.post("/updateUserDetails", response_model=ResponseDto)
async def update_user_details(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    return ok_response([], "User details updated")


@register_router.post("/removeSkill", response_model=ResponseDto)
async def remove_skill(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    from smarthire.models.employee import EmployeeTechnologyDetails  # noqa: PLC0415
    from sqlalchemy import update, select  # noqa: PLC0415
    from smarthire.models.employee import EmployeeMaster  # noqa: PLC0415

    email = body.get("emailId")
    tech_id = body.get("technologyId")
    result = await db.execute(
        select(EmployeeMaster).where(EmployeeMaster.email_id == email)
    )
    emp = result.scalar_one_or_none()
    if emp:
        await db.execute(
            update(EmployeeTechnologyDetails)
            .where(
                EmployeeTechnologyDetails.employee_id == emp.id,
                EmployeeTechnologyDetails.technology_id == tech_id,
            )
            .values(active_flag=False)
        )
        await db.commit()
    return ok_response([], "Skill removed")


# ---------------------------------------------------------------------------
# /role/*
# ---------------------------------------------------------------------------


@role_router.post("/getRole", response_model=ResponseDto)
async def get_role(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
) -> ResponseDto:
    from smarthire.models.employee import EmployeeMaster, EmployeeRoleDetails  # noqa: PLC0415
    from sqlalchemy import select  # noqa: PLC0415

    email = body.get("emailId")
    result = await db.execute(
        select(EmployeeMaster).where(EmployeeMaster.email_id == email)
    )
    emp = result.scalar_one_or_none()
    if not emp:
        return ok_response([])
    roles_result = await db.execute(
        select(EmployeeRoleDetails).where(
            EmployeeRoleDetails.employee_id == emp.id,
            EmployeeRoleDetails.active_flag == True,  # noqa: E712
        )
    )
    roles = roles_result.scalars().all()
    return ok_response([{k: v for k, v in r.__dict__.items() if not k.startswith('_')} for r in roles])


# ---------------------------------------------------------------------------
# /users/*
# ---------------------------------------------------------------------------


@users_router.post("/getUsers", response_model=ResponseDto)
async def get_users(
    body: dict[str, Any] | None = None,
    db: AsyncSession = Depends(get_db_session),
) -> ResponseDto:
    from smarthire.models.employee import EmployeeMaster  # noqa: PLC0415
    from sqlalchemy import select  # noqa: PLC0415

    stmt = select(EmployeeMaster).where(EmployeeMaster.active_flag == True)  # noqa: E712
    if body and body.get("buId"):
        stmt = stmt.where(EmployeeMaster.bu_id == body["buId"])
    result = await db.execute(stmt)
    emps = result.scalars().all()
    return ok_response([{k: v for k, v in e.__dict__.items() if not k.startswith('_')} for e in emps])


@users_router.post("/updateAssignedRole", response_model=ResponseDto)
async def update_assigned_role(
    body: dict[str, Any],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ResponseDto:
    return ok_response([], "Roles updated")
