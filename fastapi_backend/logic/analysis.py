import hashlib
import os
import re

from logic.brief import generate_legal_case_brief
from logic.legal_references import build_legal_reference_suggestions
from logic.ml_bridge import get_analysis_strategy, get_ml_prediction
from logic.redaction import redact_sensitive_text
from logic.timeline import summarize_timeline
from models import AnalysisResult, CaseRecord, ModelInsight, SafeActionNavigator, TimelineEvent


KEYWORD_GROUPS = {
    "physical": ["hit", "slap", "beat", "push", "hurt", "choke", "strangle"],
    "emotional": ["insult", "threaten", "humiliate", "control", "isolate"],
    "financial": ["money", "salary", "control finances", "bank", "cash"],
    "verbal": ["shout", "abuse", "curse", "yell"],
    "stalking": ["follow", "track", "watch", "monitor", "stalk"],
}

FREQUENCY_SCORES = {
    "rare": 5,
    "occasional": 10,
    "frequent": 20,
}

THREAT_LEVEL_SCORES = {
    "low": 5,
    "medium": 15,
    "high": 30,
}

ESCALATION_INDICATORS = {
    "Weapon mention": (["knife", "gun", "weapon", "acid"], 22),
    "Threat to life": (["kill", "murder", "end my life", "threaten to kill"], 25),
    "Strangulation concern": (["choke", "strangle"], 20),
    "Coercive control": (["control", "isolate", "locked", "monitor"], 12),
    "Stalking behavior": (["follow", "track", "watch", "stalk"], 15),
    "Child exposure concern": (["child", "children", "daughter", "son"], 10),
    "Escalating incidents": (["again", "repeated", "every day", "getting worse"], 10),
}

EMOTION_KEYWORDS = {
    "fear": ["afraid", "fear", "terrified", "scared", "frightened"],
    "anxiety": ["anxious", "panic", "panicked", "nervous", "worried"],
    "panic": ["panic", "can't breathe", "heart racing", "shaking"],
    "sadness": ["cry", "hopeless", "depressed", "sad"],
    "anger": ["angry", "rage", "furious", "irritated"],
}


def _normalize_text(value: str) -> str:
    return value.lower().strip()


def _count_keyword_matches(text: str, keywords: list[str]) -> int:
    return sum(1 for keyword in keywords if keyword in text)


def _has_any_keyword(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def extract_abuse_patterns(text: str) -> tuple[list[str], int]:
    patterns: list[str] = []
    keyword_score = 0

    for pattern_name, keywords in KEYWORD_GROUPS.items():
        match_count = _count_keyword_matches(text, keywords)
        if match_count > 0:
            patterns.append(pattern_name)
            keyword_score += match_count * 5

    return patterns, keyword_score


def score_frequency(frequency: str) -> int:
    return FREQUENCY_SCORES.get(_normalize_text(frequency), 0)


def score_threat_level(threat_level: str) -> int:
    return THREAT_LEVEL_SCORES.get(_normalize_text(threat_level), 0)


def determine_severity(risk_score: int) -> str:
    if risk_score <= 30:
        return "low"
    if risk_score <= 60:
        return "medium"
    return "high"


def determine_escalation_level(escalation_score: int) -> str:
    if escalation_score <= 30:
        return "low"
    if escalation_score <= 60:
        return "medium"
    return "high"


def extract_trigger_flags(text: str, abuse_patterns: list[str]) -> tuple[list[str], int]:
    trigger_flags: list[str] = []
    escalation_score = 0

    for label, (keywords, score) in ESCALATION_INDICATORS.items():
        if _has_any_keyword(text, keywords):
            trigger_flags.append(label)
            escalation_score += score

    if "physical" in abuse_patterns:
        trigger_flags.append("Physical abuse pattern detected")
        escalation_score += 10

    if len(abuse_patterns) >= 3:
        trigger_flags.append("Multiple abuse patterns detected")
        escalation_score += 10

    return list(dict.fromkeys(trigger_flags)), escalation_score


def detect_emotions(text: str) -> tuple[list[str], int, str]:
    if not text:
        return [], 0, "low"

    normalized = text.lower()
    signals: list[str] = []
    score = 0

    for emotion, keywords in EMOTION_KEYWORDS.items():
        matches = sum(1 for keyword in keywords if keyword in normalized)
        if matches:
            signals.append(emotion)
            score += min(30, matches * 8)

    exclamations = len(re.findall(r"!+", text))
    score += min(15, exclamations * 3)
    if re.search(r"\bHELP\b|\bSOS\b", text.upper()):
        score += 20

    score = max(0, min(100, score))
    if score >= 70:
        level = "high"
    elif score >= 35:
        level = "medium"
    else:
        level = "low"
    return list(dict.fromkeys(signals)), score, level


def build_offender_signature(text: str) -> str:
    if not text:
        return ""
    normalized = re.sub(r"\s+", " ", text.lower().strip())
    digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
    return digest[:12]


def detect_fake_case_flags(
    *,
    risk_score: int,
    frequency: str,
    threat_level: str,
    trigger_flags: list[str],
    abuse_patterns: list[str],
    statement: str,
    timeline_count: int,
    prior_complaints: int,
) -> tuple[list[str], int]:
    flags: list[str] = []
    if len(statement.strip()) < 40 and risk_score >= 70:
        flags.append("Short narrative for a high-risk score")
    if threat_level == "low" and any("Weapon" in flag or "Threat to life" in flag for flag in trigger_flags):
        flags.append("Threat indicators conflict with low threat level")
    if frequency == "rare" and timeline_count >= 3:
        flags.append("Rare frequency conflicts with multiple timeline events")
    if not abuse_patterns and risk_score >= 60:
        flags.append("High risk without matching abuse pattern keywords")
    if prior_complaints == 0 and timeline_count >= 3:
        flags.append("No prior complaints recorded despite multiple timeline entries")

    score = min(100, len(flags) * 18)
    return flags, score


def build_privacy_summary(anonymous_id: str) -> dict:
    return {
        "redactionApplied": True,
        "encryptionAtRest": bool(os.getenv("DV_CRYPTO_KEY")),
        "anonymousId": anonymous_id,
    }


def build_risk_alert_meta(
    severity: str,
    escalation_level: str,
    risk_score: int,
    trigger_flags: list[str],
    emergency_contacts: list[str],
    location_label: str,
) -> tuple[str, str, list[str]]:
    level = "none"
    message = ""
    targets: list[str] = []
    response_targets = ["NGO", "Police", *(emergency_contacts or ["Emergency Contact"])]

    if risk_score >= 75 or severity == "high" or escalation_level == "high":
        level = "high"
        message = "High-risk indicators detected. Activate NGO response workflow and emergency coordination."
        targets = response_targets
    elif risk_score >= 50 or escalation_level == "medium":
        level = "medium"
        message = "Moderate risk indicators detected. Escalate to NGO supervisor review."
        targets = ["NGO"]
    if any("Threat to life" in flag or "Weapon" in flag for flag in trigger_flags):
        level = "high"
        message = "Critical threat indicators detected. Immediate outreach recommended."
        targets = response_targets
    if level != "none" and location_label:
        message = f"{message} Last known intake area: {location_label}."
    return level, message, targets


def build_explanation(
    severity: str,
    frequency: str,
    patterns: list[str],
    threat_level: str,
    escalation_level: str,
    trigger_flags: list[str],
) -> str:
    pattern_summary = "abuse indicators"
    if patterns:
        pattern_summary = ", ".join(f"{pattern} abuse" for pattern in patterns)

    trigger_summary = "reported triggers"
    if trigger_flags:
        trigger_summary = ", ".join(trigger_flags[:3])

    return (
        f"{severity.capitalize()} severity due to {frequency} {pattern_summary}, "
        f"{threat_level} threat level, and {escalation_level} escalation indicators including {trigger_summary}"
    )


def build_safe_action_navigator(
    severity: str,
    escalation_level: str,
    abuse_patterns: list[str],
    trigger_flags: list[str],
) -> SafeActionNavigator:
    urgency = "Follow-up within 1 week"
    if severity == "high" or escalation_level == "high":
        urgency = "Urgent follow-up within 24 hours"
    elif severity == "medium" or escalation_level == "medium":
        urgency = "Priority follow-up within 72 hours"

    immediate_flags = trigger_flags[:]
    if not immediate_flags and severity == "high":
        immediate_flags.append("High severity case requires prompt review")

    evidence_to_collect = ["Chronology of incidents", "Any prior complaint or case reference"]
    if "physical" in abuse_patterns:
        evidence_to_collect.append("Photographs of injuries and medical documentation")
    if "financial" in abuse_patterns:
        evidence_to_collect.append("Bank, salary, or money-control records")
    if "verbal" in abuse_patterns or "emotional" in abuse_patterns:
        evidence_to_collect.append("Messages, call logs, or threatening communication records")
    if "Stalking behavior" in trigger_flags:
        evidence_to_collect.append("Location logs, CCTV, or witness notes related to stalking")

    missing_questions = [
        "Were there any prior complaints, police visits, or protection requests?",
        "Are children or dependent family members currently exposed to the abuse?",
        "Does the survivor have immediate access to a safe place and support contact?",
    ]
    if "Weapon mention" in trigger_flags:
        missing_questions.append("Is the reported weapon currently accessible to the respondent?")
    if "Strangulation concern" in trigger_flags:
        missing_questions.append("Was medical attention sought after the choking or strangulation incident?")

    referral_suggestions = ["Legal aid case review", "Trauma-informed counseling referral"]
    if severity == "high" or escalation_level == "high":
        referral_suggestions.extend(
            [
                "Emergency shelter or safety planning referral",
                "Police coordination or emergency response review",
            ]
        )
    if "physical" in abuse_patterns or "Strangulation concern" in trigger_flags:
        referral_suggestions.append("Medical examination and injury documentation support")
    if "Child exposure concern" in trigger_flags:
        referral_suggestions.append("Child protection or family safeguarding review")

    return SafeActionNavigator(
        urgency=urgency,
        immediateFlags=list(dict.fromkeys(immediate_flags)),
        evidenceToCollect=list(dict.fromkeys(evidence_to_collect)),
        missingQuestions=list(dict.fromkeys(missing_questions)),
        referralSuggestions=list(dict.fromkeys(referral_suggestions)),
    )


def analyze_case(case: CaseRecord) -> AnalysisResult:
    anonymized_incident = redact_sensitive_text(case.incidentDescription, case.victimName)
    anonymized_statement = redact_sensitive_text(case.statement, case.victimName)
    anonymized_history_summary = redact_sensitive_text(case.historySummary, case.victimName)
    anonymized_timeline = [
        TimelineEvent(
            date=event.date if isinstance(event, TimelineEvent) else str(event.get("date", "")),
            title=redact_sensitive_text(
                event.title if isinstance(event, TimelineEvent) else str(event.get("title", "")),
                case.victimName,
            ),
            details=redact_sensitive_text(
                event.details if isinstance(event, TimelineEvent) else str(event.get("details", "")),
                case.victimName,
            ),
            source=event.source if isinstance(event, TimelineEvent) else str(event.get("source", "Victim statement")),
        )
        for event in case.timelineEvents
    ]
    timeline_summary = summarize_timeline(anonymized_timeline, case.priorComplaintsCount)
    timeline_text = " ".join(
        f"{event.date} {event.title} {event.details} {event.source}" for event in anonymized_timeline
    )

    combined_text = " ".join(
        [
            _normalize_text(case.abuseType),
            _normalize_text(anonymized_incident),
            _normalize_text(anonymized_statement),
            _normalize_text(anonymized_history_summary),
            _normalize_text(timeline_text),
        ]
    )

    abuse_patterns, keyword_score = extract_abuse_patterns(combined_text)
    frequency_score = score_frequency(case.frequency)
    threat_level_score = score_threat_level(case.threatLevel)
    history_score = min(15, case.priorComplaintsCount * 5)
    chronology_score = 5 if len(anonymized_timeline) >= 2 else 0
    risk_score = min(100, keyword_score + frequency_score + threat_level_score + history_score)
    severity = determine_severity(risk_score)

    trigger_flags, trigger_score = extract_trigger_flags(combined_text, abuse_patterns)
    if case.priorComplaintsCount > 0:
        trigger_flags.append("Prior complaints history")
    if len(anonymized_timeline) >= 2:
        trigger_flags.append("Repeated chronology entries")

    trigger_flags = list(dict.fromkeys(trigger_flags))
    escalation_score = min(
        100,
        trigger_score + frequency_score + threat_level_score + history_score + chronology_score,
    )
    escalation_level = determine_escalation_level(escalation_score)
    emotion_signals, stress_score, stress_level = detect_emotions(
        " ".join([anonymized_statement, anonymized_incident, anonymized_history_summary])
    )
    offender_signature = build_offender_signature(
        " ".join([
            case.abuseType,
            case.frequency,
            case.threatLevel,
            anonymized_incident,
            anonymized_statement,
            anonymized_history_summary,
            timeline_text,
        ])
    )
    fake_case_flags, fake_case_score = detect_fake_case_flags(
        risk_score=risk_score,
        frequency=_normalize_text(case.frequency),
        threat_level=_normalize_text(case.threatLevel),
        trigger_flags=trigger_flags,
        abuse_patterns=abuse_patterns,
        statement=anonymized_statement,
        timeline_count=len(anonymized_timeline),
        prior_complaints=case.priorComplaintsCount,
    )
    risk_alert_level, risk_alert_message, risk_alert_targets = build_risk_alert_meta(
        severity=severity,
        escalation_level=escalation_level,
        risk_score=risk_score,
        trigger_flags=trigger_flags,
        emergency_contacts=case.emergencyContacts,
        location_label=case.locationLabel,
    )

    analysis_strategy = get_analysis_strategy()
    require_model = analysis_strategy == "ai-only"
    ml_prediction = None
    if analysis_strategy != "rules-only":
        ml_prediction = get_ml_prediction(
        {
            "age": case.age,
            "abuseType": case.abuseType,
            "frequency": case.frequency,
            "threatLevel": case.threatLevel,
            "incidentDescription": anonymized_incident,
            "statement": anonymized_statement,
            "historySummary": anonymized_history_summary,
            "priorComplaintsCount": case.priorComplaintsCount,
            "timelineEvents": [event.model_dump() for event in anonymized_timeline],
        },
        require_model=require_model,
    )

    analysis_mode = "rule-based"
    model_insight = None
    if ml_prediction:
        analysis_mode = "ai-ml" if analysis_strategy == "ai-only" else "hybrid-ml"
        severity = str(ml_prediction.get("severity", severity))
        escalation_level = str(ml_prediction.get("escalationLevel", escalation_level))
        risk_score = int(ml_prediction.get("riskScore", risk_score))
        escalation_score = int(ml_prediction.get("escalationScore", escalation_score))
        ml_patterns = [
            str(pattern).strip().lower()
            for pattern in ml_prediction.get("abusePatterns", [])
            if str(pattern).strip()
        ]
        abuse_patterns = ml_patterns or abuse_patterns
        model_insight = ModelInsight(
            source="baseline-ml-workspace",
            severity=str(ml_prediction.get("severity", severity)),
            riskScore=int(ml_prediction.get("riskScore", risk_score)),
            escalationLevel=str(ml_prediction.get("escalationLevel", escalation_level)),
            escalationScore=int(ml_prediction.get("escalationScore", escalation_score)),
            abusePatterns=ml_patterns,
        )
    elif analysis_strategy == "ai-only":
        raise RuntimeError(
            "AI-only analysis is enabled, but no trained model is available. Train the model before running case analysis."
        )

    explanation = build_explanation(
        severity=severity,
        frequency=_normalize_text(case.frequency),
        patterns=abuse_patterns,
        threat_level=_normalize_text(case.threatLevel),
        escalation_level=escalation_level,
        trigger_flags=trigger_flags,
    )

    safe_action_navigator = build_safe_action_navigator(
        severity=severity,
        escalation_level=escalation_level,
        abuse_patterns=abuse_patterns,
        trigger_flags=trigger_flags,
    )
    legal_reference_suggestions = build_legal_reference_suggestions(
        abuse_patterns=abuse_patterns,
        trigger_flags=trigger_flags,
    )

    generated_brief = generate_legal_case_brief(
        case_data={
            "age": case.age,
            "abuseType": case.abuseType,
            "frequency": case.frequency,
            "threatLevel": case.threatLevel,
            "incidentDescription": anonymized_incident,
        },
        abuse_patterns=abuse_patterns,
        severity=severity,
        risk_score=risk_score,
        escalation_level=escalation_level,
        escalation_score=escalation_score,
        timeline_summary=timeline_summary,
    )

    return AnalysisResult(
        analysisMode=analysis_mode,
        severity=severity,
        riskScore=risk_score,
        escalationScore=escalation_score,
        escalationLevel=escalation_level,
        abusePatterns=abuse_patterns,
        triggerFlags=trigger_flags,
        explanation=explanation,
        emotionSignals=emotion_signals,
        stressScore=stress_score,
        stressLevel=stress_level,
        fakeCaseFlags=fake_case_flags,
        fakeCaseScore=fake_case_score,
        repeatOffenderSignature=offender_signature,
        repeatOffenderCount=0,
        repeatOffenderCaseIds=[],
        riskAlertLevel=risk_alert_level,
        riskAlertMessage=risk_alert_message,
        riskAlertTargets=risk_alert_targets,
        privacySummary=build_privacy_summary(case.anonymousId),
        locationSummary=case.locationLabel or "Location not provided",
        anonymizedStatement=anonymized_statement,
        anonymizedTimeline=anonymized_timeline,
        timelineSummary=timeline_summary,
        legalReferenceSuggestions=legal_reference_suggestions,
        modelInsight=model_insight,
        safeActionNavigator=safe_action_navigator,
        generatedBrief=generated_brief,
    )
