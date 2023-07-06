const getTotalCost = (executedOperations: any, operations: any) => {
  return executedOperations.reduce((acc: any, executedOperation: any) => {
    if (!operations[executedOperation.key]) return acc;

    const operationCost = operations[executedOperation.key]!.cost;
    acc += executedOperation.count * operationCost;
    return acc;
  }, 0) as number;
};

export { getTotalCost };
