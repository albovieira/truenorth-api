/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
import { allOperators, Operators } from '../enums';

const sanitizeFormula = (formula: string): any => {
  const sanitizedFormula = formula
    .replace(/[^0-9+\-*√/]/g, '')
    .replace(/\s/g, '');
  const parsedFormula = sanitizedFormula
    .split(/([+\-*√/])/g)
    .filter((item) => item !== '');

  if (parsedFormula.length === 0) {
    return null;
  }

  const operatorRegex = /[+\-*/√]/g;
  const operatorsInFormula = sanitizedFormula.match(operatorRegex) as string[];
  if ((operatorsInFormula || []).length === 0) {
    return null;
  }

  for (let i = 0; i < formula.length; i++) {
    const char = formula[i]!;
    const nextChar = formula[i + 1]!;

    if (nextChar === Operators.SquareRoot) {
      const nestedChar = formula[i + 2]!;
      if (!nestedChar || allOperators.includes(nestedChar as any)) {
        return null;
      }
      continue;
    }
    if (
      allOperators.includes(char as any) &&
      allOperators.includes(nextChar as any)
    ) {
      return null;
    }
  }

  const lastChar = parsedFormula[parsedFormula.length - 1];
  if (allOperators.includes(lastChar! as any)) {
    return null;
  }

  return {
    sanitizedFormula,
    parsedFormula,
    operatorsInFormula,
  };
};

export { sanitizeFormula };
