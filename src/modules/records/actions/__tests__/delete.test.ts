import { jest, beforeEach, expect, describe, it } from '@jest/globals';

import { NotFoundError } from '../../../../exceptions';
import prisma from '../../../../utils/database/prisma';
import { deleteRecord } from '../delete';

jest.mock('../../../../utils/database/prisma', () => ({
  record: {
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('deleteRecord', () => {
  const user = { id: 1 };
  const recordId = 1;
  const record = { id: 1, user: { id: 1 } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a record', async () => {
    (prisma.record.findFirst as jest.Mock).mockResolvedValue(record as never);

    const result = await deleteRecord(user, recordId);

    expect(prisma.record.findFirst).toHaveBeenCalledWith({
      where: {
        id: recordId,
        user: { id: user.id },
      },
    });

    expect(prisma.record.delete).toHaveBeenCalledWith({
      where: {
        id: recordId,
      },
    });

    expect(result).toBe(true);
  });

  it('should throw NotFoundError if record not found', async () => {
    (prisma.record.findFirst as jest.Mock).mockResolvedValue(null as never);

    await expect(deleteRecord(user, recordId)).rejects.toThrowError(
      new NotFoundError('Record not found')
    );

    expect(prisma.record.findFirst).toHaveBeenCalledWith({
      where: {
        id: recordId,
        user: { id: user.id },
      },
    });

    expect(prisma.record.delete).not.toHaveBeenCalled();
  });
});
