"""Candidate service — orchestrates business rules.

Business rules:
- Only one open status record per candidate (status_end_date IS NULL).
- Transition to any status calls close_open_status first.
- L3 escalation: if l3_escalation_flag is True, send SES notification.
"""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.models.candidate import CandidateDetail
from smarthire.repositories.candidate_repo import CandidateRepository
from smarthire.schemas.candidate import (
    CandidateDataRequest,
    CandidateSearchRequest,
    CommentRequest,
    StatusChangeRequest,
)

logger = logging.getLogger(__name__)


class CandidateService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = CandidateRepository(session)
        self._session = session

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    async def add_candidate(
        self, data: CandidateDataRequest, actor: str | None = None
    ) -> CandidateDetail:
        return await self._repo.create_candidate(data, created_by=actor)

    async def get_candidate(self, candidate_id: int) -> CandidateDetail | None:
        return await self._repo.get_by_id(candidate_id)

    async def search(
        self, filters: CandidateSearchRequest
    ) -> tuple[list[CandidateDetail], int]:
        return await self._repo.search_candidates(filters)

    # ------------------------------------------------------------------
    # Status transitions
    # ------------------------------------------------------------------

    async def change_status(
        self, req: StatusChangeRequest, actor: str | None = None
    ) -> dict[str, Any]:
        """Transition candidate status — closes old open record then inserts new."""
        await self._repo.close_open_status(req.candidate_id)
        new_status = await self._repo.insert_status(req, changed_by=actor)
        await self._session.commit()
        logger.info(
            "Candidate %d status → %d by %s",
            req.candidate_id,
            req.status_id,
            actor,
        )
        return {"candidate_id": req.candidate_id, "new_status_id": req.status_id}

    async def get_status_history(self, candidate_id: int) -> list[Any]:
        return await self._repo.get_status_history(candidate_id)

    # ------------------------------------------------------------------
    # Comments + attachments
    # ------------------------------------------------------------------

    async def add_comment(
        self,
        req: CommentRequest,
        file_bytes: bytes | None = None,
        file_name: str | None = None,
        actor: str | None = None,
    ) -> dict[str, Any]:
        s3_key: str | None = None
        if file_bytes and file_name:
            from smarthire.utils.s3_client import s3_client  # noqa: PLC0415

            s3_key = f"comments/{req.candidate_id}/{file_name}"
            await s3_client.upload_file(file_bytes, s3_key)

        comment = await self._repo.add_comment(req, attachment_s3_key=s3_key, created_by=actor)
        await self._session.commit()
        return {"comment_id": comment.id, "attachment_s3_key": s3_key}

    async def get_comments(self, candidate_id: int) -> list[Any]:
        return await self._repo.get_comments(candidate_id)
