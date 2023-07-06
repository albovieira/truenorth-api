import express from 'express';

import { create, getOperations } from './actions';
import { calculatorSchema } from './schema';
import {
  authMiddleware,
  checkUserStatusMiddleware,
  validateBodySchema,
} from '../../middlewares';

const calculatorRoutes = express.Router();

calculatorRoutes
  .get(
    '/operations',
    authMiddleware,
    checkUserStatusMiddleware,
    async (
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const result = await getOperations();
        res.json(result);
      } catch (error) {
        next(error);
      }
    }
  )
  .post(
    '/',
    validateBodySchema(calculatorSchema),
    authMiddleware,
    checkUserStatusMiddleware,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const {
          body: { formula },
        } = req;
        const { user } = req as any;

        const result = await create({
          user,
          formula,
        });
        res.json(result);
      } catch (error) {
        next(error);
      }
    }
  );

export default calculatorRoutes;
