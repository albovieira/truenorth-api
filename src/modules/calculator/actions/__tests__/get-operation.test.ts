import { jest, beforeEach, expect, describe, it } from '@jest/globals';

import prisma from '../../../../utils/database/prisma';
import { getOperations } from '../get-operations';

jest.mock('../../../../utils/database/prisma', () => ({
  operation: {
    findMany: jest.fn(),
  },
}));

describe('getOperations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the correct operations', async () => {
    const mockOperations = [
      {
        id: 1,
        type: 'Type A',
        name: 'Operation A',
        symbol: 'A',
        cost: 10,
      },
      {
        id: 2,
        type: 'Type B',
        name: 'Operation B',
        symbol: 'B',
        cost: 20,
      },
    ] as never;

    (prisma.operation.findMany as jest.Mock).mockResolvedValue(mockOperations);

    const result = await getOperations();

    expect(prisma.operation.findMany).toHaveBeenCalled();
    expect(result).toEqual({
      count: 2,
      data: mockOperations,
    });
  });

  it('should return an empty array if no operations found', async () => {
    (prisma.operation.findMany as jest.Mock).mockResolvedValue([] as never);

    const result = await getOperations();

    expect(prisma.operation.findMany).toHaveBeenCalled();
    expect(result).toEqual({
      count: 0,
      data: [],
    });
  });

  it('should throw an error if can not get operations from the database', async () => {
    const error = new Error('Prisma findMany error');
    (prisma.operation.findMany as jest.Mock).mockRejectedValue(error as never);

    let thrownError: any;
    try {
      await getOperations();
    } catch (err) {
      thrownError = err;
    }

    expect(thrownError).toBe(error);
    expect(prisma.operation.findMany).toHaveBeenCalled();
  });
});
