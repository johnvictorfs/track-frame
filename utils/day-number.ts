/**
 * Returns how many calendar days `currentIso` is after `startIso`, plus 1.
 * Day 1 means the same calendar day as the start.
 * Uses local midnight normalisation so time-of-day doesn't affect the result.
 */
export function calendarDayNumber(startIso: string, currentIso: string): number {
  const start = new Date(startIso);
  start.setHours(0, 0, 0, 0);
  const current = new Date(currentIso);
  current.setHours(0, 0, 0, 0);
  return Math.round((current.getTime() - start.getTime()) / 86_400_000) + 1;
}
