// src/lib/standardization/index.ts
//
// Public API of the standardization module. Import from "@/lib/standardization".
//
// Typical flow in a client component:
//
//   import { fromFiles, processAll, buildExports, downloadBlob } from "@/lib/standardization";
//
//   const sources = await fromFiles(fileInput.files!);
//   const run = processAll(sources, EXPECTED_COMPANIES);
//   const bundle = buildExports(run, EXPECTED_COMPANIES);
//   bundle.companyWorkbooks.forEach(w => downloadBlob(w.blob, `${w.company}_cleaned.xlsx`));
//   downloadBlob(bundle.funderQuantitative, "funder_view_quantitative.csv");

export * from "./types";
export { schema, canonicalFor, partialCoverageFor, SHEET_ROLES } from "./schema";
export type { Schema, SheetRoleConfig, FuzzyConfig } from "./schema";
export { cleanNumber, cleanQualitative, toIsoDate } from "./normalize";
export { matchIndicator, matchColumn, matchSheetRole, normKey, stripParens } from "./catalog";
export { processSource, processAll } from "./engine";
export { buildFunderView } from "./aggregate";
export type { FunderView, QuantRow, QualRow } from "./aggregate";
export {
  buildExports,
  companyWorkbook,
  downloadBlob,
  funderQuantitativeCsv,
  funderQualitativeCsv,
} from "./export";
export type { ExportBundle } from "./export";
export {
  fromFile,
  fromFiles,
  fromSupabase,
  inferCompany,
} from "./source";
export type { WorkbookSource } from "./source";
