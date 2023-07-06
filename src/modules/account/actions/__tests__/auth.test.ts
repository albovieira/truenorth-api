import { describe, expect, jest, afterEach, it } from '@jest/globals';
import jwt from 'jsonwebtoken';

import { NotAuthorizedError } from '../../../../exceptions';
import * as cryptoUtils from '../../../../utils/crypto';
import prisma from '../../../../utils/database/prisma';
import { auth } from '../auth';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mockedToken'),
}));

jest.mock('../../../../utils/crypto', () => ({
  check: jest.fn().mockReturnValue(true),
}));

describe('auth', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate and return a token if the user is valid', async () => {
    const mockedUser = {
      id: 'mockedUserId',
      username: 'mockedUsername',
      password: 'mockedHashedPassword',
      salt: 'mockedSalt',
    } as any;

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockedUser);

    const body = {
      username: 'mockedUsername',
      password: 'mockedPassword',
    };

    const token = await auth(body);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        username: body.username,
      },
      select: {
        id: true,
        salt: true,
        username: true,
        password: true,
      },
    });

    expect(cryptoUtils.check).toHaveBeenCalledWith(
      mockedUser.salt,
      body.password,
      mockedUser.password
    );

    expect(jwt.sign).toHaveBeenCalledWith(
      {
        id: mockedUser.id,
        username: mockedUser.username,
      },
      process.env.JWT_SECRET
    );

    expect(token).toBe('mockedToken');
  });

  it('should throw NotAuthorizedError if the user is invalid', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    const body = {
      username: 'mockedUsername',
      password: 'mockedPassword',
    };

    await expect(auth(body)).rejects.toThrow(NotAuthorizedError);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        username: body.username,
      },
      select: {
        id: true,
        salt: true,
        username: true,
        password: true,
      },
    });
  });

  it('should throw NotAuthorizedError if the password is invalid', async () => {
    const mockedUser = {
      id: 'mockedUserId',
      username: 'mockedUsername',
      password: 'mockedHashedPassword',
      salt: 'mockedSalt',
    } as any;

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockedUser);
    jest.spyOn(cryptoUtils, 'check').mockReturnValue(false);

    const body = {
      username: 'mockedUsername',
      password: 'mockedInvalidPassword',
    };

    await expect(auth(body)).rejects.toThrow(NotAuthorizedError);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        username: body.username,
      },
      select: {
        id: true,
        salt: true,
        username: true,
        password: true,
      },
    });

    expect(cryptoUtils.check).toHaveBeenCalledWith(
      mockedUser.salt,
      body.password,
      mockedUser.password
    );

    expect(jwt.sign).not.toHaveBeenCalled();
  });
});
