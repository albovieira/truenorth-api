import { prisma } from '../../../utils';

const getLastTransaction = async (userId: number) => {
  const lastTransaction = await prisma.wallet.findFirst({
    where: {
      user: {
        id: userId,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      type: true,
      hash: true,
      value: true,
      user_id: true,
    },
  });

  return lastTransaction;
};

export { getLastTransaction };
