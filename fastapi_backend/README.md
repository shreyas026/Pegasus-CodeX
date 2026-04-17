# FastAPI Backend

FastAPI backend for the Domestic Violence Case Analysis System with hybrid ML inference, OCR, speech-to-text, alerts, and SQLite persistence.

## Structure

- `main.py` - FastAPI app entry point
- `models.py` - Pydantic request/response models
- `routes/case_routes.py` - case creation, ingestion, analysis, queue, and heatmap APIs
- `logic/analysis.py` - hybrid explainable + ML analysis logic
- `storage.py` - SQLite-backed case and document persistence
- `logic/document_ingestion.py` - PDF/image OCR and audio speech-to-text ingestion
- `routes/alert_routes.py` - alert and panic endpoints
- `routes/support_routes.py` - victim-support chatbot endpoint
- `logic/ml_bridge.py` - runtime loading of trained model artifacts from `ml_workspace/artifacts`

## Run

```bash
cd fastapi_backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Endpoints

- `POST /case/{id}/documents`
- `POST /case/create`
- `POST /case/analyze`
- `GET /case`
- `GET /case/heatmap`
- `GET /case/{id}`
- `GET /alerts`
- `POST /alerts/panic`
- `POST /support/chat`

## Notes

- Data is stored in a local SQLite database under `fastapi_backend/data/`.
- `/case/analyze` uses trained baseline ML models when artifacts are present, otherwise it falls back safely to explainable rule logic.
- `/case/analyze` returns severity, escalation, abuse patterns, emotion/stress, fake-case signals, alert metadata, privacy metadata, and a generated brief.
- `/case/{id}/documents` stores uploaded PDFs/images/audio against a case, extracts text directly when possible, falls back to OCR for scanned inputs, and uses speech-to-text for audio files.
- The backend requirements include the runtime dependencies needed to load the trained scikit-learn artifacts.
