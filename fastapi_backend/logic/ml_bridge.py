from __future__ import annotations

import sys
from pathlib import Path
from typing import Any


ROOT_DIR = Path(__file__).resolve().parents[2]
ML_SRC_DIR = ROOT_DIR / "ml_workspace" / "src"
ML_ARTIFACTS_DIR = ROOT_DIR / "ml_workspace" / "artifacts"


def _build_case_payload(case_data: dict[str, Any]) -> dict[str, Any]:
    return {
        "age": case_data.get("age", 0),
        "abuseType": case_data.get("abuseType", ""),
        "frequency": case_data.get("frequency", ""),
        "threatLevel": case_data.get("threatLevel", ""),
        "incidentDescription": case_data.get("incidentDescription", ""),
        "statement": case_data.get("statement", ""),
        "historySummary": case_data.get("historySummary", ""),
        "priorComplaintsCount": case_data.get("priorComplaintsCount", 0),
        "timelineEvents": case_data.get("timelineEvents", []),
    }


def get_ml_prediction(case_data: dict[str, Any]) -> dict[str, Any] | None:
    if not ML_ARTIFACTS_DIR.exists():
        return None

    required_artifacts = [
        ML_ARTIFACTS_DIR / "severity_model.joblib",
        ML_ARTIFACTS_DIR / "escalation_model.joblib",
        ML_ARTIFACTS_DIR / "pattern_model.joblib",
        ML_ARTIFACTS_DIR / "pattern_binarizer.joblib",
    ]
    if not all(path.exists() for path in required_artifacts):
        return None

    if str(ML_SRC_DIR) not in sys.path:
        sys.path.insert(0, str(ML_SRC_DIR))

    try:
        from inference import predict_case  # type: ignore

        return predict_case(
            _build_case_payload(case_data),
            artifacts_dir=ML_ARTIFACTS_DIR,
        )
    except Exception:
        return None
