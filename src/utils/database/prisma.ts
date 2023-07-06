/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

/** TODO:// Hold the functions in variables before add to the middleware */
if (process.env.ENABLE_SQL_LOG === 'true') {
  prisma.$on('query', async (e) => {
    console.log(`${e.query} ${e.params}`);
  });
}

prisma.$use(async (params: any, next) => {
  // Check incoming query type
  if (params.action === 'delete') {
    // Delete queries
    // Change action to an update
    params.action = 'update';
    params.args.data = {
      deleted: true,
      deletedAt: new Date(),
    };
  }
  if (params.action === 'deleteMany') {
    // Delete many queries
    params.action = 'updateMany';
    if (params.args.data !== undefined) {
      params.args.data.deleted = true;
      params.args.data.deletedAt = new Date();
    } else {
      params.args.data = {
        deleted: true,
        deletedAt: new Date(),
      };
    }
  }
  return next(params);
});

prisma.$use(async (params, next) => {
  if (params.action === 'findUnique' || params.action === 'findFirst') {
    // Change to findFirst - you cannot filter
    // by anything except ID / unique with findUnique
    params.action = 'findFirst';
    // Add 'deleted' filter
    // ID filter maintained
    params.args.where.deleted = false;
  }
  if (params.action === 'findMany') {
    // Find many queries
    if (params.args.where) {
      if (params.args.where.deleted === undefined) {
        // Exclude deleted records if they have not been explicitly requested
        params.args.where.deleted = false;
      }
    } else {
      params.args.where = { deleted: false };
    }
  }
  return next(params);
});

prisma.$use(async (params, next) => {
  if (['findFirst', 'findMany', 'findUnique'].includes(params.action)) {
    params.args = {
      ...params.args,
      select: {
        id: true,
        ...params.args.select,
        deleted: false,
        deletedAt: false,
      },
    };
  }

  return next(params);
});

export default prisma;
