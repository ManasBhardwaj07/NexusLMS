import { describe, it, expect } from 'vitest';
import { isMinor } from './service.js';

describe('isMinor calendar age math (DPDP compliance)', () => {
  it('born exactly 18 years ago today -> adult (isMinor returns false, fixing 365.25 division bug)', () => {
    // Reference date: 2026-10-04
    const today = new Date('2026-10-04T12:00:00.000Z');
    const dobExact18 = new Date('2008-10-04T00:00:00.000Z');

    // With old formula: (Date.now() - dob) / (365.25 * 86400000) was ~17.9986 (< 18), wrongly flagging them as minor!
    // Calendar math: today is their 18th birthday, so they are an adult.
    expect(isMinor(dobExact18, today)).toBe(false);
  });

  it('born 18 years minus 1 day (tomorrow is 18th birthday) -> minor (isMinor returns true)', () => {
    const today = new Date('2026-10-04T12:00:00.000Z');
    const dobTomorrow18 = new Date('2008-10-05T00:00:00.000Z');

    expect(isMinor(dobTomorrow18, today)).toBe(true);
  });

  it('leap year case: born 2000-02-29 evaluated on 2018-02-28 -> adult (isMinor returns false)', () => {
    // 2018 is a non-leap year. Person born on Feb 29 reaches majority on Feb 28 of their 18th year.
    const dobLeap = new Date('2000-02-29T00:00:00.000Z');
    const onEighteenth = new Date('2018-02-28T00:00:00.000Z');

    expect(isMinor(dobLeap, onEighteenth)).toBe(false);
  });

  it('leap year case: born 2000-02-29 evaluated on 2018-02-27 -> minor (isMinor returns true)', () => {
    // Day before majority for Feb 29 birth in non-leap year
    const dobLeap = new Date('2000-02-29T00:00:00.000Z');
    const dayBefore = new Date('2018-02-27T23:59:59.000Z');

    expect(isMinor(dobLeap, dayBefore)).toBe(true);
  });
});
