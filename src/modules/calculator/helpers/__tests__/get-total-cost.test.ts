import { expect, describe, it } from '@jest/globals';

import { getTotalCost } from '..';

describe('getTotalCost', () => {
  it('should calculate the total cost correctly', () => {
    const executedOperations = [
      { key: '+', count: 2 },
      { key: '*', count: 3 },
      { key: '-', count: 1 },
    ];
    const operations = {
      '+': { cost: 2 },
      '*': { cost: 5 },
      '-': { cost: 1 },
    };

    const result = getTotalCost(executedOperations, operations);

    expect(result).toBe(2 * 2 + 3 * 5 + 1 * 1);
  });

  it('should return 0 if executedOperations is empty', () => {
    const executedOperations: any[] = [];
    const operations = {
      '+': { cost: 2 },
      '*': { cost: 5 },
      '-': { cost: 1 },
    };

    const result = getTotalCost(executedOperations, operations);

    expect(result).toBe(0);
  });

  it('should return 0 if operations is empty', () => {
    const executedOperations = [
      { key: '+', count: 2 },
      { key: '*', count: 3 },
      { key: '-', count: 1 },
    ];
    const operations: any = {};

    const result = getTotalCost(executedOperations, operations);

    expect(result).toBe(0);
  });
});
