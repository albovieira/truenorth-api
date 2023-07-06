import * as jwt from 'jsonwebtoken';

const encode = async (payload: any): Promise<string> => {
  return jwt.sign(payload, process.env.JWT_SECRET!);
};

const decode = async (token: string): Promise<any> => {
  return jwt.verify(token as string, process.env.JWT_SECRET!);
};

export { encode, decode };
