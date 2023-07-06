import { expect, describe, it } from '@jest/globals';

import { parseFormula } from '..';

describe('parseFormula', () => {
  it('should parse a valid formula correctly', async () => {
    const formula = '4 + 2 * 3 / √16';

    const result = parseFormula(formula) as any;

    expect(result.formula).toBe('4+2*3/√16');
    expect(result.executedOperations).toEqual([
      {
        key: '√',
        count: 1,
        order: 1,
        results: [{ result: 4, calculation: '√16' }],
      },
      {
        key: '*',
        count: 1,
        order: 2,
        results: [{ result: 6, calculation: '2*3' }],
      },
      {
        key: '/',
        count: 1,
        order: 3,
        results: [{ result: 1.5, calculation: '6/4' }],
      },
      {
        key: '+',
        count: 1,
        order: 5,
        results: [{ result: 5.5, calculation: '4+1.5' }],
      },
    ]);
    expect(result.finalResult).toBe(5.5);
  });

  it('should handle an empty formula', () => {
    const formula = '';

    const result = parseFormula(formula) as any;

    expect(result.executedOperations).toEqual([]);
  });

  it('should handle with aformula with no operators', async () => {
    const formula = '1234';

    const result = parseFormula(formula) as any;

    expect(result.executedOperations).toEqual([]);
  });

  it('should handle with a formula with only spaces', async () => {
    const formula = '    ';

    const result = parseFormula(formula) as any;

    expect(result.executedOperations).toEqual([]);
  });

  it('should handle with a formula with only operators', async () => {
    const formula = '1+1+';

    const result = parseFormula(formula) as any;

    expect(result.executedOperations).toEqual([]);
  });

  it('should handle a formula with a negative number in the begining', async () => {
    const formula = '-1+1';

    const result = parseFormula(formula);

    expect(result.formula).toBe(formula);
    expect(result.finalResult).toBe(0);
  });

  it('should handle with a formula with only operators', async () => {
    const formula = '1++++1';

    const result = parseFormula(formula) as any;

    expect(result.executedOperations).toEqual([]);
  });
});
