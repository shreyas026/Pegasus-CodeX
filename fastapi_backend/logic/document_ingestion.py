from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
import io
import os
from pathlib import Path
import shutil
from tempfile import NamedTemporaryFile


MAX_UPLOAD_BYTES = 12 * 1024 * 1024
PDF_MIME_TYPE = "application/pdf"
SUPPORTED_IMAGE_TYPES = {
    "image/bmp",
    "image/jpeg",
    "image/png",
    "image/webp",
}
SUPPORTED_AUDIO_TYPES = {
    "audio/m4a",
    "audio/mp3",
    "audio/mpeg",
    "audio/mp4",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
    "audio/x-m4a",
    "audio/x-wav",
}
SUPPORTED_EXTENSIONS = {
    ".aac": "audio/mp4",
    ".bmp": "image/bmp",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".m4a": "audio/mp4",
    ".mp3": "audio/mpeg",
    ".pdf": PDF_MIME_TYPE,
    ".wav": "audio/wav",
    ".webm": "audio/webm",
    ".ogg": "audio/ogg",
    ".png": "image/png",
    ".webp": "image/webp",
}


class DocumentExtractionFailure(Exception):
    pass


class UnsupportedDocumentTypeError(DocumentExtractionFailure):
    pass


class DocumentProcessingUnavailableError(RuntimeError):
    pass


@dataclass
class ExtractedDocument:
    file_name: str
    content_type: str
    page_count: int
    used_ocr: bool
    extracted_text: str
    processing_mode: str
    processing_engine: str


def _normalize_text(text: str) -> str:
    normalized_lines: list[str] = []
    previous_was_blank = False

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if line:
            normalized_lines.append(line)
            previous_was_blank = False
        elif not previous_was_blank:
            normalized_lines.append("")
            previous_was_blank = True

    return "\n".join(normalized_lines).strip()


def _resolve_content_type(content_type: str | None, file_name: str | None) -> str:
    normalized_type = (content_type or "").strip().lower()

    if normalized_type == "image/jpg":
        normalized_type = "image/jpeg"
    if normalized_type == "audio/x-m4a":
        normalized_type = "audio/m4a"
    if normalized_type == "audio/x-wav":
        normalized_type = "audio/wav"

    if (
        normalized_type in SUPPORTED_IMAGE_TYPES
        or normalized_type in SUPPORTED_AUDIO_TYPES
        or normalized_type == PDF_MIME_TYPE
    ):
        return normalized_type

    extension = Path(file_name or "").suffix.lower()
    fallback_type = SUPPORTED_EXTENSIONS.get(extension)
    if fallback_type:
        return fallback_type

    raise UnsupportedDocumentTypeError(
        "Unsupported file type. Upload a PDF, image, or audio file such as PNG, JPG, WEBP, BMP, MP3, WAV, M4A, OGG, or WEBM."
    )


def _import_pdf_renderer():
    try:
        import fitz
    except ImportError as exc:
        raise DocumentProcessingUnavailableError(
            "PDF processing support is not installed. Install PyMuPDF from requirements.txt."
        ) from exc

    return fitz


def _import_image_stack():
    try:
        from PIL import Image, ImageOps
        import numpy as np
    except ImportError as exc:
        raise DocumentProcessingUnavailableError(
            "Image processing support is not installed. Install the backend requirements first."
        ) from exc

    return Image, ImageOps, np


@lru_cache(maxsize=1)
def _get_audio_transcriber():
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise DocumentProcessingUnavailableError(
            "Audio transcription support is not installed. Install faster-whisper from requirements.txt."
        ) from exc

    model_size = os.getenv("DV_STT_MODEL_SIZE", "small")
    requested_device = os.getenv("DV_STT_DEVICE", "auto").lower()
    requested_compute_type = os.getenv("DV_STT_COMPUTE_TYPE", "auto").lower()

    has_gpu = shutil.which("nvidia-smi") is not None
    device = "cuda" if requested_device == "auto" and has_gpu else requested_device
    if device == "auto":
        device = "cpu"

    compute_type = requested_compute_type
    if compute_type == "auto":
        compute_type = "float16" if device == "cuda" else "int8"

    try:
        model = WhisperModel(model_size, device=device, compute_type=compute_type)
        return model, f"faster-whisper:{model_size} ({device}/{compute_type})"
    except Exception as exc:
        if device == "cuda":
            try:
                fallback_model = WhisperModel(model_size, device="cpu", compute_type="int8")
                return fallback_model, f"faster-whisper:{model_size} (cpu/int8 fallback)"
            except Exception:
                pass
        raise DocumentProcessingUnavailableError(
            "The speech-to-text model could not be loaded. Check the faster-whisper installation and model settings."
        ) from exc


@lru_cache(maxsize=1)
def _get_ocr_engine():
    try:
        from rapidocr_onnxruntime import RapidOCR
    except ImportError as exc:
        raise DocumentProcessingUnavailableError(
            "OCR support is not installed. Install rapidocr-onnxruntime from requirements.txt."
        ) from exc

    return RapidOCR()


def _prepare_image_for_ocr(image):
    Image, ImageOps, np = _import_image_stack()

    prepared = ImageOps.exif_transpose(image)
    if prepared.mode not in {"L", "RGB"}:
        prepared = prepared.convert("RGB")

    width, height = prepared.size
    shortest_edge = max(1, min(width, height))
    if shortest_edge < 1200:
        scale = 1200 / shortest_edge
        resampling = getattr(getattr(Image, "Resampling", Image), "LANCZOS")
        prepared = prepared.resize(
            (max(1, int(width * scale)), max(1, int(height * scale))),
            resampling,
        )

    grayscale = ImageOps.grayscale(prepared)
    contrast_ready = ImageOps.autocontrast(grayscale).convert("RGB")
    return np.asarray(contrast_ready)


def _ocr_image(image) -> str:
    ocr_engine = _get_ocr_engine()
    result, _ = ocr_engine(_prepare_image_for_ocr(image))
    if not result:
        return ""

    extracted_lines: list[str] = []
    for entry in result:
        if not isinstance(entry, (list, tuple)) or len(entry) < 2:
            continue

        line = str(entry[1]).strip()
        if line:
            extracted_lines.append(line)

    return _normalize_text("\n".join(extracted_lines))


def _extract_from_image(file_bytes: bytes, file_name: str, content_type: str) -> ExtractedDocument:
    Image, _, _ = _import_image_stack()

    try:
        with Image.open(io.BytesIO(file_bytes)) as image:
            extracted_text = _ocr_image(image)
    except OSError as exc:
        raise DocumentExtractionFailure("The uploaded image could not be read.") from exc

    return ExtractedDocument(
        file_name=file_name,
        content_type=content_type,
        page_count=1,
        used_ocr=True,
        extracted_text=extracted_text,
        processing_mode="ocr-image",
        processing_engine="rapidocr",
    )


def _extract_from_pdf(file_bytes: bytes, file_name: str, content_type: str) -> ExtractedDocument:
    fitz = _import_pdf_renderer()
    Image, _, _ = _import_image_stack()

    try:
        document = fitz.open(stream=file_bytes, filetype="pdf")
    except RuntimeError as exc:
        raise DocumentExtractionFailure("The uploaded PDF could not be opened.") from exc

    page_text: list[str] = []
    used_ocr = False
    page_count = document.page_count
    processing_mode = "pdf-text"

    try:
        for page in document:
            direct_text = _normalize_text(page.get_text("text"))
            if direct_text:
                page_text.append(direct_text)
                continue

            pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            page_image = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)
            ocr_text = _ocr_image(page_image)
            if ocr_text:
                page_text.append(ocr_text)
                used_ocr = True
                processing_mode = "pdf-ocr"
    finally:
        document.close()

    return ExtractedDocument(
        file_name=file_name,
        content_type=content_type,
        page_count=max(1, page_count),
        used_ocr=used_ocr,
        extracted_text=_normalize_text("\n\n".join(page_text)),
        processing_mode=processing_mode,
        processing_engine="pymupdf+rapidocr" if used_ocr else "pymupdf",
    )


def _extract_from_audio(file_bytes: bytes, file_name: str, content_type: str) -> ExtractedDocument:
    transcriber, engine_label = _get_audio_transcriber()
    suffix = Path(file_name).suffix or ".wav"

    try:
        with NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(file_bytes)
            temp_path = temp_file.name

        segments, _ = transcriber.transcribe(temp_path, vad_filter=True)
        transcript = " ".join(segment.text.strip() for segment in segments if segment.text.strip())
    except Exception as exc:
        raise DocumentExtractionFailure(
            "The uploaded audio could not be transcribed. Try MP3, WAV, M4A, OGG, or WEBM with clear speech."
        ) from exc
    finally:
        try:
            if "temp_path" in locals():
                Path(temp_path).unlink(missing_ok=True)
        except OSError:
            pass

    return ExtractedDocument(
        file_name=file_name,
        content_type=content_type,
        page_count=1,
        used_ocr=False,
        extracted_text=_normalize_text(transcript),
        processing_mode="audio-stt",
        processing_engine=engine_label,
    )


def extract_document(
    file_bytes: bytes,
    *,
    content_type: str | None,
    file_name: str | None,
) -> ExtractedDocument:
    if not file_bytes:
        raise DocumentExtractionFailure("The uploaded file is empty.")

    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise DocumentExtractionFailure("The uploaded file exceeds the 12 MB limit.")

    resolved_file_name = file_name or "uploaded-document"
    resolved_content_type = _resolve_content_type(content_type, resolved_file_name)

    if resolved_content_type == PDF_MIME_TYPE:
        extracted = _extract_from_pdf(file_bytes, resolved_file_name, resolved_content_type)
    elif resolved_content_type in SUPPORTED_AUDIO_TYPES:
        extracted = _extract_from_audio(file_bytes, resolved_file_name, resolved_content_type)
    else:
        extracted = _extract_from_image(file_bytes, resolved_file_name, resolved_content_type)

    if not extracted.extracted_text:
        raise DocumentExtractionFailure(
            "No readable text was found in the uploaded file. Try a clearer image, a searchable PDF, or cleaner audio."
        )

    return extracted
