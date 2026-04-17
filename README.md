# Domestic Violence Case Pattern Analyzer

A privacy-first AI copilot for legal-aid teams that turns anonymized domestic violence case narratives into explainable risk scores, abuse-pattern insights, and hearing-ready case briefs—so advocates can prioritize the most urgent survivors faster.

## Problem

Legal-aid NGOs face heavy workloads, unstructured narratives, and delayed preparation. Reviewing an intake form, extracting legally actionable abuse signals, linking them to specific laws (such as IPC/BNS), estimating severity, and generating a structured summary for court can take hours per case. This system accelerates that workflow without replacing human judgment.

## Objectives

- **Severity Score:** Accurately classify instances into `low`, `moderate`, `high`, or `critical` risk categories.
- **Escalation Prediction:** Forecast the likelihood of short-term behavior escalation using timeline events and statement triggers.
- **Abuse Pattern Classification:** Multi-label tagging to identify physical, financial, emotional, stalking, and coercive control.
- **Advocate-Ready Brief:** Convert chaotic narratives into a chronologically sorted, legally mapped case summary.

## Users

- **Legal aid advocates:** For generating briefs before hearings.
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
- Structured, exportable advocate-ready case brief.
- **Safe Action Navigator Recommendations.**

## Features

- **Secure Intake Parser:** Collects structured data, location context, emergency contacts, and timelines through a responsive frontend.
- **AI-Backed Risk Engine:** Predicts severity, escalation, and abuse-pattern labels using trained baseline ML models, with explainable rule signals blended in as a safety layer.
- **Voice + Document AI:** Uses speech-to-text for audio complaints and OCR for scanned PDFs/images.
- **Safe Action Navigator:** A trauma-informed next-step recommender providing immediate danger flags, missing evidence checklists, and agency referral suggestions.
- **Alerting + Operations:** Real-time risk alerts, panic escalation, repeat-offender linking, heatmap support, and an advocate-facing queue.
- **AI Case Brief Generator:** Outputs structured reports ready for PDF export and legal review.
- **Immersive Glass UI:** Full-screen glassmorphism interface with animated background layers and cursor-reactive motion.

## Tech Stack

| Layer | Recommended Stack | Why |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind v4 | Fast, modern React ecosystem, clean DX. |
| Backend/API | FastAPI | Fast prototyping for ML/NLP inference and document generation. |
| Database | Supabase (PostgreSQL) | Reliable structured storage, authentication, and RLS. |
| UI Touches | Lucide React + Custom CSS Animations | Delivering "vibe coder" visual excellence. |

## ML Pipeline

- **Preprocessing:** PII redaction happens before downstream analysis output is shown to the operator.
- **Feature Engineering:** Combined text features from intake, statement, history, and timeline plus structured fields such as age and prior complaints.
- **Models:** Trained baseline classifiers using TF-IDF text features with Logistic Regression for severity/escalation and One-vs-Rest Logistic Regression for abuse-pattern tagging.
- **Hybrid Inference:** The backend blends ML predictions with explainable rules so the product remains usable even when the model is uncertain.
- **Explainability:** Scores still expose trigger flags and pattern cues so legal teams can understand why a case was prioritized.

## Safety and Ethics (Privacy by Design)

- **Human-in-the-loop review:** The AI is an assistant, not a robotic adjudicator. It outputs *assistance for advocates* preparing faster, not autonomous legal truth.
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
6. Optional retraining: `python ml_workspace/src/train_baselines.py --data ml_workspace/data/sample_cases.csv --artifacts ml_workspace/artifacts`

## Deployment

### Frontend (Vercel)

1. Import this repo in Vercel.
2. Set environment variable:
	- `NEXT_PUBLIC_API_BASE_URL=https://<your-render-service>.onrender.com`
3. Deploy.

### Backend (Render)

This repo includes [render.yaml](render.yaml). You can deploy from Blueprint or create a Web Service manually.

- Runtime: Python
- Root directory: `fastapi_backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`

Required environment variables on Render:

- `DV_CORS_ORIGINS=https://<your-vercel-domain>`
- `DV_ANALYSIS_STRATEGY=hybrid`

Optional:

- `DV_CRYPTO_KEY=<fernet-key>` for encrypted text at rest.

### Current AI Status

- The shipped prototype includes trained baseline ML artifacts in `ml_workspace/artifacts/`.
- Live analysis will report `hybrid-ml` when those artifacts are available.
- Audio complaints use speech-to-text and scanned documents use OCR, so the intake pipeline is also AI-assisted beyond the classifier itself.
