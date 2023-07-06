import express from 'express';

import { auth, create, update } from './actions';
import { authSchema, registerSchema, updateSchema } from './schema';
import { validateBodySchema, authMiddleware } from '../../middlewares';

const accountRoutes = express.Router();

accountRoutes
  .post(
    '/register',
    validateBodySchema(registerSchema),
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const { body } = req;
        const user = await create(body);
        res.json(user);
      } catch (error) {
        next(error);
      }
    }
  )
  .post(
    '/auth',
    validateBodySchema(authSchema),
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const { body } = req;
        const token = await auth(body);
        res.json({
          token,
        });
      } catch (error) {
        next(error);
      }
    }
  )
  .put(
    '/',
    validateBodySchema(updateSchema),
    authMiddleware,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const { body } = req;
        const response = await update(body);
        res.json({
          ...response,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export default accountRoutes;
