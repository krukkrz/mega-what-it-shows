// The problems inside one merged ticket. A problem is a cause from causes.ts, except the reports the
// desk read as a one-day move (desk-notes.json): the date stays right and the day moves by one, so
// neither the parser nor the hint explains them. They count as their own problem, not as a footnote.
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
  const rest = merged.filter((r) => !oneDayMove.includes(r.id));
  const byCause = groupByCause(rest, tenantOf).map(({ cause, ...g }) => ({ ...g, problem: cause as Problem }));
  const shift = groupByCause(moved, () => undefined).map(({ cause, ...g }) => ({ ...g, problem: 'shift' as Problem }));
  return [...byCause, ...shift].sort((a, b) => b.reports.length - a.reports.length);
}
