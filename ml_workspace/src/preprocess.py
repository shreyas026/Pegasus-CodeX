from __future__ import annotations

import json
from typing import Any

import pandas as pd


REQUIRED_COLUMNS = [
    "age",
    "abuseType",
    "frequency",
    "threatLevel",
    "incidentDescription",
    "statement",
    "historySummary",
    "priorComplaintsCount",
    "timelineEvents",
]


def _normalize_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip().lower()


def flatten_timeline(value: Any) -> str:
    if value is None:
        return ""

    if isinstance(value, list):
        parts: list[str] = []
        for item in value:
            if isinstance(item, dict):
                parts.append(
                    " ".join(
                        [
                            _normalize_text(item.get("date")),
                            _normalize_text(item.get("title")),
                            _normalize_text(item.get("details")),
                            _normalize_text(item.get("source")),
                        ]
                    )
                )
            else:
                parts.append(_normalize_text(item))
        return " ".join(parts).strip()

    value_text = str(value).strip()
    if not value_text:
        return ""

    try:
        parsed = json.loads(value_text)
        return flatten_timeline(parsed)
    except Exception:
        return _normalize_text(value_text)


def join_pattern_labels(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item).strip().lower() for item in value if str(item).strip()]
    return [part.strip().lower() for part in str(value).split("|") if part.strip()]


def prepare_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    prepared = df.copy()

    for column in REQUIRED_COLUMNS:
        if column not in prepared.columns:
            prepared[column] = ""

    prepared["age"] = pd.to_numeric(prepared["age"], errors="coerce").fillna(0)
    prepared["priorComplaintsCount"] = pd.to_numeric(
        prepared["priorComplaintsCount"], errors="coerce"
    ).fillna(0)
    prepared["timelineText"] = prepared["timelineEvents"].apply(flatten_timeline)

    prepared["modelText"] = prepared.apply(
        lambda row: " ".join(
            [
                _normalize_text(row.get("abuseType")),
                _normalize_text(row.get("frequency")),
                _normalize_text(row.get("threatLevel")),
                _normalize_text(row.get("incidentDescription")),
                _normalize_text(row.get("statement")),
                _normalize_text(row.get("historySummary")),
                _normalize_text(row.get("timelineText")),
            ]
        ).strip(),
        axis=1,
    )

    return prepared
