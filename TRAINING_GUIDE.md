# AI Training Guide

This project is now configured to run in `AI-only` mode by default for the core case-scoring layer.

That means:

- `severity`
- `escalation`
- `abuse pattern classification`

must come from a trained ML model in `ml_workspace/artifacts/`.

If those artifacts are missing, the backend will refuse to analyze cases instead of silently falling back to rule-based scoring.

## What You Need

You need labeled, anonymized domestic violence case data.

Required columns:

- `age`
- `abuseType`
- `frequency`
- `threatLevel`
- `incidentDescription`
- `statement`
- `historySummary`
- `priorComplaintsCount`
- `timelineEvents`
- `severityLabel`
- `escalationLabel`
- `abusePatternLabels`

The sample format is already available in:

- `ml_workspace/data/sample_cases.csv`

## Minimum Honest Recommendation

For a demo:

- `50-100` labeled cases is better than the tiny sample file

For a stronger hackathon / pilot:

- `500+` labeled anonymized cases

For real NGO deployment:

- `1000+` reviewed cases across districts, abuse types, and severity levels

## Step-by-Step Training

### 1. Prepare the labeled CSV

Start from the sample file format:

```powershell
Copy-Item ml_workspace\data\sample_cases.csv ml_workspace\data\ngo_cases.csv
```

Then replace the contents with your real anonymized labeled cases.

Important:

- remove names, phone numbers, and addresses
- labels should be assigned by advocates or trained NGO reviewers
- `abusePatternLabels` should use `|` separators like `physical|emotional`

### 2. Install training dependencies

```powershell
pip install -r ml_workspace\requirements.txt
```

### 3. Train the model

Option A:

```powershell
python ml_workspace\src\train_baselines.py --data ml_workspace\data\ngo_cases.csv --artifacts ml_workspace\artifacts
```

Option B:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\train_ai_model.ps1 -DataPath "ml_workspace\data\ngo_cases.csv"
```

### 4. Check that artifacts were created

You should see:

- `severity_model.joblib`
- `escalation_model.joblib`
- `pattern_model.joblib`
- `pattern_binarizer.joblib`
- `metadata.json`

### 5. Restart the backend

```powershell
cd fastapi_backend
uvicorn main:app --reload
```

### 6. Confirm AI mode is active

Analyze a case in the app.

The result should show:

- `analysisMode = ai-ml`

If the artifacts are missing, the backend now returns an error instead of using rule-based scoring.

## Keeping Every NGO Up To Date

To keep the system current:

1. Collect newly closed and reviewed anonymized cases from NGOs.
2. Add them to the master labeled dataset.
3. Retrain the model weekly or monthly.
4. Replace the artifacts in `ml_workspace/artifacts/`.
5. Restart the backend.

Recommended workflow:

- district NGOs label cases locally
- merge anonymized reviewed cases into one training dataset
- retrain centrally
- redeploy updated artifacts to all NGO instances

## Important Truth

The current model is a classical ML baseline:

- TF-IDF text features
- Logistic Regression classifiers

It is real AI/ML, but it is not yet a transformer or fine-tuned LLM.

If you want, the next upgrade path is:

- sentence embeddings
- transformer fine-tuning
- multilingual classification
- periodic automated retraining pipeline
