from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MultiLabelBinarizer, StandardScaler

from preprocess import join_pattern_labels, prepare_dataframe


def build_feature_transformer() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            ("text", TfidfVectorizer(max_features=5000, ngram_range=(1, 2)), "modelText"),
            ("numeric", StandardScaler(with_mean=False), ["age", "priorComplaintsCount"]),
        ]
    )


def train_models(data_path: Path, artifacts_dir: Path) -> None:
    dataset = pd.read_csv(data_path)
    prepared = prepare_dataframe(dataset)

    severity_pipeline = Pipeline(
        steps=[
            ("features", build_feature_transformer()),
            ("model", LogisticRegression(max_iter=1200)),
        ]
    )

    escalation_pipeline = Pipeline(
        steps=[
            ("features", build_feature_transformer()),
            ("model", LogisticRegression(max_iter=1200)),
        ]
    )

    multilabel_binarizer = MultiLabelBinarizer()
    pattern_targets = multilabel_binarizer.fit_transform(
        prepared["abusePatternLabels"].apply(join_pattern_labels)
    )

    pattern_pipeline = Pipeline(
        steps=[
            ("features", build_feature_transformer()),
            ("model", OneVsRestClassifier(LogisticRegression(max_iter=1200))),
        ]
    )

    severity_pipeline.fit(prepared[["modelText", "age", "priorComplaintsCount"]], prepared["severityLabel"])
    escalation_pipeline.fit(
        prepared[["modelText", "age", "priorComplaintsCount"]],
        prepared["escalationLabel"],
    )
    pattern_pipeline.fit(
        prepared[["modelText", "age", "priorComplaintsCount"]],
        pattern_targets,
    )

    artifacts_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(severity_pipeline, artifacts_dir / "severity_model.joblib")
    joblib.dump(escalation_pipeline, artifacts_dir / "escalation_model.joblib")
    joblib.dump(pattern_pipeline, artifacts_dir / "pattern_model.joblib")
    joblib.dump(multilabel_binarizer, artifacts_dir / "pattern_binarizer.joblib")

    metadata = {
        "training_rows": int(len(prepared)),
        "severity_labels": sorted(prepared["severityLabel"].dropna().unique().tolist()),
        "escalation_labels": sorted(prepared["escalationLabel"].dropna().unique().tolist()),
        "pattern_labels": sorted(multilabel_binarizer.classes_.tolist()),
        "features": ["modelText", "age", "priorComplaintsCount"],
    }
    (artifacts_dir / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Train baseline models for DV case analysis.")
    parser.add_argument("--data", required=True, help="Path to labeled CSV dataset")
    parser.add_argument("--artifacts", default="artifacts", help="Directory to save trained artifacts")
    args = parser.parse_args()

    train_models(Path(args.data), Path(args.artifacts))
    print(f"Saved trained artifacts to {Path(args.artifacts).resolve()}")


if __name__ == "__main__":
    main()
