import {
  jest,
  beforeEach,
  afterEach,
  expect,
  describe,
  it,
} from '@jest/globals';
import * as express from 'express';

import { NotAuthorizedError } from '../../exceptions';
import prisma from '../../utils/database/prisma';
import checkUserStatusMiddleware from '../check-user-status-middleware';

jest.mock('../../utils/database/prisma', () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

describe('checkUserStatusMiddleware', () => {
  let req: express.Request;
  let res: express.Response;
  let next: express.NextFunction;

  beforeEach(() => {
    req = {} as express.Request;
    res = {} as express.Response;
    next = jest.fn() as express.NextFunction;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next if user status is active', async () => {
    const userId = 1;
    const user = { status: 'ACTIVE' };

    (req as any).user = { id: userId };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user as never);

    await checkUserStatusMiddleware(req, res, next);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: { status: true },
    });

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should throw NotAuthorizedError if user status is inactive', async () => {
    const userId = 1;
    const user = { status: 'INACTIVE' };

    (req as any).user = { id: userId };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user as never);

    await checkUserStatusMiddleware(req, res, next);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: { status: true },
    });

    expect(next).toHaveBeenCalledWith(
      new NotAuthorizedError('User is inactive')
    );
  });

  it('should handle database error', async () => {
    const userId = 1;
    const errorMessage = 'Database error';

    (req as any).user = { id: userId };
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error(errorMessage) as never);

    await checkUserStatusMiddleware(req, res, next);

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: { status: true },
    });

    expect(next).toHaveBeenCalledWith(new NotAuthorizedError('Database error'));
  });
});
