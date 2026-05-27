"""Candidate async repository.

All DB access is via parameterised SQLAlchemy ORM queries.
Raw f-string SQL is forbidden per constitution §V.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from smarthire.models.candidate import (
    CandidateComments,
    CandidateDetail,
    CandidateInfoDetail,
    CandidateSkill,
    CandidateStatus,
)
from smarthire.schemas.candidate import (
    CandidateDataRequest,
    CandidateSearchRequest,
    CommentRequest,
    StatusChangeRequest,
)


class CandidateRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ------------------------------------------------------------------
    # Create
    # ------------------------------------------------------------------

    async def create_candidate(
        self, data: CandidateDataRequest, created_by: str | None = None
    ) -> CandidateDetail:
        candidate = CandidateDetail(
            candidate_name=data.candidate_name,
            email_id=data.email_id,
            mobile_number=data.mobile_number,
            current_company=data.current_company,
            current_location=data.current_location,
            total_exp=data.total_exp,
            relevant_exp=data.relevant_exp,
            current_ctc=data.current_ctc,
            notice_period=data.notice_period,
            account_id=data.account_id,
            region=data.region,
            recvd_date=data.recvd_date,
            is_referral=data.is_referral,
            referrer_name=data.referrer_name,
            is_rehire=data.is_rehire,
            prescreen_id=data.prescreen_id,
            created_by=created_by,
        )
        self._session.add(candidate)
        await self._session.flush()  # get the id

        # Skill assignment
        if data.technology_id or data.tower_id or data.practice_id:
            skill = CandidateSkill(
                candidate_id=candidate.id,
                technology_id=data.technology_id,
                tower_id=data.tower_id,
                practice_id=data.practice_id,
                created_by=created_by,
            )
            self._session.add(skill)

        await self._session.commit()
        await self._session.refresh(candidate)
        return candidate

    # ------------------------------------------------------------------
    # Read
    # ------------------------------------------------------------------

    async def get_by_id(self, candidate_id: int) -> CandidateDetail | None:
        result = await self._session.execute(
            select(CandidateDetail).where(CandidateDetail.id == candidate_id)
        )
        return result.scalar_one_or_none()

    async def search_candidates(
        self, filters: CandidateSearchRequest
    ) -> tuple[list[CandidateDetail], int]:
        """Return (page_results, total_count).

        Applies up to 5 filters: skill (technology), status, tower, source, date range.
        """
        from sqlalchemy import func  # noqa: PLC0415

        base_stmt = select(CandidateDetail).where(CandidateDetail.active_flag == True)  # noqa: E712

        conditions = []

        if filters.skill:
            conditions.append(
                CandidateDetail.id.in_(
                    select(CandidateSkill.candidate_id).where(
                        CandidateSkill.technology_id == filters.skill
                    )
                )
            )

        if filters.status:
            conditions.append(
                CandidateDetail.id.in_(
                    select(CandidateStatus.candidate_id).where(
                        and_(
                            CandidateStatus.status_id == filters.status,
                            CandidateStatus.status_end_date.is_(None),
                        )
                    )
                )
            )

        if filters.tower:
            conditions.append(
                CandidateDetail.id.in_(
                    select(CandidateSkill.candidate_id).where(
                        CandidateSkill.tower_id == filters.tower
                    )
                )
            )

        if filters.from_date:
            conditions.append(CandidateDetail.recvd_date >= filters.from_date)

        if filters.to_date:
            conditions.append(CandidateDetail.recvd_date <= filters.to_date)

        if conditions:
            base_stmt = base_stmt.where(and_(*conditions))

        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        count_result = await self._session.execute(count_stmt)
        total: int = count_result.scalar_one()

        page_stmt = (
            base_stmt.offset(filters.page * filters.size).limit(filters.size)
        )
        rows = await self._session.execute(page_stmt)
        return list(rows.scalars().all()), total

    async def get_status_history(self, candidate_id: int) -> list[CandidateStatus]:
        result = await self._session.execute(
            select(CandidateStatus)
            .where(CandidateStatus.candidate_id == candidate_id)
            .order_by(CandidateStatus.status_start_date.desc())
        )
        return list(result.scalars().all())

    async def get_comments(self, candidate_id: int) -> list[CandidateComments]:
        result = await self._session.execute(
            select(CandidateComments)
            .where(CandidateComments.candidate_id == candidate_id)
            .order_by(CandidateComments.created_date.desc())
        )
        return list(result.scalars().all())

    # ------------------------------------------------------------------
    # Status transitions
    # ------------------------------------------------------------------

    async def close_open_status(self, candidate_id: int) -> None:
        """Set status_end_date = now() for all open status records."""
        now = datetime.now(tz=timezone.utc).replace(tzinfo=None)
        await self._session.execute(
            update(CandidateStatus)
            .where(
                and_(
                    CandidateStatus.candidate_id == candidate_id,
                    CandidateStatus.status_end_date.is_(None),
                )
            )
            .values(status_end_date=now)
        )

    async def insert_status(
        self, req: StatusChangeRequest, changed_by: str | None = None
    ) -> CandidateStatus:
        now = datetime.now(tz=timezone.utc).replace(tzinfo=None)
        status = CandidateStatus(
            candidate_id=req.candidate_id,
            status_id=req.status_id,
            status_start_date=now,
            changed_by=changed_by or req.changed_by,
            created_by=changed_by or req.changed_by,
        )
        self._session.add(status)
        await self._session.flush()
        return status

    # ------------------------------------------------------------------
    # Comments
    # ------------------------------------------------------------------

    async def add_comment(
        self,
        req: CommentRequest,
        attachment_s3_key: str | None = None,
        created_by: str | None = None,
    ) -> CandidateComments:
        comment = CandidateComments(
            candidate_id=req.candidate_id,
            comment_text=req.comment_text,
            attachment_s3_key=attachment_s3_key,
            attachment_file_name=req.attachment_file_name,
            created_by=created_by,
        )
        self._session.add(comment)
        await self._session.flush()
        return comment
