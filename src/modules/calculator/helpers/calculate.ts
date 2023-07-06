import { Operators, OperatorSymbols } from '../enums';

const calcOrder: Record<Operators, number> = {
  [Operators.SquareRoot]: 1,
  [Operators.Multiply]: 2,
  [Operators.Divide]: 3,
  [Operators.Subtract]: 4,
  [Operators.Add]: 5,
};

const calc = {
  [Operators.Add]: (a: number, b: number) => a + b,
  [Operators.Subtract]: (a: number, b: number) => a - b,
  [Operators.Multiply]: (a: number, b: number) => a * b,
  [Operators.Divide]: (a: number, b: number) => a / b,
  [Operators.SquareRoot]: (a: number) => Math.sqrt(a),
};

const calculate = (
  operator: OperatorSymbols,
  parsedFormula: string[],
  executedOperations: any[]
): string[] => {
  const index = parsedFormula.indexOf(operator);
  if (index === -1) return parsedFormula;

  const left = parsedFormula[index - 1];
  const right = parsedFormula[index + 1];

  let result = null;
  let calculationString = '';
  if (operator === Operators.SquareRoot) {
    result = calc[operator](Number(right));
    parsedFormula.splice(index, 2, result.toString());
    calculationString = `${operator}${right}`;
  } else if (operator === Operators.Subtract && index === 0) {
    parsedFormula.splice(index, 2, `-${right}`);
    calculationString = `${operator}${right}`;
  } else {
    result = calc[operator](Number(left), Number(right));
    parsedFormula.splice(index - 1, 3, result.toString());
    calculationString = `${left}${operator}${right}`;
  }

  executedOperations[operator as any].key = operator;
  executedOperations[operator as any].count += 1;
  executedOperations[operator as any].order = calcOrder[operator];
  executedOperations[operator as any].results.push({
    calculation: calculationString,
    result,
  });

  return calculate(operator, parsedFormula, executedOperations);
};

export { calculate };
