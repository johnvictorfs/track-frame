import { describe, expect, it } from 'vitest';
import { calendarDayNumber } from '../day-number';

// Tests run with TZ=UTC (see package.json) so setHours(0,0,0,0) equals
// setUTCHours(0,0,0,0). All timestamps use a safe hour (T12:00Z) so they
// unambiguously fall on the same UTC calendar date in any timezone.
// January 2025 is used to avoid leap-year edge cases.

describe('calendarDayNumber', () => {
  it('returns Day 1 when both timestamps are on the same calendar day', () => {
    expect(calendarDayNumber('2025-01-15T08:00:00.000Z', '2025-01-15T20:00:00.000Z')).toBe(1);
  });

  it('returns Day 2 for the next calendar day', () => {
    expect(calendarDayNumber('2025-01-15T12:00:00.000Z', '2025-01-16T12:00:00.000Z')).toBe(2);
  });

  it('returns Day 3 two calendar days after start', () => {
    expect(calendarDayNumber('2025-01-15T12:00:00.000Z', '2025-01-17T12:00:00.000Z')).toBe(3);
  });

  it('returns Day 8 one week after start', () => {
    expect(calendarDayNumber('2025-01-01T12:00:00.000Z', '2025-01-08T12:00:00.000Z')).toBe(8);
  });

  it('treats late-night start and early-morning of the next day as Day 2', () => {
    // 23:00 on Jan 15 and 01:00 on Jan 16 — only 2 hours apart but different calendar days
    expect(calendarDayNumber('2025-01-15T23:00:00.000Z', '2025-01-16T01:00:00.000Z')).toBe(2);
  });

  it('treats early-morning and late-night of the same calendar day as Day 1', () => {
    expect(calendarDayNumber('2025-01-15T01:00:00.000Z', '2025-01-15T23:00:00.000Z')).toBe(1);
  });
});
