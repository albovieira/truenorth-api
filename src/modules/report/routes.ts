import express from 'express';

import { get } from './actions';
import { authMiddleware, checkUserStatusMiddleware } from '../../middlewares';

const reportRoutes = express.Router();

reportRoutes.get(
  '/',
  authMiddleware,
  checkUserStatusMiddleware,
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { user } = req as any;
      const result = await get({
        ...user,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default reportRoutes;
