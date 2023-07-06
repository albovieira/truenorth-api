import { prisma } from '../../../utils';

const getOperationsPerSymbol = async (): Promise<
  { id: number; symbol: string; type: string; cost: number }[]
> => {
  const operations = (
    await prisma.operation.findMany({
      select: {
        id: true,
        symbol: true,
        type: true,
        cost: true,
      },
    })
  ).reduce((acc: any, operation: any) => {
    acc[operation.symbol] = operation;
    return acc;
  }, {});
  return operations;
};

export { getOperationsPerSymbol };
