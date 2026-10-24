import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { mergeIntervals, type Interval } from '../src/intervals';

// Recitation Part 2 (groups) and problem set Task 2.
// Read the spec in src/intervals/mergeIntervals.ts, then check your progress
// with `npm run mutants:intervals`.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The output is sorted.
// (invariant, algebraic, metamorphic, differential, or conditional)

// A first attempt at a generator. It has a problem: run the tests and read 
// the counterexample
const interval: fc.Arbitrary<Interval> = 
  fc.tuple(fc.integer(), fc.integer()).map(([a, b]) => (a <= b ? [a,b] : [b,a]));
const intervalList = fc.array(interval);

const alreadyDisjointIntervals = fc
  .tuple(fc.integer({ min: -1_000_000, max: 1_000_000 }),
    fc.array(fc.integer({ min: 0, max: 10 }), { minLength: 2, maxLength: 10 }))
  .map(([firstStart, lengths]) => {
    let start = firstStart;
    return lengths.map((length): Interval => {
      const current: Interval = [start, start + length];
      start = current[1] + 1;
      return current;
    });
  });

const overlappingIntervals = fc
  .integer({ min: -1_000_000, max: 1_000_000 })
  .map((start): Interval[] => [[start, start + 1], [start, start + 2]]);

const touchingIntervals = fc
  .integer({ min: -1_000_000, max: 1_000_000 })
  .map((start): Interval[] => [[start, start + 2], [start + 2, start + 4]]);

describe('mergeIntervals', () => {
  // Pattern: invariant. Every input interval lies inside some output interval.
  it('every input interval lies inside some output interval', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        const uncovered = xs.filter(([s, e]) => !out.some(([a, b]) => a <= s && e <= b));
        expect(uncovered).toEqual([]);
      }),
    );
  });

  // Add your properties here. Aim for at least one of each pattern:
  // invariant, algebraic, metamorphic, differential, conditional.

  // Pattern: conditional. Inputs with a real gap between each interval stay unchanged.
  it('leaves already-disjoint input unchanged', () => {
    fc.assert(
      fc.property(alreadyDisjointIntervals, xs => {
        expect(mergeIntervals(xs)).toEqual(xs);
      }),
    );
  });

  // Pattern: invariant. Intervals that meet at an endpoint merge into one interval.
  it('merges intervals that touch', () => {
    fc.assert(
      fc.property(touchingIntervals, xs => {
        expect(mergeIntervals(xs)).toEqual([[xs[0][0], xs[1][1]]]);
      }),
    );
  });

  // Pattern: invariant. The function never modifies its input intervals.
  it('does not mutate overlapping input intervals', () => {
    fc.assert(
      fc.property(overlappingIntervals, xs => {
        const before = xs.map(([start, end]): Interval => [start, end]);
        mergeIntervals(xs);
        expect(xs).toEqual(before);
      }),
    );
  });

  // Pattern: algebraic. Merging an already merged result leaves it unchanged.
  it('is idempotent', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const once = mergeIntervals(xs);
        expect(mergeIntervals(once)).toEqual(once);
      }),
    );
  });

  // Pattern: metamorphic. Reversing the input order does not change the result.
  it('is independent of input order', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        expect(mergeIntervals([...xs].reverse())).toEqual(mergeIntervals(xs));
      }),
    );
  });

  // Pattern: differential. Input and output lists cover the same points.
  it('preserves point coverage in both directions', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        const endpoints = [...xs, ...out].flatMap(([start, end]) => [start, end]);
        const sorted = [...new Set(endpoints)].sort((a, b) => a - b);
        const points = [
          ...sorted,
          ...sorted.slice(1).map((end, i) => (sorted[i] + end) / 2),
        ];
        const covered = (intervals: readonly Interval[], point: number) =>
          intervals.some(([start, end]) => start <= point && point <= end);

        for (const point of points) {
          expect(covered(out, point)).toBe(covered(xs, point));
        }
      }),
    );
  });
});
