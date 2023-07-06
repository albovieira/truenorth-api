/* eslint-disable @typescript-eslint/no-shadow */
import { jest, afterEach, expect, describe, it } from '@jest/globals';

import * as cryptoUtils from '../../../../utils/crypto';
import prisma from '../../../../utils/database/prisma';
import { saveOperations } from '../save-operation';

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
  const randomString = 'abcde';
  const operation = { id: 1, cost: 10 };
  const lastTransaction = { hash: 'last_transaction_hash' };
  const prismaTrxMock = {
    record: {
      create: jest.fn(),
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

        expect(prismaTrxMock.record.create).toHaveBeenCalledWith({
          data: {
            amount: 1,
            operation_response: randomString,
            operation_id: operation.id,
            user_id: user.id,
          },
          select: {
            user: true,
          },
        });

        expect(prismaTrxMock.wallet.create).toHaveBeenCalledWith({
          data: {
            type: 'debit',
            user_id: user.id,
            value: operation.cost,
            hash: mockedHash,
          },
        });
      }
    );

    const result = await saveOperations({
      user,
      randomString,
      operation,
      lastTransaction,
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
        randomString,
        operation,
        lastTransaction,
      })
    ).rejects.toThrowError('Transaction timeout');

    expect(prismaTrxMock.wallet.create).not.toHaveBeenCalled();
    expect(prismaTrxMock.record.create).not.toHaveBeenCalled();
  });
});
