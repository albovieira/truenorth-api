import { jest, expect, describe, it, afterEach } from '@jest/globals';

import { PaymentRequiredError } from '../../../../exceptions';
import prisma from '../../../../utils/database/prisma';
import { getLastTransaction, checkBalance } from '../../../wallet/helpers';
import { saveOperations } from '../../helpers';
import { generateRandomString } from '../../helpers/generate-random-string';
import { create } from '../create';

jest.mock('../../../wallet/helpers', () => {
  return {
    getLastTransaction: jest.fn(),
    checkBalance: jest.fn(),
  };
});

jest.mock('../../../../utils/database/prisma', () => {
  return {
    operation: {
      findUnique: jest.fn(),
    },
  };
});

jest.mock('../../helpers/generate-random-string', () => {
  return {
    generateRandomString: jest.fn(),
  };
});

jest.mock('../../helpers/save-operation', () => {
  return {
    saveOperations: jest.fn(),
  };
});

jest.mock('../../../../utils/database/cache', () => {
  return {
    del: jest.fn(),
  };
});

describe('create', () => {
  const user = { id: 1 };
  const length = 10;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new record', async () => {
    const operation = { id: 1, cost: 10 };
    const randomString = 'randomString';
    const lastTransaction = { id: 1, hash: 'transaction_hash' };
    const saved = true;

    (prisma.operation.findUnique as jest.Mock).mockResolvedValueOnce(
      operation as never
    );
    (checkBalance as jest.Mock).mockResolvedValueOnce(true as never);
    (generateRandomString as jest.Mock).mockResolvedValueOnce([
      randomString,
    ] as never);
    (getLastTransaction as jest.Mock).mockResolvedValueOnce(
      lastTransaction as never
    );
    (saveOperations as jest.Mock).mockResolvedValueOnce(saved as never);

    const result = await create({ user, length });

    expect(prisma.operation.findUnique).toHaveBeenCalledWith({
      where: {
        symbol: 'rand',
      },
      select: {
        id: true,
        cost: true,
      },
    });
    expect(checkBalance).toHaveBeenCalledWith({ user, cost: operation.cost });
    expect(generateRandomString).toHaveBeenCalledWith(length);
    expect(getLastTransaction).toHaveBeenCalledWith(user.id);
    expect(saveOperations).toHaveBeenCalledWith({
      user,
      randomString,
      operation,
      lastTransaction,
    });
    expect(result).toEqual({
      result: randomString,
      success: true,
    });
  });

  it('should throw PaymentRequiredError if balance is insufficient', async () => {
    const operation = { id: 1, cost: 10 };
    const lastTransaction = { id: 1, hash: 'transaction_hash' };

    (prisma.operation.findUnique as jest.Mock).mockResolvedValueOnce(
      operation as never
    );
    (checkBalance as jest.Mock).mockResolvedValueOnce(false as never);
    (getLastTransaction as jest.Mock).mockResolvedValueOnce(
      lastTransaction as never
    );

    const expectedError = new PaymentRequiredError('Insuficient funds');

    await expect(create({ user, length })).rejects.toThrow(expectedError);

    expect(prisma.operation.findUnique).toHaveBeenCalledWith({
      where: {
        symbol: 'rand',
      },
      select: {
        id: true,
        cost: true,
      },
    });

    expect(getLastTransaction).not.toBeCalled();
    expect(checkBalance).toHaveBeenCalledWith({ user, cost: operation.cost });
  });
});
