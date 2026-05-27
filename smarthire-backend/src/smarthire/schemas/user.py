"""User registration and role schemas (US6)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class UserRegistrationRequest(BaseModel):
    employee_id: str = Field(alias="employeeId")
    first_name: str = Field(alias="firstName")
    last_name: str = Field(alias="lastName")
    email_id: str = Field(alias="emailId")
    grade_id: int | None = Field(default=None, alias="gradeId")
    practice_id: int | None = Field(default=None, alias="practiceId")
    bu_id: int | None = Field(default=None, alias="buId")
    supervisor_email: str | None = Field(default=None, alias="supervisorEmail")
    role_ids: list[int] = Field(default_factory=list, alias="roleIds")
    technology_ids: list[int] = Field(default_factory=list, alias="technologyIds")

    model_config = {"populate_by_name": True}


class RoleAssignRequest(BaseModel):
    employee_id: int = Field(alias="employeeId")
    role_id: int = Field(alias="roleId")
    active_flag: bool = Field(default=True, alias="activeFlag")

    model_config = {"populate_by_name": True}


class UserResponse(BaseModel):
    id: int
    employee_id: str
    first_name: str
    last_name: str
    email_id: str
    active_flag: bool

    model_config = {"from_attributes": True}
