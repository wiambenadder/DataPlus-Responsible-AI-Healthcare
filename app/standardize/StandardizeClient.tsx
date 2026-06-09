"use client";

// app/standardize/StandardizeClient.tsx
// The interactive Step 3 surface. Upload a workbook -> it is standardized in
// the browser -> view it two ways (funder aggregate / innovator detail) ->
// export. All client-side, so it needs no server or database for this step.

import { useMemo, useState } from "react";
import { standardizeWorkbook } from "../../lib/standardization/engine";
import { aggregateByIndicator, periodChangeForGrantee } from "../../lib/standardization/aggregate";
import { DOMAINS, REPORTING_PERIODS } from "../../lib/standardization/schema";
import type { ReportingPeriod, StandardizationResult } from "../../lib/standardization/schema";
import { getIndicator } from "../../lib/standardization/catalog";
import {
  exportFunderWorkbook,
  exportInnovatorWorkbook,
  exportLongCSV,
} from "../../lib/standardization/export";

type View = "funder" | "innovator";

export default function StandardizeClient() {
  const [result, setResult] = useState<StandardizationResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [defaultPeriod, setDefaultPeriod] = useState<ReportingPeriod>("12-month");
  const [view, setView] = useState<View>("funder");
  const [grantee, setGrantee] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  async function handleFile(file: File) {
    setBusy(true);
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const XLSX = await import("xlsx");
      const wb = XLSX.read(buf, { type: "array" });
      const workbook = wb.SheetNames.map((name) => ({
        name,
        rows: XLSX.utils.sheet_to_json<(string | number | null)[]>(wb.Sheets[name], {
          header: 1,
          blankrows: true,
          defval: null,
        }),
      }));
      const res = standardizeWorkbook(workbook, { defaultPeriod, file: file.name });
      setResult(res);
      setFileName(file.name);
      setGrantee(res.grantees[0] ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 text-slate-800">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Step 3</p>
        <h1 className="text-3xl font-semibold text-slate-900">Data Standardisation</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Turns any grantee&apos;s messy reporting spreadsheet into one consistent structure, so
          companies can be compared with each other and with their own past reports. Numbers are
          recomputed from the clean data; qualitative answers are kept word-for-word.
        </p>
      </header>

      {/* Upload */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <label className="cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
            {busy ? "Reading…" : "Upload workbook (.xlsx)"}
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
          <div className="text-sm text-slate-600">
            Default period for sheets without a date marker:{" "}
            <select
              value={defaultPeriod}
              onChange={(e) => setDefaultPeriod(e.target.value as ReportingPeriod)}
              className="rounded border border-slate-300 px-2 py-1"
            >
              {REPORTING_PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          {fileName && <span className="text-sm text-slate-500">Loaded: {fileName}</span>}
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      {result && (
        <>
          {/* Summary chips */}
          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Chip label="Clean records" value={result.records.length} />
            <Chip label="Grantees" value={result.grantees.length} />
            <Chip label="Periods" value={result.periodsFound.join(", ") || "—"} />
            <Chip label="Unmapped columns" value={result.unmapped.length} accent />
          </section>

          {/* Exports */}
          <section className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => exportFunderWorkbook(result.records)} className={btn}>
              ⬇ Funder Excel
            </button>
            <button
              onClick={() => grantee && exportInnovatorWorkbook(result.records, grantee)}
              className={btn}
            >
              ⬇ Innovator Excel
            </button>
            <button onClick={() => exportLongCSV(result.records)} className={btn}>
              ⬇ Tidy CSV
            </button>
            <button onClick={() => window.print()} className={btn}>
              🖨 Print / Save as PDF
            </button>
          </section>

          {/* View toggle */}
          <div className="mt-8 flex gap-2">
            <Toggle active={view === "funder"} onClick={() => setView("funder")}>
              Funder view (all companies)
            </Toggle>
            <Toggle active={view === "innovator"} onClick={() => setView("innovator")}>
              Innovator view (one company)
            </Toggle>
          </div>

          {view === "funder" ? (
            <FunderView result={result} />
          ) : (
            <InnovatorView result={result} grantee={grantee} setGrantee={setGrantee} />
          )}

          {/* Unmapped panel */}
          {result.unmapped.length > 0 && (
            <section className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="font-semibold text-amber-900">
                {result.unmapped.length} columns not yet mapped to the standard
              </h3>
              <p className="mt-1 text-sm text-amber-800">
                These were flagged, never dropped. Add them to the indicator catalog (or have the
                assistant suggest a mapping). This is how the standard grows for new cohorts.
              </p>
              <ul className="mt-3 max-h-48 space-y-1 overflow-auto text-sm text-amber-900">
                {result.unmapped.map((u, i) => (
                  <li key={i} className="font-mono text-xs">
                    [{u.sheet}] {u.header}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

const btn =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";

function Chip({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${accent ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"}`}>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium ${
        active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

// --------------------------- Funder view ----------------------------------
function FunderView({ result }: { result: StandardizationResult }) {
  const aggs = useMemo(() => aggregateByIndicator(result.records), [result]);
  const periods = REPORTING_PERIODS.filter((p) => result.periodsFound.includes(p));

  return (
    <section className="mt-6">
      {DOMAINS.map((domain) => {
        const rows = [
          ...new Map(
            aggs
              .filter((a) => getIndicator(a.indicatorId)?.domain === domain.id)
              .map((a) => [a.indicatorId, a.indicatorLabel])
          ),
        ];
        if (rows.length === 0) return null;
        return (
          <div key={domain.id} className="mb-8">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-700">
              {domain.label}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Indicator</th>
                    {periods.map((p) => (
                      <th key={p} className="px-3 py-2 text-right">
                        {p} (total · #)
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([id, label]) => (
                    <tr key={id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-700">{label}</td>
                      {periods.map((p) => {
                        const a = aggs.find((x) => x.indicatorId === id && x.period === p);
                        return (
                          <td key={p} className="px-3 py-2 text-right tabular-nums">
                            {a ? (
                              <>
                                <span className="font-medium text-slate-900">
                                  {a.total.toLocaleString()}
                                </span>{" "}
                                <span className="text-slate-400">· {a.numberReporting}</span>
                              </>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}

// -------------------------- Innovator view --------------------------------
function InnovatorView({
  result,
  grantee,
  setGrantee,
}: {
  result: StandardizationResult;
  grantee: string;
  setGrantee: (g: string) => void;
}) {
  const periods = REPORTING_PERIODS.filter((p) => result.periodsFound.includes(p));
  const mine = result.records.filter((r) => r.grantee === grantee);
  const change = useMemo(() => {
    if (periods.length < 2) return [];
    return periodChangeForGrantee(result.records, grantee, periods[0], periods[periods.length - 1])
      .filter((c) => c.percentChange !== null)
      .sort((a, b) => (b.percentChange ?? 0) - (a.percentChange ?? 0));
  }, [result, grantee, periods]);

  return (
    <section className="mt-6">
      <div className="mb-4 text-sm text-slate-600">
        Company:{" "}
        <select
          value={grantee}
          onChange={(e) => setGrantee(e.target.value)}
          className="rounded border border-slate-300 px-2 py-1"
        >
          {result.grantees.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {DOMAINS.map((domain) => {
        const recs = mine.filter((r) => r.domain === domain.id);
        const ids = [...new Map(recs.map((r) => [r.indicatorId, r.indicatorLabel]))];
        if (ids.length === 0) return null;
        return (
          <div key={domain.id} className="mb-6">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-700">
              {domain.label}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Indicator</th>
                    {periods.map((p) => (
                      <th key={p} className="px-3 py-2 text-right">
                        {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ids.map(([id, label]) => (
                    <tr key={id} className="border-t border-slate-100 align-top">
                      <td className="px-3 py-2 text-slate-700">{label}</td>
                      {periods.map((p) => {
                        const rec = recs.find((r) => r.indicatorId === id && r.period === p);
                        return (
                          <td key={p} className="px-3 py-2 text-right">
                            {!rec || rec.value === null ? (
                              <span className="text-slate-300">
                                {rec && rec.applies ? "not reported" : "n/a"}
                              </span>
                            ) : rec.valueType === "text" ? (
                              <span className="block max-w-xs text-left text-slate-600">{String(rec.value)}</span>
                            ) : (
                              <span className="tabular-nums font-medium text-slate-900">
                                {typeof rec.value === "number" ? rec.value.toLocaleString() : String(rec.value)}
                                {rec.unit ?? ""}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {change.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-700">
            Biggest growth ({periods[0]} → {periods[periods.length - 1]})
          </h3>
          <ul className="space-y-1 text-sm">
            {change.slice(0, 6).map((c) => (
              <li key={c.indicatorId} className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-700">{c.indicatorLabel}</span>
                <span className="tabular-nums text-slate-500">
                  {c.fromValue.toLocaleString()} → {c.toValue.toLocaleString()}{" "}
                  <span className="font-medium text-teal-700">+{c.percentChange?.toFixed(0)}%</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
