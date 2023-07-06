import { expect, describe, it } from '@jest/globals';

import { sanitizeFormula } from '../sanitize-formula';

describe('sanitizeFormula', () => {
  it('should sanitize and parse a valid formula', () => {
    const formula = '2 + 3 * √4';

    const result = sanitizeFormula(formula);

    expect(result).toEqual({
      sanitizedFormula: '2+3*√4',
      parsedFormula: ['2', '+', '3', '*', '√', '4'],
      operatorsInFormula: ['+', '*', '√'],
    });
  });

  it('should return null for an empty formula', () => {
    const formula = '';

    const result = sanitizeFormula(formula);

    expect(result).toBeNull();
  });

  it('should return null for a formula with no operators', () => {
    const formula = '12345';

    const result = sanitizeFormula(formula);

    expect(result).toBeNull();
  });

  it('should return null for a formula with consecutive operators', () => {
    const formula = '1++2';

    const result = sanitizeFormula(formula);

    expect(result).toBeNull();
  });

  it('should return null for a formula ending with an operator', () => {
    const formula = '2 + 3 *';

    const result = sanitizeFormula(formula);

    expect(result).toBeNull();
  });

  it('should ignore whitespace and sanitize the formula', () => {
    const formula = ' 1 + 2 * 3 / √4 ';

    const result = sanitizeFormula(formula);

    expect(result).toEqual({
      sanitizedFormula: '1+2*3/√4',
      parsedFormula: ['1', '+', '2', '*', '3', '/', '√', '4'],
      operatorsInFormula: ['+', '*', '/', '√'],
    });
  });
});
