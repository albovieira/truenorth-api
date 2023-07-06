import { prisma } from '../../../utils';

const update = async (data: any) => {
  const { user, enable } = data;

  await prisma.user.update({
    data: {
      status: enable ? 'ACTIVE' : 'INACTIVE',
    },
    where: {
      id: user.id,
    },
  });

  return {
    message: enable ? 'User enabled' : 'User disabled',
  };
};

export { update };
