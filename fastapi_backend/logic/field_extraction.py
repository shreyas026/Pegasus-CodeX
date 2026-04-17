from __future__ import annotations

import re

from models import ExtractedFieldSuggestions, TimelineEvent


DATE_PATTERNS = [
    re.compile(r"\b\d{4}-\d{2}-\d{2}\b"),
    re.compile(r"\b\d{2}[/-]\d{2}[/-]\d{4}\b"),
]

NAME_PATTERNS = [
    re.compile(r"(?:victim|complainant|survivor|name)\s*[:\-]\s*([A-Za-z][A-Za-z .'-]{2,60})", re.IGNORECASE),
]

AGE_PATTERN = re.compile(r"(?:age|aged)\s*[:\-]?\s*(\d{1,3})", re.IGNORECASE)

FREQUENCY_KEYWORDS = {
    "frequent": ["frequent", "frequently", "repeated", "repeatedly", "often", "every day", "daily"],
    "occasional": ["occasionally", "sometimes", "from time to time"],
    "rare": ["rare", "rarely", "once"],
}

THREAT_KEYWORDS = {
    "high": ["kill", "weapon", "gun", "knife", "strangle", "life in danger", "won't survive"],
    "medium": ["threat", "fear", "intimidat", "unsafe", "harm"],
    "low": ["argument", "verbal issue", "isolated concern"],
}

ABUSE_KEYWORDS = {
    "Physical abuse": ["hit", "slap", "beat", "push", "hurt", "injur", "choke", "strangle"],
    "Psychological and verbal abuse": ["insult", "threat", "control", "humiliat", "shout", "yell", "curse", "isolate"],
    "Financial abuse": ["money", "salary", "bank", "finance", "cash", "expenses", "account"],
    "Verbal abuse": ["shout", "abuse", "curse", "yell"],
    "Mixed abuse": ["physical", "financial", "verbal", "emotional"],
}

HISTORY_HINTS = [
    "prior complaint",
    "previous complaint",
    "history",
    "earlier",
    "previously",
    "police",
    "family intervention",
    "case worker",
]


def _normalize_whitespace(value: str) -> str:
    return " ".join(value.split()).strip()


def _first_sentence_block(text: str, limit: int = 320) -> str | None:
    cleaned = _normalize_whitespace(text)
    if not cleaned:
        return None
    return cleaned[:limit].rstrip()


def _extract_name(text: str) -> str | None:
    for pattern in NAME_PATTERNS:
        match = pattern.search(text)
        if match:
            return _normalize_whitespace(match.group(1))
    return None


def _extract_age(text: str) -> int | None:
    match = AGE_PATTERN.search(text)
    if not match:
        return None

    age = int(match.group(1))
    return age if 0 <= age <= 120 else None


def _extract_frequency(text: str) -> str | None:
    lowered = text.lower()
    explicit_match = re.search(r"frequency\s*[:\-]?\s*(rare|occasional|frequent)", lowered)
    if explicit_match:
        return explicit_match.group(1)

    for label, keywords in FREQUENCY_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            return label
    return None


def _extract_threat_level(text: str) -> str | None:
    lowered = text.lower()
    explicit_match = re.search(r"threat level\s*[:\-]?\s*(low|medium|high)", lowered)
    if explicit_match:
        return explicit_match.group(1)

    for label, keywords in THREAT_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            return label
    return None


def _extract_abuse_type(text: str) -> str | None:
    lowered = text.lower()
    explicit_match = re.search(
        r"(?:abuse type|type of abuse)\s*[:\-]?\s*(physical abuse|psychological and verbal abuse|financial abuse|verbal abuse|mixed abuse)",
        lowered,
    )
    if explicit_match:
        return explicit_match.group(1).capitalize() if explicit_match.group(1) == "mixed abuse" else explicit_match.group(1).title()

    matches = []
    for label, keywords in ABUSE_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            matches.append(label)

    if not matches:
        return None
    if len(matches) > 1:
        return "Mixed abuse"
    return matches[0]


def _extract_history_summary(text: str) -> str | None:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    matched_lines = [line for line in lines if any(hint in line.lower() for hint in HISTORY_HINTS)]
    if not matched_lines:
        return None
    return _normalize_whitespace(" ".join(matched_lines[:3]))[:320].rstrip()


def _extract_timeline_events(text: str) -> list[TimelineEvent]:
    events: list[TimelineEvent] = []
    seen: set[tuple[str, str]] = set()

    for line in [line.strip() for line in text.splitlines() if line.strip()]:
        event_date = None
        for pattern in DATE_PATTERNS:
            match = pattern.search(line)
            if match:
                event_date = match.group(0).replace("/", "-")
                break

        if not event_date:
            continue

        remainder = line.replace(event_date, "").strip(" -:|")
        title = remainder[:72].strip() or "Recorded incident"
        details = remainder[:220].strip() or line[:220].strip()
        key = (event_date, title.lower())
        if key in seen:
            continue

        seen.add(key)
        events.append(
            TimelineEvent(
                date=event_date,
                title=title,
                details=details,
                source="Imported document",
            )
        )

        if len(events) >= 4:
            break

    return events


def extract_field_suggestions(text: str) -> ExtractedFieldSuggestions:
    cleaned_text = text.strip()
    if not cleaned_text:
        return ExtractedFieldSuggestions()

    return ExtractedFieldSuggestions(
        victimName=_extract_name(cleaned_text),
        age=_extract_age(cleaned_text),
        abuseType=_extract_abuse_type(cleaned_text),
        frequency=_extract_frequency(cleaned_text),
        threatLevel=_extract_threat_level(cleaned_text),
        incidentDescription=_first_sentence_block(cleaned_text),
        historySummary=_extract_history_summary(cleaned_text),
        timelineEvents=_extract_timeline_events(cleaned_text),
    )
