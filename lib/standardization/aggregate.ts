// lib/standardization/aggregate.ts
// ---------------------------------------------------------------------------
// The FUNDER view is built here by recomputing aggregates from the clean
// records (rather than trusting the spreadsheet's own total rows). Because
// `applies` separates "not measured" from 0, "number reporting" is honest:
// it counts only the grantees for whom the indicator actually applies.
// ---------------------------------------------------------------------------

import { getIndicator } from "./catalog";
import type {
  ReportingPeriod,
  StandardizedRecord,
} from "./schema";

export interface IndicatorAggregate {
  indicatorId: string;
  indicatorLabel: string;
  period: ReportingPeriod;
  total: number; // sum across grantees (numeric indicators only)
  numberReporting: number; // how many grantees this indicator applied to
  mean: number | null;
}

// Portfolio totals per numeric indicator, per period.
export function aggregateByIndicator(
  records: StandardizedRecord[]
): IndicatorAggregate[] {
  const groups = new Map<string, StandardizedRecord[]>();
  for (const r of records) {
    if (r.valueType === "text" || r.valueType === "boolean") continue;
    const key = `${r.indicatorId}|${r.period}`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(r);
  }

  const result: IndicatorAggregate[] = [];
  for (const [key, recs] of groups) {
    const [indicatorId, period] = key.split("|") as [string, ReportingPeriod];
    const reporting = recs.filter((r) => r.applies && typeof r.value === "number");
    const total = reporting.reduce((s, r) => s + (r.value as number), 0);
    result.push({
      indicatorId,
      indicatorLabel: getIndicator(indicatorId)?.label ?? indicatorId,
      period,
      total,
      numberReporting: reporting.length,
      mean: reporting.length ? total / reporting.length : null,
    });
  }
  return result;
}

export interface PeriodChange {
  indicatorId: string;
  indicatorLabel: string;
  from: ReportingPeriod;
  to: ReportingPeriod;
  fromValue: number;
  toValue: number;
  percentChange: number | null; // null when fromValue is 0 (undefined growth)
}

// Period-over-period change for one grantee (the innovator progress story),
// or for the whole portfolio if you pass aggregated totals as a grantee.
export function periodChangeForGrantee(
  records: StandardizedRecord[],
  grantee: string,
  from: ReportingPeriod,
  to: ReportingPeriod
): PeriodChange[] {
  const pick = (period: ReportingPeriod) =>
    new Map(
      records
        .filter(
          (r) =>
            r.grantee === grantee &&
            r.period === period &&
            r.applies &&
            typeof r.value === "number"
        )
        .map((r) => [r.indicatorId, r.value as number])
    );

  const a = pick(from);
  const b = pick(to);
  const ids = new Set([...a.keys(), ...b.keys()]);

  const out: PeriodChange[] = [];
  for (const id of ids) {
    const fromValue = a.get(id) ?? 0;
    const toValue = b.get(id) ?? 0;
    out.push({
      indicatorId: id,
      indicatorLabel: getIndicator(id)?.label ?? id,
      from,
      to,
      fromValue,
      toValue,
      percentChange: fromValue === 0 ? null : ((toValue - fromValue) / fromValue) * 100,
    });
  }
  return out;
}

// Convenience: every grantee's value for one indicator at one period,
// side by side. This is the core funder "compare companies" table.
export function compareGrantees(
  records: StandardizedRecord[],
  indicatorId: string,
  period: ReportingPeriod
): { grantee: string; value: number | string | boolean | null; applies: boolean }[] {
  return records
    .filter((r) => r.indicatorId === indicatorId && r.period === period)
    .map((r) => ({ grantee: r.grantee, value: r.value, applies: r.applies }));
}
