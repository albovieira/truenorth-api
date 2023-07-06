import { jest, beforeEach, expect, describe, it } from '@jest/globals';

import prisma from '../../../../utils/database/prisma';
import { buildSearchQuery, buildSortQuery } from '../../helpers';
import { getAll } from '../get-all';

jest.mock('../../../../utils/database/prisma', () => ({
  record: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
}));

jest.mock('../../helpers', () => ({
  buildSearchQuery: jest.fn(),
  buildSortQuery: jest.fn(),
}));

describe('getAll', () => {
  const user = { id: 1 };
  const limit = 10;
  const page = 1;
  const sort = 'createdAt';
  const search = 'keyword';
  const query = { id: 1 };
  const orderBy = { createdAt: 'asc' };
  const total = 20;
  const records = [
    {
      amount: 10,
      formula: { data: '1+2', result: 3 },
      operation: { name: 'addition', cost: 5 },
      operation_request: '1+2',
      operation_response: 'success',
      createdAt: '2023-07-01',
    },
    {
      amount: 20,
      formula: { data: '3*4', result: 12 },
      operation: { name: 'multiplication', cost: 10 },
      operation_request: '1+2',
      operation_response: 'success',
      createdAt: '2023-07-02',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get all records with search and sort queries', async () => {
    (buildSearchQuery as jest.Mock).mockReturnValue(query);
    (buildSortQuery as jest.Mock).mockReturnValue(orderBy);
    (prisma.record.count as jest.Mock).mockResolvedValue(total as never);
    (prisma.record.findMany as jest.Mock).mockResolvedValue(records as never);

    const result = await getAll({ limit, page, sort, search, user });

    expect(buildSearchQuery).toHaveBeenCalledWith(search);
    expect(buildSortQuery).toHaveBeenCalledWith(sort);
    expect(prisma.record.count).toHaveBeenCalled();
    expect(prisma.record.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: limit,
      where: {
        ...query,
        user: { id: user.id },
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
      orderBy,
    });

    expect(result).toEqual({
      total,
      page,
      limit,
      data: records,
    });
  });

  it('should get all records without search and sort queries', async () => {
    (buildSearchQuery as jest.Mock).mockReturnValue(null);
    (buildSortQuery as jest.Mock).mockReturnValue(null);
    (prisma.record.count as jest.Mock).mockResolvedValue(total as never);
    (prisma.record.findMany as jest.Mock).mockResolvedValue(records as never);

    const result = await getAll({ limit, page, sort: '', search: '', user });

    expect(buildSearchQuery).not.toHaveBeenCalled();
    expect(buildSortQuery).not.toHaveBeenCalled();
    expect(prisma.record.count).toHaveBeenCalled();
    expect(prisma.record.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: limit,
      where: {
        user: { id: user.id },
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
      orderBy: {},
    });

    expect(result).toEqual({
      total,
      page,
      limit,
      data: records,
    });
  });
});
