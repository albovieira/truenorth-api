import { prisma, logger } from '../../../utils';
import { buildSearchQuery, buildSortQuery } from '../helpers';

const getAll = async ({
  limit = 10,
  page = 1,
  sort,
  search,
  user,
}: {
  limit?: number;
  page?: number;
  sort: string;
  search: string;
  user: any;
}) => {
  logger.info(
    `Getting records,  page: ${page}, limit: ${limit}, sort: ${
      sort || ''
    }, search:${search || ''}`
  );
  const query = search ? buildSearchQuery(search) || {} : {};
  const orderBy = sort ? buildSortQuery(sort) || {} : {};

  const skip = page > 1 ? (page - 1) * limit : 0;
  const total = await prisma.record.count({
    where: {
      ...query,
      user: {
        id: user.id,
      },
    },
  });
  const records = await prisma.record.findMany({
    skip,
    take: Number(limit),
    where: {
      ...query,
      user: {
        id: user.id,
      },
    },
    select: {
      amount: true,
      formula: {
        select: {
          data: true,
          result: true,
        },
      },
      operation: {
        select: {
          name: true,
          cost: true,
        },
      },
      operation_request: true,
      operation_response: true,
      createdAt: true,
    },
    orderBy: {
      ...orderBy,
    },
  });

  return {
    total: Number(total),
    page: Number(page),
    limit: Number(limit),
    data: records,
  };
};

export { getAll };
