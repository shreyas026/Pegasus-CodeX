# Backend - Case Analysis System

Minimal Node.js + Express + MongoDB backend for the Domestic Violence Case Analyzer.

## Folder Structure

```text
backend/
  src/
    config/
      db.js
    controllers/
      caseController.js
    middlewares/
      errorHandler.js
    models/
      Case.js
    routes/
      caseRoutes.js
    services/
      analysisService.js
    app.js
    server.js
  .env.example
  package.json
```

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` from `.env.example` and set MongoDB URI.

3. Start server:
```bash
npm run dev
```

## API Routes

### POST `/case/create`
Creates a case and stores intake form data + optional statement.

Request body:
```json
{
  "victimName": "Aarohi Sharma",
  "age": 31,
  "abuseType": "Psychological and verbal abuse",
  "incidentDescription": "Repeated intimidation and isolation.",
  "frequency": "Weekly",
  "threatLevel": "Moderate",
  "statement": "Optional statement text"
}
```

### POST `/case/analyze`
Analyzes a saved case and returns:
- `severity` (`low` | `medium` | `high`)
- `riskScore` (`0-100`)
- `abusePatterns` (array)
- `generatedBrief` (text)

Request body:
```json
{
  "caseId": "<mongodb_case_id>",
  "statement": "Optional updated statement"
}
```

### GET `/case/:id`
Returns complete case record including analysis.

## Notes

- Analysis logic is intentionally simple and hackathon-friendly.
- Basic validation and error handling are included.