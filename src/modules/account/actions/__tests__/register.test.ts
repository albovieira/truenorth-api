import { jest, beforeEach, expect, describe, it } from '@jest/globals';

import { BadRequestError } from '../../../../exceptions';
import * as cryptoUtils from '../../../../utils/crypto';
import prisma from '../../../../utils/database/prisma';
import { create } from '../register'; // Assuming the function is exported from a separate file

jest.mock('../../../../utils/crypto', () => ({
  encrypt: jest.fn().mockReturnValue('encryptedPassword'),
  encryptObject: jest.fn(),
}));

jest.mock('../../../../exceptions', () => ({
  BadRequestError: jest.fn(),
}));

jest.mock('../../../../utils/database/prisma', () => ({
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
}));

describe('create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user with encrypted password and return the user object', async () => {
    const salt = 'salt_test';
    const data = {
      username: 'albov',
      password: 'password123',
    };

    const walletCredit = 100;

    const expectedUser = {
      id: 1,
      username: 'albov',
      status: 'ACTIVE',
    } as any;

    const findFirstMock = jest
      .spyOn(prisma.user, 'findFirst')
      .mockResolvedValue(null);
    const createMock = jest
      .spyOn(prisma.user, 'create')
      .mockResolvedValue(expectedUser);

    jest.spyOn(Date.prototype, 'getTime').mockReturnValueOnce(salt as never);
    jest.spyOn(cryptoUtils, 'encryptObject').mockReturnValueOnce('test_hash');

    process.env.INITIAL_WALLET_CREDIT = walletCredit.toString();
    const result = await create(data);

    expect(cryptoUtils.encrypt).toHaveBeenCalledWith(
      expect.any(String),
      'password123'
    );
    expect(cryptoUtils.encryptObject).toHaveBeenCalledWith(salt, {
      name: 'initial-credit',
    });
    expect(findFirstMock).toHaveBeenCalledWith({
      where: {
        username: 'albov',
      },
    });
    expect(createMock).toHaveBeenCalledWith({
      data: {
        salt,
        username: 'albov',
        status: 'ACTIVE',
        password: 'encryptedPassword',
        wallet: {
          create: {
            type: 'credit',
            hash: 'test_hash',
            value: walletCredit,
          },
        },
      },
      select: {
        id: true,
        status: true,
        username: true,
      },
    });
    expect(result).toEqual(expectedUser);
  });

  it('should throw BadRequestError if the username is already in use', async () => {
    const data = {
      username: 'albov',
      password: 'password123',
    };

    const existingUser = {
      id: 1,
      username: 'albov',
    } as any;

    jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(existingUser);

    try {
      await create(data);
    } catch (error: any) {
      expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);
      expect(error).toBeInstanceOf(BadRequestError);
    }
  });

  it('should throw an error if Prisma findFirst throws an exception', async () => {
    const data = {
      username: 'albov',
      password: 'password123',
    };

    jest
      .spyOn(prisma.user, 'findFirst')
      .mockRejectedValue(new Error('Prisma findFirst error'));

    await expect(create(data)).rejects.toThrow(Error);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should throw an error if Prisma create throws an exception', async () => {
    const data = {
      username: 'albov',
      password: 'password123',
    };

    const createMock = jest.spyOn(prisma.user, 'create');
    createMock.mockRejectedValue(new Error('Prisma create error'));

    await expect(create(data)).rejects.toThrow(Error);
  });
});
