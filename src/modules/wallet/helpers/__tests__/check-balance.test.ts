import { jest, expect, describe, it, afterEach } from '@jest/globals';

import { calculateBalance } from '../calculate-balance';
import { checkBalance } from '../check-balance';

jest.mock('../calculate-balance', () => {
  return {
    calculateBalance: jest.fn(),
  };
});

describe('checkBalance', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if the balance is greater than or equal to the cost', async () => {
    const user = { id: 1 };
    const cost = 50;
    const balance = 100;

    (calculateBalance as jest.Mock).mockResolvedValueOnce(balance as never);

    const result = await checkBalance({ user, cost });

    expect(calculateBalance).toHaveBeenCalledWith(user.id);
    expect(result).toBe(true);
  });

  it('should return false if the balance is less than the cost', async () => {
    const user = { id: 1 };
    const cost = 100;
    const balance = 50;

    (calculateBalance as jest.Mock).mockResolvedValueOnce(balance as never);

    const result = await checkBalance({ user, cost });

    expect(calculateBalance).toHaveBeenCalledWith(user.id);
    expect(result).toBe(false);
  });
});
