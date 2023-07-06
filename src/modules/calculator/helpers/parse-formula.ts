/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-restricted-syntax */
import { calculate } from './calculate';
import { sanitizeFormula } from './sanitize-formula';
import { allOperators, Operators } from '../enums';

const parseFormula = (formula: string) => {
  let { sanitizedFormula, operatorsInFormula, parsedFormula } =
    sanitizeFormula(formula) || ({} as any);

  if (!sanitizedFormula) {
    return {
      formula: sanitizedFormula,
      executedOperations: [],
      finalResult: 0,
    };
  }

  const executedOperations = operatorsInFormula.reduce(
    (acc: any, operator: any) => {
      acc[operator] = {
        count: 0,
        results: [],
      };
      return acc;
    },
    {}
  );

  const operatorsFN = {
    '√': (parsedFormula: string[]) =>
      calculate(Operators.SquareRoot, parsedFormula, executedOperations),
    '*': (parsedFormula: string[]) =>
      calculate(Operators.Multiply, parsedFormula, executedOperations),
    '/': (parsedFormula: string[]) =>
      calculate(Operators.Divide, parsedFormula, executedOperations),
    '-': (parsedFormula: string[]) =>
      calculate(Operators.Subtract, parsedFormula, executedOperations),
    '+': (parsedFormula: string[]) =>
      calculate(Operators.Add, parsedFormula, executedOperations),
  } as any;

  for (const operator of allOperators) {
    if (operatorsInFormula.includes(operator)) {
      parsedFormula = operatorsFN[operator](parsedFormula);
    }
  }

  const sortedArr = Object.values(executedOperations).sort(
    (a: any, b: any) => a.order - b.order
  );

  return {
    formula: sanitizedFormula,
    executedOperations: sortedArr,
    finalResult: Number(parsedFormula[0]),
  };
};

export { parseFormula };
