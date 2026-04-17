# FastAPI Backend

Minimal FastAPI backend for the Domestic Violence Case Analysis System.

## Structure

- `main.py` - FastAPI app entry point
- `models.py` - Pydantic request/response models
- `routes/case_routes.py` - API routes
- `logic/analysis.py` - simple placeholder analysis logic
- `storage.py` - SQLite-backed case and document persistence
- `logic/document_ingestion.py` - PDF/image text extraction with OCR fallback

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
- `GET /case/{id}`

## Notes

- Data is stored in a local SQLite database under `fastapi_backend/data/`.
- Analysis is rule-based and explainable.
- `/case/analyze` returns `abusePatterns`, `severity`, `riskScore`, and `explanation`.
- `/case/{id}/documents` stores uploaded PDFs/images against a case, extracts text directly when possible, and falls back to OCR for scanned inputs.
