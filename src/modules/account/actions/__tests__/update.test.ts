import { jest, beforeEach, expect, describe, it } from '@jest/globals';

import prisma from '../../../../utils/database/prisma';
import { update } from '../update';

jest.mock('../../../../utils/database/prisma', () => ({
  user: {
    update: jest.fn(),
  },
}));

describe('update', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update user status to ACTIVE when enable is true', async () => {
    const data = {
      user: { id: 1 },
      enable: true,
    };

    await update(data);

    expect(prisma.user.update).toHaveBeenCalledWith({
      data: { status: 'ACTIVE' },
      where: { id: 1 },
    });
  });

  it('should update user status to INACTIVE when enable is false', async () => {
    const data = {
      user: { id: 1 },
      enable: false,
    };

    await update(data);

    expect(prisma.user.update).toHaveBeenCalledWith({
      data: { status: 'INACTIVE' },
      where: { id: 1 },
    });
  });

  it('should return the correct message when enable is true', async () => {
    const data = {
      user: { id: 1 },
      enable: true,
    };

    const result = await update(data);

    expect(result).toEqual({ message: 'User enabled' });
  });

  it('should return the correct message when enable is false', async () => {
    const data = {
      user: { id: 1 },
      enable: false,
    };

    const result = await update(data);

    expect(result).toEqual({ message: 'User disabled' });
  });

  it('should throw an error if can not update the status', async () => {
    const data = {
      user: { id: 1 },
      enable: true,
    };

    const error = new Error('Prisma update error') as never;
    (prisma.user.update as jest.Mock).mockRejectedValue(error);

    let thrownError: any;
    try {
      await update(data);
    } catch (err) {
      thrownError = err;
    }

    expect(thrownError).toBe(error);
    expect(prisma.user.update).toHaveBeenCalledWith({
      data: { status: 'ACTIVE' },
      where: { id: 1 },
    });
  });
});
