"""AWS SES email sender supporting plain-text, HTML, and file attachments."""

import logging
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from functools import partial

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, status

from smarthire.config import get_settings

logger = logging.getLogger(__name__)


class SESClient:
    """Thin wrapper around boto3 SES."""

    def __init__(self) -> None:
        settings = get_settings()
        self._settings = settings
        self._client = boto3.client(
            "ses",
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id or None,
            aws_secret_access_key=settings.aws_secret_access_key or None,
        )

    def send_email(
        self,
        to: list[str],
        subject: str,
        body_text: str,
        body_html: str | None = None,
        attachments: list[tuple[str, bytes]] | None = None,
    ) -> None:
        """Send an email via AWS SES.

        Args:
            to: List of recipient email addresses.
            subject: Email subject.
            body_text: Plain-text body.
            body_html: Optional HTML body.
            attachments: Optional list of (filename, bytes) tuples.
        """
        if attachments:
            msg = self._build_multipart(subject, body_text, body_html, attachments)
            raw_message = msg.as_string()
            try:
                self._client.send_raw_email(
                    Source=self._settings.ses_from_address,
                    Destinations=to,
                    RawMessage={"Data": raw_message},
                )
            except (BotoCoreError, ClientError) as exc:
                logger.error("SES send_raw_email failed: %s", exc)
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Email delivery failed",
                ) from exc
        else:
            body_part: dict = {"Text": {"Data": body_text, "Charset": "UTF-8"}}
            if body_html:
                body_part["Html"] = {"Data": body_html, "Charset": "UTF-8"}
            try:
                self._client.send_email(
                    Source=self._settings.ses_from_address,
                    Destination={"ToAddresses": to},
                    Message={
                        "Subject": {"Data": subject, "Charset": "UTF-8"},
                        "Body": body_part,
                    },
                )
            except (BotoCoreError, ClientError) as exc:
                logger.error("SES send_email failed: %s", exc)
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Email delivery failed",
                ) from exc

    def _build_multipart(
        self,
        subject: str,
        body_text: str,
        body_html: str | None,
        attachments: list[tuple[str, bytes]],
    ) -> MIMEMultipart:
        msg = MIMEMultipart("mixed")
        msg["Subject"] = subject
        msg["From"] = self._settings.ses_from_address

        alt = MIMEMultipart("alternative")
        alt.attach(MIMEText(body_text, "plain", "UTF-8"))
        if body_html:
            alt.attach(MIMEText(body_html, "html", "UTF-8"))
        msg.attach(alt)

        for filename, data in attachments:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(data)
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f'attachment; filename="{filename}"')
            msg.attach(part)

        return msg


# Module-level singleton
ses_client = SESClient()
