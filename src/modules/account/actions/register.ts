import { BadRequestError } from '../../../exceptions';
import { prisma, cryptoUtils } from '../../../utils';

const create = async (data: { username: string; password: string }) => {
  const { username, password } = data;

  const salt = new Date().getTime().toString();
  const encryptedPass = cryptoUtils.encrypt(salt, password);

  const usernameAlreadyInUse = await prisma.user.findFirst({
    where: {
      username,
    },
  });

  if (usernameAlreadyInUse) {
    throw new BadRequestError('username already in use');
  }

  const user = await prisma.user.create({
    data: {
      salt,
      username,
      status: 'ACTIVE',
      password: encryptedPass,
      wallet: {
        create: {
          type: 'credit',
          hash: cryptoUtils.encryptObject(salt, { name: 'initial-credit' }),
          value: Number(process.env.INITIAL_WALLET_CREDIT),
        },
      },
    },
    select: {
      id: true,
      status: true,
      username: true,
    },
  });

  return user;
};

export { create };
