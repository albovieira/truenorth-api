import express from 'express';

import { addBalance, getBalance } from './actions';
import { addBalanceSchema } from './schema';
import {
  authMiddleware,
  checkUserStatusMiddleware,
  validateBodySchema,
} from '../../middlewares';

const walletRoutes = express.Router();

walletRoutes
  .get(
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

        const result = await getBalance({
          user,
        });
        res.json(result);
      } catch (error) {
        next(error);
      }
    }
  )
  .post(
    '/',
    validateBodySchema(addBalanceSchema),
    authMiddleware,
    checkUserStatusMiddleware,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const { body } = req;
        const { user } = req as any;

        const result = await addBalance({
          ...body,
          user,
        });
        res.json(result);
      } catch (error) {
        next(error);
      }
    }
  );

export default walletRoutes;
