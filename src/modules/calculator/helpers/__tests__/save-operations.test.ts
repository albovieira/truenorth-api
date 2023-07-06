import { jest, afterEach, expect, describe, it } from '@jest/globals';

import * as cryptoUtils from '../../../../utils/crypto';
import prisma from '../../../../utils/database/prisma';
import { saveOperations } from '../save-operations';

jest.mock('../../../../utils/database/prisma', () => {
  return {
    $transaction: jest.fn(),
  };
});

jest.mock('../../../../utils/crypto', () => {
  return {
    encryptObject: jest.fn(),
  };
});

describe('saveOperations', () => {
  const user = { id: 1 };
  const formula = '2 + 3';
  const finalResult = 5;
  const executedOperations = [{ key: '+', results: [{ result: 5, calculation: '2+3' }] }];
  const operations = { '+': { id: 1, cost: 10 } };
  const totalCost = 10;

  const prismaTrxMock = {
    formula: {
      create: jest.fn().mockResolvedValue({ id: 1 } as never),
    },
    record: {
      createMany: jest.fn(),
    },
    wallet: {
      create: jest.fn(),
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save operations', async () => {
    const mockedHash = 'mocked_hash';
    (cryptoUtils.encryptObject as jest.Mock).mockReturnValue(mockedHash);

    (prisma.$transaction as jest.Mock).mockImplementationOnce(
      async (callback: any) => {
        await callback(prismaTrxMock);

        expect(prismaTrxMock.formula.create).toHaveBeenCalledWith({
          data: {
            data: formula,
            result: String(finalResult),
          },
        });

        expect(prismaTrxMock.record.createMany).toHaveBeenCalledWith({
          skipDuplicates: true,
          data: [
            {
              formula_id: expect.any(Number),
              user_id: user.id,
              amount: 1,
              operation_request: '2+3',
              operation_response: '5',
              operation_id: 1,
            },
          ],
        });

        expect(prismaTrxMock.wallet.create).toHaveBeenCalledWith({
          data: {
            type: 'debit',
            value: totalCost,
            user_id: user.id,
            hash: mockedHash,
          },
        });
      }
    );

    const result = await saveOperations({
      user,
      formula,
      finalResult,
      executedOperations,
      operations,
      totalCost,
      lastTransaction: { hash: 'last_transaction_hash' },
    });

    expect(result).toBe(true);
  });

  it('should handle transaction timeout', async () => {
    const lastTransaction = { hash: 'last_transaction_hash' } as any;
    jest.useFakeTimers();

    (prisma.$transaction as jest.Mock).mockImplementationOnce(async () => {
      throw new Error('Transaction timeout');
    });

    await expect(
      saveOperations({
        user,
        formula,
        finalResult,
        executedOperations,
        operations,
        totalCost,
        lastTransaction,
      })
    ).rejects.toThrowError('Transaction timeout');

    expect(prismaTrxMock.formula.create).not.toHaveBeenCalled();
    expect(prismaTrxMock.record.createMany).not.toHaveBeenCalled();
    expect(prismaTrxMock.wallet.create).not.toHaveBeenCalled();
  });
});
