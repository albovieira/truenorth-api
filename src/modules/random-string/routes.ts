import express from 'express';

import { create } from './actions';
import { authMiddleware, checkUserStatusMiddleware } from '../../middlewares';

const randomStringRoutes = express.Router();

randomStringRoutes.post(
  '/',
  authMiddleware,
  checkUserStatusMiddleware,
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { body, user } = req as any;
      const result = await create({
        user,
        ...body,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default randomStringRoutes;
