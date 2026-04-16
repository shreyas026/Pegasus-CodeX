from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from preprocess import prepare_dataframe


def _severity_score_from_probabilities(labels: list[str], probabilities: list[float]) -> int:
    weight_map = {"low": 20, "medium": 55, "high": 85}
    weighted_score = sum(weight_map.get(label, 0) * probability for label, probability in zip(labels, probabilities))
    return max(0, min(100, round(weighted_score)))


def predict_case(case_data: dict[str, Any], artifacts_dir: str | Path = "artifacts") -> dict[str, Any]:
    artifacts_path = Path(artifacts_dir)
    severity_model = joblib.load(artifacts_path / "severity_model.joblib")
    escalation_model = joblib.load(artifacts_path / "escalation_model.joblib")
    pattern_model = joblib.load(artifacts_path / "pattern_model.joblib")
    pattern_binarizer = joblib.load(artifacts_path / "pattern_binarizer.joblib")

    frame = pd.DataFrame([case_data])
    prepared = prepare_dataframe(frame)
    features = prepared[["modelText", "age", "priorComplaintsCount"]]

    severity_label = str(severity_model.predict(features)[0])
    severity_probabilities = severity_model.predict_proba(features)[0].tolist()
    severity_score = _severity_score_from_probabilities(
        severity_model.classes_.tolist(),
        severity_probabilities,
    )

    escalation_label = str(escalation_model.predict(features)[0])
    escalation_probabilities = escalation_model.predict_proba(features)[0].tolist()
    escalation_score = _severity_score_from_probabilities(
        escalation_model.classes_.tolist(),
        escalation_probabilities,
    )

    pattern_prediction = pattern_model.predict(features)
    abuse_patterns = pattern_binarizer.inverse_transform(pattern_prediction)[0]

    return {
        "severity": severity_label,
        "riskScore": severity_score,
        "escalationLevel": escalation_label,
        "escalationScore": escalation_score,
        "abusePatterns": list(abuse_patterns),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run saved-model inference for a DV case.")
    parser.add_argument("--artifacts", default="artifacts", help="Directory containing trained artifacts")
    parser.add_argument("--input", required=True, help="Path to a JSON file with case data")
    args = parser.parse_args()

    case_data = json.loads(Path(args.input).read_text(encoding="utf-8"))
    result = predict_case(case_data, artifacts_dir=args.artifacts)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
