import * as jwt from 'jsonwebtoken';

import { NotAuthorizedError } from '../../../exceptions';
import { prisma, cryptoUtils } from '../../../utils';

const auth = async (body: { username: string; password: string }) => {
  const { username, password } = body;
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      salt: true,
      username: true,
      password: true,
    },
  });

  if (!user) {
    throw new NotAuthorizedError('User Invalid');
  }

  const hashedPassword = user?.password;
  if (cryptoUtils.check(user?.salt!, password, hashedPassword!)) {
    const token = await jwt.sign(
      {
        id: user?.id,
        username: user?.username,
      },
      process.env.JWT_SECRET!
    );
    return token;
  }
  throw new NotAuthorizedError('User Invalid');
};

export { auth };
