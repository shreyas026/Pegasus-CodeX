# FastAPI Backend

Minimal FastAPI backend for the Domestic Violence Case Analysis System.

## Structure

- `main.py` - FastAPI app entry point
- `models.py` - Pydantic request/response models
- `routes/case_routes.py` - API routes
- `logic/analysis.py` - simple placeholder analysis logic
- `storage.py` - in-memory case storage

## Run

```bash
cd fastapi_backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Endpoints

- `POST /case/create`
- `POST /case/analyze`
- `GET /case/{id}`

## Notes

- Data is stored in memory only and resets when the server restarts.
- Analysis is rule-based and explainable.
- `/case/analyze` returns `abusePatterns`, `severity`, `riskScore`, and `explanation`.
