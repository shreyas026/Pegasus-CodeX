# Domestic Violence Case Pattern Analyzer

A privacy-first AI copilot for legal-aid teams that turns anonymized domestic violence case narratives into explainable risk scores, abuse-pattern insights, and hearing-ready case briefs—so lawyers can prioritize the most urgent survivors faster.

## Problem

Legal-aid NGOs face heavy workloads, unstructured narratives, and delayed preparation. Reviewing an intake form, extracting legally actionable abuse signals, linking them to specific laws (such as IPC/BNS), estimating severity, and generating a structured summary for court can take hours per case. This system accelerates that workflow without replacing human judgment.

## Objectives

- **Severity Score:** Accurately classify instances into `low`, `moderate`, `high`, or `critical` risk categories.
- **Escalation Prediction:** Forecast the likelihood of short-term behavior escalation using timeline events and statement triggers.
- **Abuse Pattern Classification:** Multi-label tagging to identify physical, financial, emotional, stalking, and coercive control.
- **Lawyer-Ready Brief:** Convert chaotic narratives into a chronologically sorted, legally mapped case summary.

## Users

- **Legal aid lawyers:** For generating briefs before hearings.
- **NGO case workers:** For standardized intake and fast prioritization.
- **Supervisors/admins:** For monitoring hot spots and system oversight through the Supabase backend.

## Inputs

1. Anonymized structured intake forms.
2. Anonymized victim narrative / free-text statements.
3. Case history timeline.
4. IPC/BNS cross-references.

## Outputs

- Context-aware severity score.
- Escalation risk prediction and trajectory explanation.
- Abuse pattern multi-label classification.
- Structured, exportable lawyer-ready case brief.
- **Safe Action Navigator Recommendations.**

## Features

- **Secure Intake Parser:** Collects structured data and timelines seamlessly with a responsive frontend.
- **Pattern & Risk Engines:** Classifies textual data into explainable signals using transparent rule engines with fallback hybrid ML models.
- **Safe Action Navigator (Innovation Feature):** A trauma-informed next-step recommender providing immediate danger flags, missing evidence checklists, and agency referral suggestions.
- **Lawyer Dashboard:** A live queue prioritizing highest-risk users.
- **AI Case Brief Generator:** Outputs structured reports ready for PDF export and legal review.
- **Vibe Coder Aesthetic:** Glassmorphism UI, a dynamic fully-animated background mesh, utilizing `shadcn/ui` components for an ultra-premium feel.

## Tech Stack

| Layer | Recommended Stack | Why |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind v4 | Fast, modern React ecosystem, clean DX. |
| Backend/API | FastAPI | Fast prototyping for ML/NLP inference and document generation. |
| Database | Supabase (PostgreSQL) | Reliable structured storage, authentication, and RLS. |
| UI Touches | Lucide React + Custom CSS Animations | Delivering "vibe coder" visual excellence. |

## ML Pipeline

- **Preprocessing:** PII redaction (names, addresses, phones) done before models see the text.
- **Feature Engineering:** Timeline frequency, weapon mentions, strangulation threats, economic control.
- **Models:** Hybrid approach. XGBoost for structured severity mapping, fallback to LLM/NLP solely for summarization and explainability (not unilateral scoring).
- **Explainability:** Each score links directly back to the `trigger chips` identified in the text.

## Safety and Ethics (Privacy by Design)

- **Human-in-the-loop review:** The AI is an assistant, not a robotic adjudicator. It outputs *assistance for lawyers* preparing faster, not autonomous legal truth.
- **PII Scrubbing:** Identity masks replace victim details.
- **False Positives/Negatives:** Graceful degradation. If the model is uncertain, it falls back to flagging for human attention.

## Evaluation

- Accuracy on severity classification.
- AUC-ROC on escalation prediction.
- High recall on pattern categorization.
- Brief completeness compared to manual drafting baselines.

## Future Scope

- Multilingual voice-to-text intake.
- Federated privacy-preserving localized training for specific districts.
- Automated court document prep matching official jurisdictions.

---

### Setup Instructions

1. `npm install`
2. Create a Supabase project and execute `database.sql` in the SQL Editor.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to an `.env.local` file.
4. Run `npm run dev` to start the dashboard frontend.
5. In another terminal, `cd fastapi_backend`, setup a venv, install Python requirements, and `uvicorn main:app`.