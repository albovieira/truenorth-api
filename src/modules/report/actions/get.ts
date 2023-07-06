/* eslint-disable no-underscore-dangle */
import { prisma } from '../../../utils';

const get = async (user: any) => {
  const userId = Number(user.id);
  const totalRecords = await prisma.record.count({
    where: { user: { id: userId } },
  });
  const [totalSpent, totalCreditsAdded] = await Promise.all(
    ['debit', 'credit'].map((type) =>
      prisma.wallet.aggregate({
        _sum: {
          value: true,
        },
        where: {
          type,
          user: {
            id: userId,
          },
        },
      })
    )
  );

  const operations = await prisma.record.groupBy({
    by: ['operation_id'],
    _count: {
      _all: true,
    },
    where: {
      user: {
        id: userId,
      },
    },
  });
  const operationIds = operations.map((result) => result.operation_id);
  const operationData = await prisma.operation.findMany({
    where: { id: { in: operationIds } },
    select: { id: true, name: true },
  });

  const operationsWithNames = operations.map((result) => {
    const operation = operationData.find((op) => op.id === result.operation_id);
    return {
      operation_id: result.operation_id,
      _count: result._count._all,
      operation: operation ? operation.name : null,
    };
  });

  return {
    totalRecords,
    spent: totalSpent!._sum.value,
    creditsAdded: totalCreditsAdded!._sum.value,
    operations: operationsWithNames,
  };
};

export { get };
