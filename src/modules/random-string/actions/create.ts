import { PaymentRequiredError } from '../../../exceptions';
import { prisma, logger, cache } from '../../../utils';
import { getLastTransaction, checkBalance } from '../../wallet/helpers';
import { saveOperations } from '../helpers';
import { generateRandomString } from '../helpers/generate-random-string';

const create = async ({ user, length }: any) => {
  await cache.del(`balance:${user.id}`);

  const operation = await prisma.operation.findUnique({
    where: {
      symbol: 'rand',
    },
    select: {
      id: true,
      cost: true,
    },
  });

  logger.info('Checking balance');
  const hasSufficientFunds = await checkBalance({
    user,
    cost: operation!.cost,
  });
  if (!hasSufficientFunds) {
    throw new PaymentRequiredError('Insuficient funds');
  }

  logger.info('Generating random string');
  const [randomString] = await generateRandomString(length);

  logger.info('Saving operations');
  const lastTransaction = await getLastTransaction(user!.id);
  const saved = await saveOperations({
    user,
    randomString,
    operation,
    lastTransaction,
  });

  return {
    result: randomString,
    success: !!saved,
  };
};

export { create };
