import { jest, expect, describe, it, afterEach } from '@jest/globals';

import * as cache from '../../../../utils/database/cache';
import { calculateBalance } from '../../helpers';
import { getBalance } from '../get-balance';

jest.mock('../../helpers', () => {
  return {
    calculateBalance: jest.fn(),
  };
});

jest.mock('../../../../utils/database/cache', () => {
  return {
    get: jest.fn(),
    set: jest.fn(),
  };
});

describe('getBalance', () => {
  const user = { id: 1 };
  const balance = 500;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get balance from cache', async () => {
    (calculateBalance as jest.Mock).mockResolvedValue(balance as never);

    const balanceInCache = balance.toString();
    (cache.get as jest.Mock).mockReturnValue(balanceInCache);

    const cacheSetMock = jest.fn();
    (cache.set as jest.Mock).mockImplementation(cacheSetMock);

    const result = await getBalance({ user });

    expect(cache.get).toHaveBeenCalledWith(`balance:${user.id}`);
    expect(cache.set).not.toHaveBeenCalled();
    expect(calculateBalance).not.toHaveBeenCalled();

    expect(result).toEqual({ balance });
  });

  it('should get balance from database', async () => {
    (calculateBalance as jest.Mock).mockResolvedValue(balance as never);

    (cache.get as jest.Mock).mockReturnValue(null);

    const cacheSetMock = jest.fn();
    (cache.set as jest.Mock).mockImplementation(cacheSetMock);

    const result = await getBalance({ user });

    expect(cache.get).toHaveBeenCalledWith(`balance:${user.id}`);
    expect(cache.set).toHaveBeenCalledWith(`balance:${user.id}`, balance);
    expect(calculateBalance).toHaveBeenCalledWith(user.id);

    expect(result).toEqual({ balance });
  });

  it('should throw an error if there is an error during balance calculation', async () => {
    const errorMessage = 'Error calculating balance';
    (calculateBalance as jest.Mock).mockRejectedValue(
      new Error(errorMessage) as never
    );

    (cache.get as jest.Mock).mockReturnValue(null);

    const cacheSetMock = jest.fn();
    (cache.set as jest.Mock).mockImplementation(cacheSetMock);

    await expect(getBalance({ user })).rejects.toThrowError(errorMessage);

    expect(calculateBalance).toHaveBeenCalledWith(user.id);
  });
});
