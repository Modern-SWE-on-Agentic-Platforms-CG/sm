"""Auth Pydantic schemas."""

from pydantic import BaseModel, Field


class ValidateSessionRequest(BaseModel):
    user_name: str = Field(alias="userName")

    model_config = {"populate_by_name": True}


class SessionValidationResponse(BaseModel):
    status: str  # "ok" | "duplicate" | "not_found"
    user_name: str | None = None
    session_count: int = 0
