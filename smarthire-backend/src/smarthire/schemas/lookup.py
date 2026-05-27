"""Lookup / master data Pydantic schemas."""

from pydantic import BaseModel


class LookupItem(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class SkillDLRequest(BaseModel):
    technology_id: int
    dl_email: str

    model_config = {"populate_by_name": True}
