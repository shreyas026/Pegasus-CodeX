from __future__ import annotations

import base64
import json
import os
import sqlite3
from pathlib import Path
from uuid import uuid4

from models import (
    AlertRecord,
    AnalysisResult,
    CaseDocument,
    CaseRecord,
    CaseSummary,
    HeatmapPoint,
    TimelineEvent,
)


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
DATABASE_PATH = DATA_DIR / "case_analyzer.sqlite3"


def init_storage() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

    with _get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS cases (
                id TEXT PRIMARY KEY,
                anonymous_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                victim_name TEXT NOT NULL,
                age INTEGER NOT NULL,
                abuse_type TEXT NOT NULL,
                incident_description TEXT NOT NULL,
                frequency TEXT NOT NULL,
                threat_level TEXT NOT NULL,
                statement TEXT NOT NULL DEFAULT '',
                history_summary TEXT NOT NULL DEFAULT '',
                prior_complaints_count INTEGER NOT NULL DEFAULT 0,
                timeline_events TEXT NOT NULL,
                location_label TEXT NOT NULL DEFAULT '',
                location_lat REAL,
                location_lng REAL,
                emergency_contacts_json TEXT NOT NULL DEFAULT '[]',
                analysis_json TEXT
            );

            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                case_id TEXT NOT NULL,
                file_name TEXT NOT NULL,
                content_type TEXT NOT NULL,
                storage_path TEXT NOT NULL,
                page_count INTEGER NOT NULL,
                used_ocr INTEGER NOT NULL,
                extracted_text TEXT NOT NULL,
                uploaded_at TEXT NOT NULL,
                FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                case_id TEXT NOT NULL,
                alert_type TEXT NOT NULL,
                level TEXT NOT NULL,
                message TEXT NOT NULL,
                targets TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                resolved_at TEXT,
                FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
            CREATE INDEX IF NOT EXISTS idx_alerts_case_id ON alerts(case_id);
            """
        )

        _ensure_columns(connection)


def _get_connection() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def _ensure_columns(connection: sqlite3.Connection) -> None:
    columns = {
        row["name"]
        for row in connection.execute("PRAGMA table_info(cases)").fetchall()
    }
    migrations = {
        "anonymous_id": "ALTER TABLE cases ADD COLUMN anonymous_id TEXT NOT NULL DEFAULT ''",
        "location_label": "ALTER TABLE cases ADD COLUMN location_label TEXT NOT NULL DEFAULT ''",
        "location_lat": "ALTER TABLE cases ADD COLUMN location_lat REAL",
        "location_lng": "ALTER TABLE cases ADD COLUMN location_lng REAL",
        "emergency_contacts_json": "ALTER TABLE cases ADD COLUMN emergency_contacts_json TEXT NOT NULL DEFAULT '[]'",
    }
    for column, statement in migrations.items():
        if column not in columns:
            connection.execute(statement)


def _serialize_timeline(events: list[TimelineEvent]) -> str:
    return json.dumps([event.model_dump() for event in events], ensure_ascii=True)


def _serialize_analysis(analysis: AnalysisResult | None) -> str | None:
    if not analysis:
        return None
    return json.dumps(analysis.model_dump(), ensure_ascii=True)


def _parse_timeline(raw_value: str) -> list[TimelineEvent]:
    return [TimelineEvent(**item) for item in json.loads(raw_value or "[]")]


def _parse_analysis(raw_value: str | None) -> AnalysisResult | None:
    if not raw_value:
        return None
    return AnalysisResult(**json.loads(raw_value))


def _preview_text(text: str, limit: int = 180) -> str:
    normalized = " ".join(text.split())
    if len(normalized) <= limit:
        return normalized
    return f"{normalized[: limit - 3].rstrip()}..."


def _document_from_row(row: sqlite3.Row) -> CaseDocument:
    extracted_text = row["extracted_text"] or ""
    return CaseDocument(
        id=row["id"],
        fileName=row["file_name"],
        contentType=row["content_type"],
        pageCount=row["page_count"],
        usedOcr=bool(row["used_ocr"]),
        textLength=len(extracted_text),
        preview=_preview_text(extracted_text),
        uploadedAt=row["uploaded_at"],
    )


def _list_case_documents(connection: sqlite3.Connection, case_id: str) -> list[CaseDocument]:
    rows = connection.execute(
        """
        SELECT id, file_name, content_type, page_count, used_ocr, extracted_text, uploaded_at
        FROM documents
        WHERE case_id = ?
        ORDER BY uploaded_at DESC
        """,
        (case_id,),
    ).fetchall()
    return [_document_from_row(row) for row in rows]


def _case_from_row(connection: sqlite3.Connection, row: sqlite3.Row) -> CaseRecord:
    return CaseRecord(
        id=row["id"],
        anonymousId=row["anonymous_id"] or "",
        createdAt=row["created_at"],
        updatedAt=row["updated_at"],
        victimName=row["victim_name"],
        age=row["age"],
        abuseType=row["abuse_type"],
        incidentDescription=_decrypt_text(row["incident_description"]),
        frequency=row["frequency"],
        threatLevel=row["threat_level"],
        statement=_decrypt_text(row["statement"] or ""),
        historySummary=_decrypt_text(row["history_summary"] or ""),
        priorComplaintsCount=row["prior_complaints_count"],
        timelineEvents=_parse_timeline(row["timeline_events"]),
        locationLabel=row["location_label"] or "",
        locationLat=row["location_lat"],
        locationLng=row["location_lng"],
        emergencyContacts=json.loads(row["emergency_contacts_json"] or "[]"),
        analysis=_parse_analysis(row["analysis_json"]),
        documents=_list_case_documents(connection, row["id"]),
    )


def save_case_record(case_record: CaseRecord) -> CaseRecord:
    with _get_connection() as connection:
        connection.execute(
            """
            INSERT INTO cases (
                id,
                anonymous_id,
                created_at,
                updated_at,
                victim_name,
                age,
                abuse_type,
                incident_description,
                frequency,
                threat_level,
                statement,
                history_summary,
                prior_complaints_count,
                timeline_events,
                location_label,
                location_lat,
                location_lng,
                emergency_contacts_json,
                analysis_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                updated_at = excluded.updated_at,
                victim_name = excluded.victim_name,
                age = excluded.age,
                abuse_type = excluded.abuse_type,
                incident_description = excluded.incident_description,
                frequency = excluded.frequency,
                threat_level = excluded.threat_level,
                statement = excluded.statement,
                history_summary = excluded.history_summary,
                prior_complaints_count = excluded.prior_complaints_count,
                timeline_events = excluded.timeline_events,
                location_label = excluded.location_label,
                location_lat = excluded.location_lat,
                location_lng = excluded.location_lng,
                emergency_contacts_json = excluded.emergency_contacts_json,
                analysis_json = excluded.analysis_json
            """,
            (
                case_record.id,
                case_record.anonymousId,
                case_record.createdAt,
                case_record.updatedAt,
                case_record.victimName,
                case_record.age,
                case_record.abuseType,
                _encrypt_text(case_record.incidentDescription),
                case_record.frequency,
                case_record.threatLevel,
                _encrypt_text(case_record.statement),
                _encrypt_text(case_record.historySummary),
                case_record.priorComplaintsCount,
                _serialize_timeline(case_record.timelineEvents),
                case_record.locationLabel,
                case_record.locationLat,
                case_record.locationLng,
                json.dumps(case_record.emergencyContacts, ensure_ascii=True),
                _serialize_analysis(case_record.analysis),
            ),
        )

        row = connection.execute("SELECT * FROM cases WHERE id = ?", (case_record.id,)).fetchone()
        if row is None:
            raise RuntimeError("Failed to persist case record.")
        return _case_from_row(connection, row)


def get_case_record(case_id: str) -> CaseRecord | None:
    with _get_connection() as connection:
        row = connection.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
        if row is None:
            return None
        return _case_from_row(connection, row)


def store_case_document(
    case_id: str,
    *,
    file_name: str,
    content_type: str,
    page_count: int,
    used_ocr: bool,
    extracted_text: str,
    file_bytes: bytes,
    uploaded_at: str,
) -> CaseDocument:
    case_upload_dir = UPLOADS_DIR / case_id
    case_upload_dir.mkdir(parents=True, exist_ok=True)

    suffix = Path(file_name).suffix or ".bin"
    stored_path = case_upload_dir / f"{uuid4().hex}{suffix}"
    stored_path.write_bytes(file_bytes)

    document_id = str(uuid4())

    with _get_connection() as connection:
        connection.execute(
            """
            INSERT INTO documents (
                id,
                case_id,
                file_name,
                content_type,
                storage_path,
                page_count,
                used_ocr,
                extracted_text,
                uploaded_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                document_id,
                case_id,
                file_name,
                content_type,
                str(stored_path),
                page_count,
                1 if used_ocr else 0,
                extracted_text,
                uploaded_at,
            ),
        )
        connection.execute(
            "UPDATE cases SET updated_at = ? WHERE id = ?",
            (uploaded_at, case_id),
        )
        row = connection.execute(
            """
            SELECT id, file_name, content_type, page_count, used_ocr, extracted_text, uploaded_at
            FROM documents
            WHERE id = ?
            """,
            (document_id,),
        ).fetchone()
        if row is None:
            raise RuntimeError("Failed to persist case document.")
        return _document_from_row(row)


def build_case_summary(case_record: CaseRecord) -> CaseSummary:
    analysis = case_record.analysis

    return CaseSummary(
        id=case_record.id,
        anonymousId=case_record.anonymousId,
        victimName=case_record.victimName,
        abuseType=case_record.abuseType,
        threatLevel=case_record.threatLevel,
        frequency=case_record.frequency,
        priorComplaintsCount=case_record.priorComplaintsCount,
        timelineEventCount=len(case_record.timelineEvents),
        documentCount=len(case_record.documents),
        status="analyzed" if analysis else "intake-complete",
        severity=analysis.severity if analysis else None,
        riskScore=analysis.riskScore if analysis else None,
        escalationLevel=analysis.escalationLevel if analysis else None,
        urgency=analysis.safeActionNavigator.urgency if analysis else "Awaiting statement analysis",
        analysisMode=analysis.analysisMode if analysis else None,
        locationLabel=case_record.locationLabel,
        createdAt=case_record.createdAt,
        updatedAt=case_record.updatedAt,
    )


def list_case_summaries() -> list[CaseSummary]:
    with _get_connection() as connection:
        rows = connection.execute("SELECT * FROM cases ORDER BY updated_at DESC").fetchall()
        return [build_case_summary(_case_from_row(connection, row)) for row in rows]


def find_repeat_offender_cases(signature: str, exclude_case_id: str) -> list[str]:
    if not signature:
        return []
    matches: list[str] = []
    with _get_connection() as connection:
        rows = connection.execute(
            "SELECT id, analysis_json FROM cases WHERE id != ?",
            (exclude_case_id,),
        ).fetchall()
        for row in rows:
            analysis = _parse_analysis(row["analysis_json"])
            if analysis and analysis.repeatOffenderSignature == signature:
                matches.append(row["id"])
    return matches


def _crypto_key() -> bytes | None:
    raw_key = os.getenv("DV_CRYPTO_KEY", "").strip()
    if not raw_key:
        return None
    try:
        return raw_key.encode("utf-8")
    except Exception:
        return None


def _encrypt_text(value: str) -> str:
    key = _crypto_key()
    if not key:
        return value
    try:
        from cryptography.fernet import Fernet

        fernet = Fernet(key)
        encrypted = fernet.encrypt(value.encode("utf-8"))
        return f"enc::{base64.urlsafe_b64encode(encrypted).decode('utf-8')}"
    except Exception:
        return value


def _decrypt_text(value: str) -> str:
    if not value or not value.startswith("enc::"):
        return value
    key = _crypto_key()
    if not key:
        return value
    try:
        from cryptography.fernet import Fernet

        fernet = Fernet(key)
        payload = value.replace("enc::", "", 1)
        decrypted = fernet.decrypt(base64.urlsafe_b64decode(payload.encode("utf-8")))
        return decrypted.decode("utf-8")
    except Exception:
        return value


def create_alert(
    *,
    case_id: str,
    alert_type: str,
    level: str,
    message: str,
    targets: list[str],
    created_at: str,
) -> AlertRecord:
    alert_id = str(uuid4())
    with _get_connection() as connection:
        connection.execute(
            """
            INSERT INTO alerts (
                id, case_id, alert_type, level, message, targets, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                alert_id,
                case_id,
                alert_type,
                level,
                message,
                json.dumps(targets, ensure_ascii=True),
                "active",
                created_at,
            ),
        )
        row = connection.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,)).fetchone()
        if row is None:
            raise RuntimeError("Failed to persist alert record.")
        return _alert_from_row(row)


def _alert_from_row(row: sqlite3.Row) -> AlertRecord:
    return AlertRecord(
        id=row["id"],
        caseId=row["case_id"],
        alertType=row["alert_type"],
        level=row["level"],
        message=row["message"],
        targets=json.loads(row["targets"] or "[]"),
        status=row["status"],
        createdAt=row["created_at"],
        resolvedAt=row["resolved_at"],
    )


def list_alerts() -> list[AlertRecord]:
    with _get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM alerts ORDER BY created_at DESC"
        ).fetchall()
        return [_alert_from_row(row) for row in rows]


def acknowledge_alert(alert_id: str, resolved_at: str) -> AlertRecord | None:
    with _get_connection() as connection:
        connection.execute(
            "UPDATE alerts SET status = ?, resolved_at = ? WHERE id = ?",
            ("resolved", resolved_at, alert_id),
        )
        row = connection.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,)).fetchone()
        if row is None:
            return None
        return _alert_from_row(row)


def list_heatmap_points() -> list[HeatmapPoint]:
    with _get_connection() as connection:
        rows = connection.execute(
            """
            SELECT location_label, location_lat, location_lng, analysis_json
            FROM cases
            """
        ).fetchall()

    buckets: dict[str, dict[str, object]] = {}
    for row in rows:
        label = (row["location_label"] or "Unknown area").strip() or "Unknown area"
        analysis = _parse_analysis(row["analysis_json"])
        risk_score = analysis.riskScore if analysis else 0
        high_risk = 1 if analysis and (analysis.riskScore >= 70 or analysis.severity == "high") else 0
        bucket = buckets.setdefault(
            label,
            {
                "total": 0,
                "high": 0,
                "score_sum": 0,
                "lat": row["location_lat"],
                "lng": row["location_lng"],
            },
        )
        bucket["total"] = int(bucket["total"]) + 1
        bucket["high"] = int(bucket["high"]) + high_risk
        bucket["score_sum"] = int(bucket["score_sum"]) + (risk_score or 0)

    points: list[HeatmapPoint] = []
    for label, data in buckets.items():
        total = int(data["total"])
        score_sum = int(data["score_sum"])
        avg = round(score_sum / total) if total else 0
        points.append(
            HeatmapPoint(
                label=label,
                totalCount=total,
                highRiskCount=int(data["high"]),
                averageRiskScore=avg,
                locationLat=data.get("lat"),
                locationLng=data.get("lng"),
            )
        )
    return sorted(points, key=lambda item: item.highRiskCount, reverse=True)
