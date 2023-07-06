import { prisma } from '../../../utils';

const calculateBalance = async (userId: number) => {
  const transactions = await prisma.wallet.findMany({
    where: {
      user: {
        id: userId,
      },
    },
    select: {
      type: true,
      value: true,
    },
  });
  const balance = transactions.reduce((acc, item) => {
    acc = item.type === 'credit' ? acc + item.value : acc - item.value;
    return acc;
  }, 0);

  return balance;
};

export { calculateBalance };
