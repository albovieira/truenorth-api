import { jest, expect, describe, it, afterEach } from '@jest/globals';

import * as cryptoUtils from '../../../../utils/crypto';
import * as cache from '../../../../utils/database/cache';
import prisma from '../../../../utils/database/prisma';
import { calculateBalance, getLastTransaction } from '../../helpers';
import { addBalance } from '../add-balance';

jest.mock('../../../../utils/database/prisma', () => {
  return {
    wallet: {
      create: jest.fn(),
    },
  };
});

jest.mock('../../helpers', () => {
  return {
    getLastTransaction: jest.fn(),
    calculateBalance: jest.fn(),
  };
});

jest.mock('../../../../utils/crypto', () => {
  return {
    encryptObject: jest.fn(),
  };
});

jest.mock('../../../../utils/database/cache', () => {
  return {
    del: jest.fn(),
    set: jest.fn(),
  };
});

describe('addBalance', () => {
  const user = { id: 1 };
  const credits = 100;
  const balance = 500;
  const lastTransaction = { hash: 'last_transaction_hash' };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add balance, delete cache, and return updated balance', async () => {
    (getLastTransaction as jest.Mock).mockResolvedValue(
      lastTransaction as never
    );
    (calculateBalance as jest.Mock).mockResolvedValue(balance as never);

    const walletCreateMock = jest.fn();
    (prisma.wallet.create as jest.Mock).mockImplementation(walletCreateMock);

    const mockedHash = 'mocked_hash';
    (cryptoUtils.encryptObject as jest.Mock).mockReturnValue(mockedHash);

    const cacheDeleteMock = jest.fn();
    (cache.del as jest.Mock).mockImplementation(cacheDeleteMock);

    const cacheSetMock = jest.fn();
    (cache.set as jest.Mock).mockImplementation(cacheSetMock);

    const result = await addBalance({
      user,
      credits,
    });

    expect(cache.del).toHaveBeenCalledWith(`balance:${user.id}`);
    expect(cache.set).toHaveBeenCalledWith(`balance:${user.id}`, balance);
    expect(getLastTransaction).toHaveBeenCalledWith(user.id);
    expect(prisma.wallet.create).toHaveBeenCalledWith({
      data: {
        type: 'credit',
        value: credits,
        user_id: user.id,
        hash: mockedHash,
      },
    });
    expect(calculateBalance).toHaveBeenCalledWith(user.id);

    expect(result).toEqual({ balance });
  });

  it('should throw an error if there is an error during new balance calculation', async () => {
    const errorMessage = 'Error calculating balance';
    (getLastTransaction as jest.Mock).mockResolvedValue(
      lastTransaction as never
    );
    (calculateBalance as jest.Mock).mockRejectedValue(
      new Error(errorMessage) as never
    );

    const walletCreateMock = jest.fn();
    (prisma.wallet.create as jest.Mock).mockImplementation(walletCreateMock);

    const mockedHash = 'mocked_hash';
    (cryptoUtils.encryptObject as jest.Mock).mockReturnValue(mockedHash);

    const cacheDeleteMock = jest.fn();
    (cache.del as jest.Mock).mockImplementation(cacheDeleteMock);
    const cacheSetMock = jest.fn();
    (cache.set as jest.Mock).mockImplementation(cacheSetMock);

    await expect(
      addBalance({
        user,
        credits,
      })
    ).rejects.toThrowError(errorMessage);

    expect(cache.del).toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
    expect(getLastTransaction).toHaveBeenCalledWith(user.id);
    expect(prisma.wallet.create).toHaveBeenCalled();
    expect(calculateBalance).toHaveBeenCalledWith(user.id);
  });
});
