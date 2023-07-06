/* eslint-disable consistent-return */
import * as express from 'express';

import { NotAuthorizedError } from '../exceptions';
import * as tokenizer from '../utils/tokenizer';

const authMiddleware = async (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return next(new NotAuthorizedError());
    }

    const token = authorization?.split(' ')[1];
    const user = await tokenizer.decode(token as string);
    (req as any).user = user;

    if (!user) {
      return next(new NotAuthorizedError());
    }
  } catch (error: any) {
    return next(new NotAuthorizedError(error.message));
  }

  next();
};

export default authMiddleware;
