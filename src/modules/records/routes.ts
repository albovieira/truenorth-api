import express from 'express';

import { getAll, deleteRecord } from './actions';
import { authMiddleware, checkUserStatusMiddleware } from '../../middlewares';

const recordRoutes = express.Router();

recordRoutes
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
        const { query, user } = req as any;
        const result = await getAll({
          user,
          page: Number(query.page || 1),
          limit: Number(query.limit || 10),
          ...query,
        });
        res.json(result);
      } catch (error) {
        next(error);
      }
    }
  )
  .delete(
    '/:id',
    authMiddleware,
    checkUserStatusMiddleware,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const {
          params: { id },
          user,
        } = req as any;
        const result = await deleteRecord(user, id);
        res.json({
          deleted: result,
        });
      } catch (error) {
        next(error);
      }
    }
  );

export default recordRoutes;
