import { cryptoUtils, prisma } from '../../../utils';

const saveOperations = async ({
  user,
  randomString,
  operation,
  lastTransaction,
}: any): Promise<boolean> => {
  await prisma.$transaction(async (prismaTrx: any) => {
    await prismaTrx.record.create({
      data: {
        amount: 1,
        operation_response: randomString,
        operation_id: operation!.id,
        user_id: user!.id,
      },
      select: {
        user: true,
      },
    });

    const currentTransaction = {
      type: 'debit',
      user_id: user!.id,
      value: operation!.cost,
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
  });
  return true;
};

export { saveOperations };
