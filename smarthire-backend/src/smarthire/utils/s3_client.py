"""AWS S3 client wrapper using a thread-pool executor for async compatibility."""

import asyncio
import logging
from functools import partial

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, status

from smarthire.config import get_settings

logger = logging.getLogger(__name__)

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB


class S3Client:
    """Thin wrapper around boto3 S3 that exposes async-friendly methods."""

    def __init__(self) -> None:
        settings = get_settings()
        self._client = boto3.client(
            "s3",
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id or None,
            aws_secret_access_key=settings.aws_secret_access_key or None,
        )
        self._loop: asyncio.AbstractEventLoop | None = None

    def _get_loop(self) -> asyncio.AbstractEventLoop:
        try:
            return asyncio.get_running_loop()
        except RuntimeError:
            return asyncio.new_event_loop()

    async def upload_file(
        self,
        bucket: str,
        key: str,
        data: bytes,
        content_type: str = "application/octet-stream",
        max_bytes: int = MAX_UPLOAD_BYTES,
    ) -> None:
        """Upload bytes to S3.

        Raises:
            HTTPException(413): If data exceeds max_bytes.
            HTTPException(502): On S3 error.
        """
        if len(data) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds the {max_bytes // (1024 * 1024)} MB limit",
            )
        loop = self._get_loop()
        fn = partial(
            self._client.put_object,
            Bucket=bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
        try:
            await loop.run_in_executor(None, fn)
        except (BotoCoreError, ClientError) as exc:
            logger.error("S3 upload failed for key=%s: %s", key, exc)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="File upload failed",
            ) from exc

    async def download_file(self, bucket: str, key: str) -> bytes:
        """Download a file from S3 and return its bytes."""
        loop = self._get_loop()
        fn = partial(self._client.get_object, Bucket=bucket, Key=key)
        try:
            response = await loop.run_in_executor(None, fn)
            body: bytes = response["Body"].read()
            return body
        except (BotoCoreError, ClientError) as exc:
            logger.error("S3 download failed for key=%s: %s", key, exc)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found",
            ) from exc

    async def generate_presigned_url(
        self, bucket: str, key: str, expiry_seconds: int = 3600
    ) -> str:
        """Generate a pre-signed GET URL for an S3 object."""
        loop = self._get_loop()
        fn = partial(
            self._client.generate_presigned_url,
            "get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=expiry_seconds,
        )
        try:
            url: str = await loop.run_in_executor(None, fn)
            return url
        except (BotoCoreError, ClientError) as exc:
            logger.error("Pre-signed URL generation failed for key=%s: %s", key, exc)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Could not generate download URL",
            ) from exc


# Module-level singleton
s3_client = S3Client()
