import { expect, describe, it } from '@jest/globals';

import { calculate } from '../calculate';

describe('calculate', () => {
  it('should perform addition operation', () => {
    const operator = '+';
    const parsedFormula = ['2', '+', '3'];
    const executedOperations = {
      '+': { key: '', count: 0, order: 0, results: [] },
    };

    const result = calculate(
      operator as any,
      parsedFormula,
      executedOperations as never
    );

    expect(result).toEqual(['5']);
    expect(executedOperations['+']).toEqual({
      key: '+',
      count: 1,
      order: 5,
      results: [{ result: 5, calculation: '2+3' }],
    });
  });

  it('should perform subtraction operation', () => {
    const operator = '-';
    const parsedFormula = ['5', '-', '3'];
    const executedOperations = {
      '-': { key: '', count: 0, order: 0, results: [] },
    };

    const result = calculate(
      operator as any,
      parsedFormula,
      executedOperations as never
    );

    expect(result).toEqual(['2']);
    expect(executedOperations['-']).toEqual({
      key: '-',
      count: 1,
      order: 4,
      results: [{ result: 2, calculation: '5-3' }],
    });
  });

  it('should perform multiplication operation', () => {
    const operator = '*';
    const parsedFormula = ['2', '*', '3'];
    const executedOperations = {
      '*': { key: '', count: 0, order: 0, results: [] },
    };

    const result = calculate(
      operator as any,
      parsedFormula,
      executedOperations as never
    );

    expect(result).toEqual(['6']);
    expect(executedOperations['*']).toEqual({
      key: '*',
      count: 1,
      order: 2,
      results: [{ result: 6, calculation: '2*3' }],
    });
  });

  it('should perform division operation', () => {
    const operator = '/';
    const parsedFormula = ['6', '/', '2'];
    const executedOperations = {
      '/': { key: '', count: 0, order: 0, results: [] },
    };

    const result = calculate(
      operator as any,
      parsedFormula,
      executedOperations as never
    );

    expect(result).toEqual(['3']);
    expect(executedOperations['/']).toEqual({
      key: '/',
      count: 1,
      order: 3,
      results: [{ result: 3, calculation: '6/2' }],
    });
  });

  it('should perform square root operation', () => {
    const operator = '√';
    const parsedFormula = ['√', '4'];
    const executedOperations = {
      '√': { key: '', count: 0, order: 0, results: [] },
    };

    const result = calculate(
      operator as any,
      parsedFormula,
      executedOperations as never
    );

    expect(result).toEqual(['2']);
    expect(executedOperations['√']).toEqual({
      key: '√',
      count: 1,
      order: 1,
      results: [{ result: 2, calculation: '√4' }],
    });
  });

  it('should handle no operations to calculate', () => {
    const operator = '+';
    const parsedFormula = ['2'];
    const executedOperations = {
      '+': { key: '', count: 0, order: 0, results: [] },
    };

    const result = calculate(
      operator as any,
      parsedFormula,
      executedOperations as never
    );

    expect(result).toEqual(['2']);
    expect(executedOperations['+']).toEqual({
      key: '',
      count: 0,
      order: 0,
      results: [],
    });
  });

  it('should calculate a complex formula', () => {
    const parsedFormula = ['2', '+', '3', '*', '4', '/', '2', '-', '√', '9'];

    const executedOperations = {
      '*': { key: '', count: 0, order: 0, results: [] },
      '/': { key: '', count: 0, order: 0, results: [] },
      '√': { key: '', count: 0, order: 0, results: [] },
      '-': { key: '', count: 0, order: 0, results: [] },
      '+': { key: '', count: 0, order: 0, results: [] },
    };

    for (const operator of Object.keys(executedOperations)) {
      calculate(operator as any, parsedFormula, executedOperations as never);
    }

    expect(parsedFormula).toEqual(['5']);
    expect(executedOperations['√']).toEqual({
      key: '√',
      count: 1,
      order: 1,
      results: [{ result: 3, calculation: '√9' }],
    });
    expect(executedOperations['*']).toEqual({
      key: '*',
      count: 1,
      order: 2,
      results: [{ result: 12, calculation: '3*4' }],
    });
    expect(executedOperations['/']).toEqual({
      key: '/',
      count: 1,
      order: 3,
      results: [{ result: 6, calculation: '12/2' }],
    });
    expect(executedOperations['-']).toEqual({
      key: '-',
      count: 1,
      order: 4,
      results: [{ result: 3, calculation: '6-3' }],
    });
    expect(executedOperations['+']).toEqual({
      key: '+',
      count: 1,
      order: 5,
      results: [{ result: 5, calculation: '2+3' }],
    });
  });
});
