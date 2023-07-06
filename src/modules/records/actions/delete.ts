import { NotFoundError } from '../../../exceptions';
import { prisma } from '../../../utils';

const deleteRecord = async (user: any, id: number) => {
  const { id: userId } = user;

  id = Number(id);
  const record = await prisma.record.findFirst({
    where: {
      id,
      user: {
        id: userId,
      },
    },
  });

  if (!record) {
    throw new NotFoundError('Record not found');
  }

  await prisma.record.delete({
    where: {
      id,
    },
  });
  return true;
};

export { deleteRecord };
