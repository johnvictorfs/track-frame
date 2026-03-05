import { describe, expect, it } from 'vitest';
import { formatShortDate } from '../format-date';

// Tests run with TZ=UTC (see package.json) so toLocaleDateString reflects the
// UTC calendar date. Timestamps use T12:00Z to sit safely within the UTC day.

describe('formatShortDate', () => {
  it('formats a mid-month date as "Mon D, YYYY"', () => {
    expect(formatShortDate('2025-01-15T12:00:00.000Z')).toBe('Jan 15, 2025');
  });

  it('formats single-digit days without zero padding', () => {
    expect(formatShortDate('2025-03-01T12:00:00.000Z')).toBe('Mar 1, 2025');
  });

  it('formats the last day of a year correctly', () => {
    expect(formatShortDate('2025-12-31T12:00:00.000Z')).toBe('Dec 31, 2025');
  });

  it('returns the same result for two timestamps on the same calendar day', () => {
    const morning = formatShortDate('2025-06-15T06:00:00.000Z');
    const afternoon = formatShortDate('2025-06-15T18:00:00.000Z');
    expect(morning).toBe(afternoon);
  });
});
