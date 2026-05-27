"""reportlab PDF builder for feedback reports."""

from __future__ import annotations

import io
import logging
from typing import Any

logger = logging.getLogger(__name__)

_REPORTLAB_AVAILABLE = False
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import cm
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    _REPORTLAB_AVAILABLE = True
except ImportError:  # pragma: no cover
    logger.warning("reportlab not installed — PDF generation unavailable")


class PdfGenerator:
    """Generates structured A4 PDFs using reportlab."""

    def create_pdf(
        self,
        title: str,
        sections: list[dict[str, Any]],
    ) -> bytes:
        """Build a PDF document.

        Args:
            title: Document title rendered at the top.
            sections: List of section dicts with keys:
                - "heading": str — section heading
                - "rows": list[tuple[str, str]] — (label, value) pairs

        Returns:
            Raw PDF bytes.
        """
        if not _REPORTLAB_AVAILABLE:
            raise RuntimeError("reportlab is not installed")

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=2 * cm,
            rightMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )
        styles = getSampleStyleSheet()
        story: list[Any] = []

        # Title
        story.append(Paragraph(title, styles["Title"]))
        story.append(Spacer(1, 0.5 * cm))

        for section in sections:
            if heading := section.get("heading"):
                story.append(Paragraph(str(heading), styles["Heading2"]))
                story.append(Spacer(1, 0.2 * cm))

            if table_rows := section.get("rows"):
                data = [[str(label), str(value)] for label, value in table_rows]
                tbl = Table(data, colWidths=[6 * cm, 11 * cm])
                tbl.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (0, -1), (0.85, 0.85, 0.85)),
                            ("GRID", (0, 0), (-1, -1), 0.5, (0.7, 0.7, 0.7)),
                            ("VALIGN", (0, 0), (-1, -1), "TOP"),
                            ("WORDWRAP", (1, 0), (1, -1), True),
                            ("FONTSIZE", (0, 0), (-1, -1), 9),
                        ]
                    )
                )
                story.append(tbl)
                story.append(Spacer(1, 0.4 * cm))

        doc.build(story)
        return buffer.getvalue()


# Module-level singleton
pdf_generator = PdfGenerator()
