import {
  jest,
  beforeEach,
  afterEach,
  expect,
  describe,
  it,
} from '@jest/globals';
import * as express from 'express';

import { NotAuthorizedError } from '../../exceptions';
import * as tokenizer from '../../utils/tokenizer';
import authMiddleware from '../auth-middleware';

jest.mock('.././../utils/tokenizer');

describe('authMiddleware', () => {
  let req: express.Request;
  let res: express.Response;
  let next: express.NextFunction;

  beforeEach(() => {
    req = {} as express.Request;
    res = {} as express.Response;
    next = jest.fn() as express.NextFunction;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next with NotAuthorizedError if authorization header is missing', async () => {
    req.headers = {};

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(new NotAuthorizedError());
  });

  it('should call tokenizer.decode and set user on the request if token is valid', async () => {
    const token = 'valid_token';
    const decodedUser = { id: 1, username: 'user' };

    req.headers = { authorization: `Bearer ${token}` };
    (tokenizer.decode as jest.Mock).mockResolvedValue(decodedUser as never);

    await authMiddleware(req, res, next);

    expect(tokenizer.decode).toHaveBeenCalledTimes(1);
    expect(tokenizer.decode).toHaveBeenCalledWith(token);

    expect((req as any).user).toEqual(decodedUser);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should call next with NotAuthorizedError if token is invalid', async () => {
    const token = 'invalid_token';

    req.headers = { authorization: `Bearer ${token}` };
    (tokenizer.decode as jest.Mock).mockResolvedValue(null as never);

    await authMiddleware(req, res, next);

    expect(tokenizer.decode).toHaveBeenCalledTimes(1);
    expect(tokenizer.decode).toHaveBeenCalledWith(token);

    expect((req as any).user).toBeNull();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(new NotAuthorizedError());
  });

  it('should call next with NotAuthorizedError if decode throws an error', async () => {
    const token = 'valid_token';
    const errorMessage = 'Token decoding failed';

    req.headers = { authorization: `Bearer ${token}` };
    (tokenizer.decode as jest.Mock).mockRejectedValue(new Error(errorMessage) as never);

    await authMiddleware(req, res, next);

    expect(tokenizer.decode).toHaveBeenCalledTimes(1);
    expect(tokenizer.decode).toHaveBeenCalledWith(token);

    expect((req as any).user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(new NotAuthorizedError(errorMessage));
  });
});
