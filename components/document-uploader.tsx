"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

import { LoadingSpinner } from "@/components/loading-spinner";
import { uploadCaseDocument } from "@/lib/api";
import type { CaseDocument, DocumentUploadResponse } from "@/lib/types";

const ACCEPTED_TYPES = ".pdf,.png,.jpg,.jpeg,.webp,.bmp,.mp3,.wav,.m4a,.ogg,.webm";

function isAudioDocument(document: CaseDocument) {
  return document.contentType.startsWith("audio/");
}

function formatUploadedAt(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

interface DocumentUploaderProps {
  caseId: string | null;
  ensureCaseId: () => Promise<string>;
  documents: CaseDocument[];
  onImported: (response: DocumentUploadResponse) => void;
}

export function DocumentUploader({
  caseId,
  ensureCaseId,
  documents,
  onImported
}: DocumentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestMessage, setLatestMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  async function importFiles(fileList: File[]) {
    if (fileList.length === 0) {
      return;
    }

    setError(null);
    setLatestMessage(null);
    setUploadProgress(null);
    setIsUploading(true);

    let activeCaseId: string;

    try {
      activeCaseId = caseId ?? (await ensureCaseId());
    } catch (uploadError) {
      setIsUploading(false);
      setError(
        uploadError instanceof Error ? uploadError.message : "Unable to create the case for upload."
      );
      return;
    }

    const importedNames: string[] = [];
    const failedNames: string[] = [];

    for (const [index, file] of fileList.entries()) {
      setUploadProgress(`Importing ${index + 1} of ${fileList.length}: ${file.name}`);

      try {
        const response = await uploadCaseDocument(activeCaseId, file);
        onImported(response);
        importedNames.push(
          `${response.document.fileName} (${response.processingMode}, ${response.document.textLength} chars)`
        );
      } catch (uploadError) {
        failedNames.push(
          uploadError instanceof Error ? `${file.name}: ${uploadError.message}` : file.name
        );
      }
    }

    setIsUploading(false);
    setUploadProgress(null);

    if (importedNames.length > 0) {
      setLatestMessage(
        importedNames.length === 1
          ? `${importedNames[0]} imported successfully.`
          : `${importedNames.length} files imported successfully: ${importedNames.join("; ")}.`
      );
    }

    if (failedNames.length > 0) {
      setError(
        failedNames.length === 1
          ? failedNames[0]
          : `Some files could not be imported: ${failedNames.join("; ")}`
      );
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    void importFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    void importFiles(Array.from(event.dataTransfer.files ?? []));
  }

  return (
    <section className="space-y-4 rounded-[26px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,252,247,0.76),rgba(243,235,221,0.54))] p-5 shadow-[0_12px_30px_rgba(48,33,23,0.08)] backdrop-blur-[24px]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="display-kicker text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
            Source Intake
          </p>
          <h3 className="text-[1.4rem] font-semibold text-[var(--accent-strong)]">
            Import a PDF, image, or voice note instead of retyping the statement
          </h3>
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Upload a complaint PDF, scanned statement, court note, or phone photo. The app extracts
            the text, stores the source file against the case, and drops the extracted text into the
            statement field for the usual risk analysis flow. Audio uploads are transcribed with
            speech-to-text before being appended.
          </p>
        </div>

        <div className="grid min-w-[220px] grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-3">
            <p className="text-[var(--muted)]">Stored Docs</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--accent-strong)]">{documents.length}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-3">
            <p className="text-[var(--muted)]">Upload Mode</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--accent-strong)]">OCR + STT</p>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`w-full rounded-[24px] border border-dashed px-6 py-8 text-left transition ${
          isDragging
            ? "border-[var(--accent)] bg-[rgba(255,255,255,0.76)]"
            : "border-[var(--border-strong)] bg-[rgba(255,255,255,0.46)]"
        } ${isUploading ? "cursor-not-allowed opacity-70" : "hover:bg-[rgba(255,255,255,0.72)]"}`}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-base font-semibold text-[var(--accent-strong)]">
              Drag one or more PDF, image, or audio files here, or browse from your device
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Accepted formats: PDF, PNG, JPG, WEBP, BMP, MP3, WAV, M4A, OGG, WEBM. Text-based PDFs
              are read directly, scanned files fall back to OCR, and audio files are transcribed with
              speech-to-text.
            </p>
          </div>
          <span className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent-strong)] px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(6,17,13,0.18)]">
            {isUploading ? <LoadingSpinner /> : null}
            {isUploading ? "Importing..." : "Choose Files"}
          </span>
        </div>
      </button>

      {uploadProgress ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          {uploadProgress}
        </div>
      ) : null}

      {latestMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {latestMessage}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!caseId ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          The first upload will create a case record automatically and then attach these files to it.
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Attached Source Documents
          </h4>
          <span className="status-pill">{documents.length} linked</span>
        </div>

        {documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[rgba(255,255,255,0.44)] px-4 py-5 text-sm text-[var(--muted)]">
            No source documents linked yet. The first upload will be saved against this case and can
            be revisited from the dashboard.
          </div>
        ) : (
          <div className="grid gap-3">
            {documents.map((document) => (
              <article
                key={document.id}
                className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.6)] p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[var(--accent-strong)]">{document.fileName}</p>
                      {isAudioDocument(document) ? (
                        <span className="status-pill">Audio</span>
                      ) : (
                        <span className="status-pill">
                          {document.pageCount} page{document.pageCount === 1 ? "" : "s"}
                        </span>
                      )}
                      {document.usedOcr ? <span className="status-pill">OCR</span> : null}
                      {isAudioDocument(document) ? <span className="status-pill">STT</span> : null}
                    </div>
                    <p className="text-sm leading-6 text-[var(--muted)]">{document.preview}</p>
                  </div>
                  <div className="grid gap-1 text-sm text-[var(--muted)] lg:text-right">
                    <p>
                      Characters:{" "}
                      <span className="font-semibold text-[var(--accent-strong)]">{document.textLength}</span>
                    </p>
                    <p>
                      Imported:{" "}
                      <span className="font-semibold text-[var(--accent-strong)]">
                        {formatUploadedAt(document.uploadedAt)}
                      </span>
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
