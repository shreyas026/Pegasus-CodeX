import re


PHONE_PATTERN = re.compile(r"(\+?\d[\d\-\s]{8,}\d)")
EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
ID_PATTERN = re.compile(r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b")
ADDRESS_PATTERN = re.compile(
    r"\b\d{1,5}\s+[A-Za-z0-9\s,.-]*(street|st|road|rd|lane|ln|avenue|ave|nagar|colony)\b",
    re.IGNORECASE,
)


def redact_sensitive_text(text: str, victim_name: str = "") -> str:
    redacted_text = text

    if victim_name.strip():
        redacted_text = re.sub(
            re.escape(victim_name.strip()),
            "[REDACTED_NAME]",
            redacted_text,
            flags=re.IGNORECASE,
        )

    redacted_text = PHONE_PATTERN.sub("[REDACTED_PHONE]", redacted_text)
    redacted_text = EMAIL_PATTERN.sub("[REDACTED_EMAIL]", redacted_text)
    redacted_text = ID_PATTERN.sub("[REDACTED_ID]", redacted_text)
    redacted_text = ADDRESS_PATTERN.sub("[REDACTED_ADDRESS]", redacted_text)

    return redacted_text
