from models import LegalReferenceSuggestion


def build_legal_reference_suggestions(
    abuse_patterns: list[str],
    trigger_flags: list[str],
) -> list[LegalReferenceSuggestion]:
    suggestions: list[LegalReferenceSuggestion] = [
        LegalReferenceSuggestion(
            title="Protection of Women from Domestic Violence Act, 2005",
            source="India Code reference aid",
            note=(
                "Use as a civil protection framework reference for protection orders, "
                "residence concerns, and economic abuse context."
            ),
            rationale=(
                "Domestic abuse screening is present, so the case may benefit from a "
                "domestic violence protection law review."
            ),
        )
    ]

    if "physical" in abuse_patterns:
        suggestions.append(
            LegalReferenceSuggestion(
                title="Hurt or assault-related offense review",
                source="IPC/BNS topic reference",
                note="Relevant when physical harm, injury, or force is described.",
                rationale="Physical abuse indicators were detected in the submitted narrative.",
            )
        )

    if "verbal" in abuse_patterns or "Threat to life" in trigger_flags:
        suggestions.append(
            LegalReferenceSuggestion(
                title="Criminal intimidation review",
                source="IPC/BNS topic reference",
                note="Relevant when threats, intimidation, or fear-inducing communication is reported.",
                rationale="Threat-related language or intimidation signals were detected.",
            )
        )

    if "stalking" in abuse_patterns or "Stalking behavior" in trigger_flags:
        suggestions.append(
            LegalReferenceSuggestion(
                title="Stalking or surveillance-related review",
                source="IPC/BNS topic reference",
                note="Relevant when following, tracking, monitoring, or persistent surveillance is reported.",
                rationale="Stalking or repeated monitoring indicators were detected.",
            )
        )

    if "financial" in abuse_patterns:
        suggestions.append(
            LegalReferenceSuggestion(
                title="Economic abuse and financial control review",
                source="PWDVA topic reference",
                note="Useful when salary restriction, money control, or deprivation of resources is described.",
                rationale="Financial-control indicators were detected in the case narrative.",
            )
        )

    if "Coercive control" in trigger_flags:
        suggestions.append(
            LegalReferenceSuggestion(
                title="Wrongful restraint, confinement, or coercive control review",
                source="IPC/BNS topic reference",
                note="Useful when movement restriction, isolation, or confinement is described.",
                rationale="Control and isolation triggers were detected during screening.",
            )
        )

    return suggestions
