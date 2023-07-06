/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { prisma, cryptoUtils } from '../../../utils';

const saveOperations = async ({
  user,
  formula,
  finalResult,
  executedOperations,
  operations,
  totalCost,
  lastTransaction,
}: any): Promise<boolean> => {
  await prisma.$transaction(
    async (prismaTrx) => {
      const formulaSaved = await prismaTrx.formula.create({
        data: {
          data: formula,
          result: String(finalResult!),
        },
      });

      for (const executedOperation of executedOperations) {
        const { key, results } = executedOperation as any;
        const operation = operations[key]!;

        await prismaTrx.record.createMany({
          skipDuplicates: true,
          data: results.map(({ result, calculation }: any) => {
            return {
              formula_id: formulaSaved.id,
              user_id: user.id,
              amount: 1,
              operation_request: String(calculation),
              operation_response: String(result),
              operation_id: operation.id,
            };
          }),
        });
      }

      const currentTransaction = {
        type: 'debit',
        user_id: user!.id,
        value: totalCost,
      };
      await prismaTrx.wallet.create({
        data: {
          ...currentTransaction,
          hash: cryptoUtils.encryptObject(
            lastTransaction.hash,
            currentTransaction || {}
          ),
        },
      });
    },
    {
      timeout: 60000,
    }
  );

  return true;
};

export { saveOperations };
