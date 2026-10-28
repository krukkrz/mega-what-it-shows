// The problems inside one merged ticket: each cause from causes.ts, plus the reports the desk read as a
// one-day move (desk-notes.json). The date stays right and the day moves by one, so neither the parser
// nor the hint explains them: they are a problem of their own. Like readAs, they stay counted where
// their cause files them too, so the cause counts match the desk's own view (CauseTable).
import { groupByCause, uniqueById, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = CauseGroup['cause'] | 'shift';
export type ProblemGroup = Omit<CauseGroup, 'cause'> & { problem: Problem };

export function problemsOf(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  const byCause = groupByCause(merged, tenantOf).map(({ cause, ...g }) => ({ ...g, problem: cause as Problem }));
  const shift = groupByCause(moved, () => undefined).map(({ cause, ...g }) => ({ ...g, problem: 'shift' as Problem }));
  return [...byCause, ...shift].sort((a, b) => b.reports.length - a.reports.length);
}
