import { cache, logger } from '../../../utils';
import { calculateBalance } from '../helpers';

const getBalance = async (data: any) => {
  const { user } = data;
  const cachedBalance = await cache.get(`balance:${user.id}`);
  if (cachedBalance) {
    logger.info('Getting balance from cache');
    return {
      balance: Number(cachedBalance),
    };
  }

  logger.info('Calculating balance');
  const balance = await calculateBalance(user.id);

  await cache.set(`balance:${user.id}`, balance);

  return {
    balance,
  };
};

export { getBalance };
