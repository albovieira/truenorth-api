enum Operators {
  Add = '+',
  Subtract = '-',
  Multiply = '*',
  Divide = '/',
  SquareRoot = '√',
}

type OperatorSymbols =
  | Operators.Add
  | Operators.Subtract
  | Operators.Multiply
  | Operators.Divide
  | Operators.SquareRoot;

/** Must keep this order */
const allOperators = [
  Operators.SquareRoot,
  Operators.Multiply,
  Operators.Divide,
  Operators.Subtract,
  Operators.Add,
];

export { Operators, OperatorSymbols, allOperators };
