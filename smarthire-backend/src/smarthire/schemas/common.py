"""Shared Pydantic response schema used across all endpoints."""

from typing import Any

from pydantic import BaseModel


class ResponseDto(BaseModel):
    """Standard API response envelope.

    Every endpoint returns this shape:
    {
        "response": [...],   // main payload
        "message": "...",    // human-readable status
        "exception": null,   // error detail when non-null
        "result": null       // optional extra flag
    }
    """

    response: list[Any] = []
    message: str = "success"
    exception: str | None = None
    result: str | None = None


def ok_response(data: list[Any] | Any, message: str = "success") -> ResponseDto:
    """Wrap a successful result in ResponseDto."""
    payload = data if isinstance(data, list) else [data]
    return ResponseDto(response=payload, message=message)


def error_response(message: str, exception: str | None = None) -> ResponseDto:
    """Wrap an error in ResponseDto."""
    return ResponseDto(response=[], message=message, exception=exception)
