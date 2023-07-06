import { jest, afterEach, expect, describe, it } from '@jest/globals';

import { getOperationsPerSymbol } from '..';
import prisma from '../../../../utils/database/prisma';

jest.mock('../../../../utils/database/prisma', () => ({
  operation: {
    findMany: jest.fn(),
  },
}));

describe('getOperationsPerSymbol', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an operation object', async () => {
    const mockOperations = [
      { id: 1, symbol: '+', type: 'addition', cost: 1 },
      { id: 1, symbol: '-', type: 'subtraction', cost: 1 },
    ];
    jest
      .spyOn(prisma.operation, 'findMany')
      .mockResolvedValue(mockOperations as never);

    const result = await getOperationsPerSymbol();

    expect(prisma.operation.findMany).toHaveBeenCalled();
    expect(result).toEqual({
      '+': { id: 1, symbol: '+', type: 'addition', cost: 1 },
      '-': { id: 1, symbol: '-', type: 'subtraction', cost: 1 },
    });
  });

  it('should return an empty object if no operations are found', async () => {
    jest.spyOn(prisma.operation, 'findMany').mockResolvedValue([]);

    const result = await getOperationsPerSymbol();

    expect(prisma.operation.findMany).toHaveBeenCalled();
    expect(result).toEqual({});
  });
});
