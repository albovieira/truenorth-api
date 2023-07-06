import { jest, expect, describe, it, afterEach } from '@jest/globals';

import prisma from '../../../../utils/database/prisma';
import { calculateBalance } from '../calculate-balance';

jest.mock('../../../../utils/database/prisma', () => {
  return {
    wallet: {
      findMany: jest.fn(),
    },
  };
});

describe('calculateBalance', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate the balance correctly', async () => {
    const userId = 1;
    const transactions = [
      { type: 'credit', value: 100 },
      { type: 'debit', value: 50 },
      { type: 'debit', value: 25 },
      { type: 'credit', value: 75 },
    ];

    (prisma.wallet.findMany as jest.Mock).mockResolvedValueOnce(
      transactions as never
    );

    const result = await calculateBalance(userId);

    expect(prisma.wallet.findMany).toHaveBeenCalledWith({
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

    expect(result).toBe(100);
  });

  it('should return 0 if there are no transactions', async () => {
    const userId = 1;
    const transactions = [] as never;

    (prisma.wallet.findMany as jest.Mock).mockResolvedValueOnce(transactions);

    const result = await calculateBalance(userId);

    expect(prisma.wallet.findMany).toHaveBeenCalledWith({
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

    expect(result).toBe(0);
  });
});
