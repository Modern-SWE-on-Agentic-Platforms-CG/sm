"""openpyxl-based Excel upload parser.

Provides a base parse_workbook() function and specialised parsers for
candidate bulk uploads and slot bulk uploads.
"""

from __future__ import annotations

import io
import logging
from typing import Any

import openpyxl

logger = logging.getLogger(__name__)


def parse_workbook(
    file_bytes: bytes,
    required_headers: list[str],
    header_row: int = 1,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Parse an Excel workbook and return (valid_rows, error_rows).

    Args:
        file_bytes: Raw .xlsx file bytes.
        required_headers: Column headers that must be present.
        header_row: Row number (1-based) containing column headers.

    Returns:
        Tuple of (valid_rows, error_rows) where each row is a dict.
        error_rows include an additional "row" key with the 1-based row number
        and "errors" key listing validation messages.
    """
    try:
        wb = openpyxl.load_workbook(io.BytesIO(file_bytes), read_only=True, data_only=True)
    except Exception as exc:
        logger.error("Failed to load workbook: %s", exc)
        return [], [{"row": 0, "errors": [f"Invalid Excel file: {exc}"]}]

    ws = wb.active
    if ws is None:
        return [], [{"row": 0, "errors": ["Workbook has no active sheet"]}]

    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return [], []

    headers = [str(cell).strip() if cell is not None else "" for cell in rows[header_row - 1]]
    missing = [h for h in required_headers if h not in headers]
    if missing:
        return [], [
            {"row": 0, "errors": [f"Missing required columns: {', '.join(missing)}"]}
        ]

    col_index = {header: idx for idx, header in enumerate(headers)}
    valid_rows: list[dict[str, Any]] = []
    error_rows: list[dict[str, Any]] = []

    for row_num, row_data in enumerate(rows[header_row:], start=header_row + 1):
        row_dict = {
            header: row_data[idx] for header, idx in col_index.items() if idx < len(row_data)
        }
        errors = [
            f"'{h}' is required"
            for h in required_headers
            if row_dict.get(h) is None or str(row_dict.get(h, "")).strip() == ""
        ]
        if errors:
            error_rows.append({"row": row_num, "errors": errors, "data": row_dict})
        else:
            row_dict["_row"] = row_num
            valid_rows.append(row_dict)

    return valid_rows, error_rows
