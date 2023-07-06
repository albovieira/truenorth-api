import { PaymentRequiredError, BadRequestError } from '../../../exceptions';
import { cache, logger } from '../../../utils';
import { getLastTransaction, checkBalance } from '../../wallet/helpers';
import {
  parseFormula,
  getOperationsPerSymbol,
  getTotalCost,
  saveOperations,
} from '../helpers';

const create = async (data: { user: { id: number }; formula: string }) => {
  const { user, formula } = data;
  await cache.del(`balance:${user.id}`);

  const cacheKey = `formula_${formula}`;
  const cachedFormula = await cache.get(cacheKey);
  let executedOperations = [];
  let finalResult = null;

  if (cachedFormula) {
    logger.info('Getting formula from cache');
    const parsedFromCache = JSON.parse(cachedFormula) as any;
    executedOperations = parsedFromCache.executedOperations;
    finalResult = parsedFromCache.finalResult;
  } else {
    logger.info('Parsing formula');
    const parsedFromFormula = parseFormula(formula);
    executedOperations = parsedFromFormula.executedOperations;
    finalResult = parsedFromFormula.finalResult;

    logger.info('Saving formula to cache');
    await cache.set(
      cacheKey,
      JSON.stringify({
        executedOperations,
        finalResult,
      })
    );
  }

  if (!executedOperations || executedOperations.length === 0) {
    throw new BadRequestError('Invalid formula');
  }

  logger.info('Checking total cost');
  const operations = await getOperationsPerSymbol();
  const totalCost = getTotalCost(executedOperations, operations);

  logger.info('Checking balance');
  const hasSufficientFunds = await checkBalance({ user, cost: totalCost });
  if (!hasSufficientFunds) {
    throw new PaymentRequiredError('Insufficient funds');
  }

  logger.info('Saving operations');
  const lastTransaction = await getLastTransaction(user.id);
  const saved = await saveOperations({
    user,
    formula,
    finalResult,
    executedOperations,
    operations,
    totalCost,
    lastTransaction,
  });

  return {
    formula,
    result: finalResult,
    success: !!saved,
  };
};

export { create };
