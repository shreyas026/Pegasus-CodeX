from models import CaseRecord, CaseSummary


CASE_STORE: dict[str, CaseRecord] = {}


def build_case_summary(case_record: CaseRecord) -> CaseSummary:
    analysis = case_record.analysis

    return CaseSummary(
        id=case_record.id,
        victimName=case_record.victimName,
        abuseType=case_record.abuseType,
        threatLevel=case_record.threatLevel,
        frequency=case_record.frequency,
        priorComplaintsCount=case_record.priorComplaintsCount,
        timelineEventCount=len(case_record.timelineEvents),
        status="analyzed" if analysis else "intake-complete",
        severity=analysis.severity if analysis else None,
        riskScore=analysis.riskScore if analysis else None,
        escalationLevel=analysis.escalationLevel if analysis else None,
        urgency=analysis.safeActionNavigator.urgency if analysis else "Awaiting statement analysis",
        analysisMode=analysis.analysisMode if analysis else None,
        createdAt=case_record.createdAt,
        updatedAt=case_record.updatedAt,
    )


def list_case_summaries() -> list[CaseSummary]:
    summaries = [build_case_summary(case_record) for case_record in CASE_STORE.values()]
    return sorted(summaries, key=lambda summary: summary.updatedAt, reverse=True)
