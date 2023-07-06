import { jest, expect, describe, it, afterEach } from '@jest/globals';

import prisma from '../../../../utils/database/prisma';
import { getLastTransaction } from '../get-last-transaction';

jest.mock('../../../../utils/database/prisma', () => {
  return {
    wallet: {
      findFirst: jest.fn(),
    },
  };
});

describe('getLastTransaction', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the last transaction for the user', async () => {
    const userId = 1;
    const lastTransaction = {
      id: 1,
      type: 'credit',
      hash: 'transaction_hash',
      value: 100,
      user_id: userId,
    };

    (prisma.wallet.findFirst as jest.Mock).mockResolvedValueOnce(
      lastTransaction as never
    );

    const result = await getLastTransaction(userId);

    expect(prisma.wallet.findFirst).toHaveBeenCalledWith({
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

    expect(result).toEqual(lastTransaction);
  });

  it('should return null if no transaction is found for the user', async () => {
    const userId = 1;

    (prisma.wallet.findFirst as jest.Mock).mockResolvedValueOnce(null as never);

    const result = await getLastTransaction(userId);

    expect(prisma.wallet.findFirst).toHaveBeenCalledWith({
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

    expect(result).toBeNull();
  });
});
