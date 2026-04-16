from collections.abc import Mapping
from typing import Any


def _to_sentence_case(value: str) -> str:
    normalized = value.strip()
    if not normalized:
        return ""
    return normalized[0].upper() + normalized[1:]


def _format_issue_list(
    case_data: Mapping[str, Any],
    severity: str,
    risk_score: int,
    escalation_level: str,
    escalation_score: int,
    timeline_summary: str,
) -> list[str]:
    issues = [
        f"Reported abuse type: {case_data.get('abuseType', 'Not specified')}.",
        f"Incident frequency recorded as {case_data.get('frequency', 'not specified')}.",
        f"Threat level recorded as {case_data.get('threatLevel', 'not specified')}.",
        f"Overall screening result is {severity.lower()} severity with a risk score of {risk_score}/100.",
        f"Escalation screening indicates {escalation_level.lower()} escalation concern with a score of {escalation_score}/100.",
        f"Timeline review: {timeline_summary}",
    ]

    return issues


def _format_abuse_patterns(abuse_patterns: list[str]) -> list[str]:
    if abuse_patterns:
        return [pattern.capitalize() for pattern in abuse_patterns]
    return ["No specific abuse patterns were detected from the provided inputs."]


def _build_risk_assessment(
    severity: str,
    risk_score: int,
    escalation_level: str,
    escalation_score: int,
) -> str:
    return (
        f"The current screening outcome indicates {_to_sentence_case(severity.lower())} severity "
        f"with a risk score of {risk_score}/100. This summary is based on the reported frequency, "
        f"threat level, detected abuse indicators in the submitted text, and an "
        f"{escalation_level.lower()} escalation score of {escalation_score}/100."
    )


def _build_recommended_actions(severity: str) -> list[str]:
    normalized_severity = severity.lower()

    if normalized_severity == "high":
        return [
            "Prioritize immediate safety planning and urgent review by the relevant support team.",
            "Document the reported incidents and preserve any supporting records or communications.",
            "Arrange prompt referral to appropriate protection, advocacy, or safeguarding services.",
        ]

    if normalized_severity == "medium":
        return [
            "Arrange timely follow-up review of the reported incidents and current safety concerns.",
            "Document the reported behavior patterns and maintain a clear case record.",
            "Consider referral to support services for ongoing monitoring and assistance.",
        ]

    return [
        "Maintain a clear record of the reported concerns and any future incidents.",
        "Monitor for changes in frequency, escalation, or threat level over time.",
        "Consider supportive follow-up if additional indicators or disclosures emerge.",
    ]


def generate_legal_case_brief(
    case_data: Mapping[str, Any],
    abuse_patterns: list[str],
    severity: str,
    risk_score: int,
    escalation_level: str,
    escalation_score: int,
    timeline_summary: str,
) -> str:
    """
    Generate a neutral, structured case brief for display or API responses.
    """
    case_summary = (
        f"The reporting party, age {case_data.get('age', 'not specified')}, described "
        f"{case_data.get('abuseType', 'unspecified abuse')} with incidents occurring "
        f"{case_data.get('frequency', 'at an unspecified frequency')}. The submitted incident "
        f"description notes: {case_data.get('incidentDescription', 'No description provided')} "
        f"Threat level was recorded as {case_data.get('threatLevel', 'not specified')}. "
        f"Timeline context: {timeline_summary}"
    )

    key_issues = _format_issue_list(
        case_data,
        severity,
        risk_score,
        escalation_level,
        escalation_score,
        timeline_summary,
    )
    abuse_indicator_lines = _format_abuse_patterns(abuse_patterns)
    risk_assessment = _build_risk_assessment(
        severity,
        risk_score,
        escalation_level,
        escalation_score,
    )
    recommended_actions = _build_recommended_actions(severity)

    sections = [
        "1. Case Summary:",
        case_summary,
        "",
        "2. Key Issues Identified:",
        *[f"- {issue}" for issue in key_issues],
        "",
        "3. Abuse Indicators:",
        *[f"- {indicator}" for indicator in abuse_indicator_lines],
        "",
        "4. Risk Assessment:",
        risk_assessment,
        "",
        "5. Recommended Actions:",
        *[f"- {action}" for action in recommended_actions],
    ]

    return "\n".join(sections)
