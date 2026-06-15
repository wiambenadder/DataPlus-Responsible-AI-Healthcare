"use client";
// src/app/standardize/StandardizeClient.tsx

import { useState, useRef, useCallback } from "react";
import {
  fromFiles,
  processAll,
  buildExports,
  downloadBlob,
  type RunResult,
  type ExportBundle,
} from "@/lib/standardization";

const EXPECTED_COMPANIES = [
  "Jacaranda Health",
  "Bive",
  "Sevamob",
  "mDoc",
  "Munai Health",
  "Simprints",
];

type Status = "idle" | "processing" | "done" | "error";

export default function StandardizeClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<RunResult | null>(null);
  const [bundle, setBundle] = useState<ExportBundle | null>(null);
  const [fileCount, setFileCount] = useState(0);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setStatus("processing");
    setError(null);
    setFileCount(files.length);

    try {
      const sources = await fromFiles(files);
      const result = processAll(sources, EXPECTED_COMPANIES);
      const exports = buildExports(result, EXPECTED_COMPANIES);
      setRun(result);
      setBundle(exports);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Data Standardisation
        </h1>
        <p className="text-gray-500 mb-8">
          Upload grantee 12-month reporting files (.xlsx) to clean and
          standardize.
        </p>

        {/* Upload zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 cursor-pointer hover:border-blue-400 transition-colors mb-8"
        >
          <p className="text-gray-600 font-medium">
            Drag & drop .xlsx files here, or click to browse
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Accepts multiple files at once
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Processing state */}
        {status === "processing" && (
          <div className="text-center py-8 text-gray-600">
            Processing {fileCount} file{fileCount !== 1 ? "s" : ""}…
          </div>
        )}

        {/* Error state */}
        {status === "error" && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-8">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Results */}
        {status === "done" && run && bundle && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Summary</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Files processed</span>
                  <p className="font-medium">{run.files.length}</p>
                </div>
                <div>
                  <span className="text-gray-500">Missing companies</span>
                  <p className="font-medium">
                    {run.missingCompanies.length === 0
                      ? "None"
                      : run.missingCompanies.join(", ")}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {run.files.map((f) => (
                  <div
                    key={f.company}
                    className="flex items-center justify-between text-sm border-t border-gray-100 pt-2"
                  >
                    <span className="text-gray-800">{f.company}</span>
                    <span className="text-gray-400">
                      {f.log.matchedIndicators}/
                      {f.log.matchedIndicators +
                        f.log.unmatchedIndicators.length}{" "}
                      indicators matched · {f.periodsDetected.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Downloads */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Downloads</h2>
              <div className="space-y-2">
                <h3 className="text-xs font-medium uppercase text-gray-400 tracking-wide">
                  Per-company cleaned workbooks
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {bundle.companyWorkbooks.map((w) => (
                    <button
                      key={w.company}
                      onClick={() =>
                        downloadBlob(w.blob, `${w.company}_cleaned.xlsx`)
                      }
                      className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                    >
                      {w.company}
                    </button>
                  ))}
                </div>

                <h3 className="text-xs font-medium uppercase text-gray-400 tracking-wide">
                  Funder views & log
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      downloadBlob(
                        bundle.funderQuantitative,
                        "funder_view.xlsx",
                      )
                    }
                    className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                  >
                    Funder View (xlsx)
                  </button>
                  <button
                    onClick={() =>
                      downloadBlob(
                        bundle.funderQualitative,
                        "funder_view_qualitative.csv",
                      )
                    }
                    className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                  >
                    Qualitative Responses (csv)
                  </button>
                  <button
                    onClick={() =>
                      downloadBlob(bundle.log, "standardization_log.json")
                    }
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Audit Log (JSON)
                  </button>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {run.files.some((f) => f.log.warnings.length > 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-medium text-amber-800 mb-2">Warnings</h3>
                {run.files
                  .filter((f) => f.log.warnings.length > 0)
                  .map((f) => (
                    <div key={f.company} className="text-sm text-amber-700">
                      <span className="font-medium">{f.company}:</span>{" "}
                      {f.log.warnings.join("; ")}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
