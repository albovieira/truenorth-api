import { cryptoUtils, prisma, cache, logger } from '../../../utils';
import { calculateBalance, getLastTransaction } from '../helpers';

const addBalance = async (data: any) => {
  const { user, credits } = data;

  logger.info('Deleting balance cache');
  await cache.del(`balance:${user.id}`);

  const lastTransaction = await getLastTransaction(user!.id);
  await prisma.wallet.create({
    data: {
      type: 'credit',
      value: Number(credits),
      user_id: user!.id,
      hash: cryptoUtils.encryptObject(
        lastTransaction?.hash!,
        lastTransaction! || {}
      ),
    },
  });

  logger.info('Calculating balance');
  const balance = await calculateBalance(user!.id);

  await cache.set(`balance:${user.id}`, balance);

  return {
    balance,
  };
};

export { addBalance };
