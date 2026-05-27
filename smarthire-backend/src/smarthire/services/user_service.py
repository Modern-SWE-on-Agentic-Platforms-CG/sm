"""User registration service (US6)."""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.models.employee import EmployeeMaster
from smarthire.repositories.employee_repo import EmployeeRepository
from smarthire.schemas.user import RoleAssignRequest, UserRegistrationRequest

logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = EmployeeRepository(session)
        self._session = session

    async def register_user(
        self, data: UserRegistrationRequest, actor: str | None = None
    ) -> EmployeeMaster:
        emp = await self._repo.create_employee(data, created_by=actor)
        await self._session.commit()
        logger.info("Registered employee %s", data.employee_id)
        return emp

    async def get_user(self, employee_pk: int) -> EmployeeMaster | None:
        return await self._repo.get_by_id(employee_pk)

    async def assign_role(
        self, req: RoleAssignRequest, actor: str | None = None
    ) -> dict[str, Any]:
        detail = await self._repo.assign_role(
            employee_pk=req.employee_id,
            role_id=req.role_id,
            active_flag=req.active_flag,
            created_by=actor,
        )
        await self._session.commit()
        return {"employee_id": req.employee_id, "role_id": req.role_id}
