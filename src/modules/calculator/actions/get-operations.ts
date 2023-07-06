import { prisma } from '../../../utils';

const getOperations = async () => {
  const operations = await prisma.operation.findMany({
    select: {
      id: true,
      type: true,
      name: true,
      symbol: true,
      cost: true,
    },
  });

  return {
    count: operations.length,
    data: operations,
  };
};

export { getOperations };
