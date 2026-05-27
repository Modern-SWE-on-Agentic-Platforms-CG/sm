"""Employee/user repository."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.models.employee import EmployeeMaster, EmployeeRoleDetails, EmployeeTechnologyDetails
from smarthire.schemas.user import UserRegistrationRequest


class EmployeeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_employee(
        self, data: UserRegistrationRequest, created_by: str | None = None
    ) -> EmployeeMaster:
        emp = EmployeeMaster(
            employee_id=data.employee_id,
            first_name=data.first_name,
            last_name=data.last_name,
            email_id=str(data.email_id),
            grade_id=data.grade_id,
            practice_id=data.practice_id,
            bu_id=data.bu_id,
            supervisor_email=data.supervisor_email,
            created_by=created_by,
        )
        self._session.add(emp)
        await self._session.flush()

        for role_id in data.role_ids:
            self._session.add(
                EmployeeRoleDetails(
                    employee_id=emp.id,
                    role_id=role_id,
                    active_flag=True,
                    created_by=created_by,
                )
            )

        for tech_id in data.technology_ids:
            self._session.add(
                EmployeeTechnologyDetails(
                    employee_id=emp.id,
                    technology_id=tech_id,
                    primary_flag=False,
                    active_flag=True,
                    created_by=created_by,
                )
            )

        await self._session.flush()
        return emp

    async def get_by_id(self, employee_pk: int) -> EmployeeMaster | None:
        result = await self._session.execute(
            select(EmployeeMaster).where(EmployeeMaster.id == employee_pk)
        )
        return result.scalar_one_or_none()

    async def get_by_employee_id(self, employee_id: str) -> EmployeeMaster | None:
        result = await self._session.execute(
            select(EmployeeMaster).where(EmployeeMaster.employee_id == employee_id)
        )
        return result.scalar_one_or_none()

    async def assign_role(
        self, employee_pk: int, role_id: int, active_flag: bool = True, created_by: str | None = None
    ) -> EmployeeRoleDetails:
        detail = EmployeeRoleDetails(
            employee_id=employee_pk,
            role_id=role_id,
            active_flag=active_flag,
            created_by=created_by,
        )
        self._session.add(detail)
        await self._session.flush()
        return detail
