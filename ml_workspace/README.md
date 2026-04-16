# ML Workspace

This workspace is the starting point for a real training pipeline for the Domestic Violence Case Pattern Analyzer.

## What is included

- `data/sample_cases.csv` - example labeled dataset format
- `src/preprocess.py` - shared preprocessing helpers
- `src/train_baselines.py` - baseline classical ML training script
- `src/inference.py` - saved-model inference loader
- `requirements.txt` - Python dependencies for training

## Tasks covered

- Severity classification
- Escalation classification
- Abuse pattern multi-label tagging

## Dataset columns

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

`timelineEvents` can be stored as a JSON array string. `abusePatternLabels` should use `|` as a separator, for example `physical|emotional`.

## Train

```bash
cd ml_workspace
pip install -r requirements.txt
python src/train_baselines.py --data data/sample_cases.csv --artifacts artifacts
```

## Run inference

```bash
python src/inference.py --artifacts artifacts --input sample_case.json
```

## Notes

- The baseline uses TF-IDF plus simple numeric features.
- This is intended as an explainable baseline before moving to embeddings or transformer fine-tuning.
- You can later replace the sample dataset with NGO-safe anonymized labeled data.
