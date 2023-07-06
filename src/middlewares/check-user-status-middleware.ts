/* eslint-disable consistent-return */
// import { idSchema } from '@src/middlewares/default-schemas/param-id';
import * as express from 'express';

import { NotAuthorizedError } from '../exceptions';
import { prisma } from '../utils';

const checkUserStatusMiddleware = async (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { id } = (req as any).user;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { status: true },
    });
    if (user?.status === 'INACTIVE') {
      return next(new NotAuthorizedError('User is inactive'));
    }
  } catch (error: any) {
    return next(new NotAuthorizedError(error.message));
  }

  next();
};

export default checkUserStatusMiddleware;
