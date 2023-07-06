import { v4 as uuid } from 'uuid';

import { request } from '../../../utils';

const generateRandomString = async (length: number) => {
  const allowedCharacters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const method = 'generateStrings';
  const {
    result: {
      random: { data },
    },
  } = await request.post(process.env.RANDOM_ORG_API!, {
    method,
    jsonrpc: '2.0',
    params: {
      length,
      apiKey: process.env.RANDOM_ORG_API_KEY,
      n: 1,
      characters: allowedCharacters,
    },
    id: uuid(),
  });
  return data || [];
};

export { generateRandomString };
