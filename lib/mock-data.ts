import type { AnalysisResult, IntakeFormData } from "@/lib/types";

export const mockIntakeData: IntakeFormData = {
  victimName: "Aarohi Sharma",
  age: 31,
  abuseType: "Psychological and verbal abuse",
  incidentDescription:
    "Respondent has repeatedly isolated the victim from family and used intimidation during disputes.",
  frequency: "frequent",
  threatLevel: "medium",
  statement: "",
  historySummary:
    "Two earlier disputes were documented by the case worker, with one informal family intervention noted.",
  priorComplaintsCount: 2,
  timelineEvents: [
    {
      date: "2026-01-15",
      title: "Family intervention",
      details: "Family members attempted an informal intervention after repeated intimidation.",
      source: "Case worker note"
    },
    {
      date: "2026-03-04",
      title: "Escalated verbal threats",
      details: "The respondent shouted, threatened, and restricted access to money during an argument.",
      source: "Victim statement"
    }
  ]
};

export const mockAnalysisResult: AnalysisResult = {
  analysisMode: "hybrid-ml",
  severity: "high",
  riskScore: 78,
  escalationScore: 84,
  escalationLevel: "high",
  abusePatterns: ["emotional", "financial", "verbal"],
  triggerFlags: [
    "Coercive control",
    "Escalating incidents",
    "Multiple abuse patterns detected"
  ],
  explanation:
    "High severity due to frequent emotional abuse, financial abuse, verbal abuse, medium threat level, and high escalation indicators including Coercive control, Escalating incidents, Multiple abuse patterns detected",
  anonymizedStatement:
    "The respondent repeatedly isolated [REDACTED_NAME] from family and threatened financial control if help was sought.",
  anonymizedTimeline: [
    {
      date: "2026-01-15",
      title: "Family intervention",
      details: "Family members attempted an informal intervention after repeated intimidation.",
      source: "Case worker note"
    },
    {
      date: "2026-03-04",
      title: "Escalated verbal threats",
      details: "The respondent shouted, threatened, and restricted access to money during an argument.",
      source: "Victim statement"
    }
  ],
  timelineSummary:
    "2 timeline event(s) were recorded from 2026-01-15 to 2026-03-04, with 2 prior complaint(s) noted.",
  legalReferenceSuggestions: [
    {
      title: "Protection of Women from Domestic Violence Act, 2005",
      source: "India Code reference aid",
      note:
        "Use as a civil protection framework reference for protection orders, residence concerns, and economic abuse context.",
      rationale:
        "Domestic abuse screening is present, so the case may benefit from a domestic violence protection law review."
    },
    {
      title: "Criminal intimidation review",
      source: "IPC/BNS topic reference",
      note:
        "Relevant when threats, intimidation, or fear-inducing communication is reported.",
      rationale: "Threat-related language or intimidation signals were detected."
    },
    {
      title: "Economic abuse and financial control review",
      source: "PWDVA topic reference",
      note:
        "Useful when salary restriction, money control, or deprivation of resources is described.",
      rationale: "Financial-control indicators were detected in the case narrative."
    }
  ],
  modelInsight: {
    source: "baseline-ml-workspace",
    severity: "high",
    riskScore: 81,
    escalationLevel: "high",
    escalationScore: 86,
    abusePatterns: ["emotional", "financial", "verbal"]
  },
  safeActionNavigator: {
    urgency: "Urgent follow-up within 24 hours",
    immediateFlags: [
      "Coercive control",
      "Escalating incidents",
      "Multiple abuse patterns detected"
    ],
    evidenceToCollect: [
      "Chronology of incidents",
      "Any prior complaint or case reference",
      "Bank, salary, or money-control records",
      "Messages, call logs, or threatening communication records"
    ],
    missingQuestions: [
      "Were there any prior complaints, police visits, or protection requests?",
      "Are children or dependent family members currently exposed to the abuse?",
      "Does the survivor have immediate access to a safe place and support contact?"
    ],
    referralSuggestions: [
      "Legal aid case review",
      "Trauma-informed counseling referral",
      "Emergency shelter or safety planning referral",
      "Police coordination or emergency response review"
    ]
  },
  generatedBrief:
    "1. Case Summary:\nThe reporting party, age 31, described psychological and verbal abuse with incidents occurring frequent. The submitted incident description notes: Respondent has repeatedly isolated the victim from family and used intimidation during disputes. Threat level was recorded as medium. Timeline context: 2 timeline event(s) were recorded from 2026-01-15 to 2026-03-04, with 2 prior complaint(s) noted.\n\n2. Key Issues Identified:\n- Reported abuse type: Psychological and verbal abuse.\n- Incident frequency recorded as frequent.\n- Threat level recorded as medium.\n- Overall screening result is high severity with a risk score of 78/100.\n- Escalation screening indicates high escalation concern with a score of 84/100.\n- Timeline review: 2 timeline event(s) were recorded from 2026-01-15 to 2026-03-04, with 2 prior complaint(s) noted.\n\n3. Abuse Indicators:\n- Emotional\n- Financial\n- Verbal\n\n4. Risk Assessment:\nThe current screening outcome indicates High severity with a risk score of 78/100. This summary is based on the reported frequency, threat level, detected abuse indicators in the submitted text, and an high escalation score of 84/100.\n\n5. Recommended Actions:\n- Prioritize immediate safety planning and urgent review by the relevant support team.\n- Document the reported incidents and preserve any supporting records or communications.\n- Arrange prompt referral to appropriate protection, advocacy, or safeguarding services."
};
