import { jest, afterEach, expect, describe, it } from '@jest/globals';

import * as request from '../../../../utils/request';
import { generateRandomString } from '../generate-random-string';

jest.mock('../../../../utils/request', () => {
  return {
    post: jest.fn(),
  };
});

describe('generateRandomString', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a random string', async () => {
    const length = 10;
    const allowedCharacters =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomData = 'random_data';

    const expectedRequestPayload = {
      method: 'generateStrings',
      jsonrpc: '2.0',
      params: {
        length,
        apiKey: process.env.RANDOM_ORG_API_KEY,
        n: 1,
        characters: allowedCharacters,
      },
      id: expect.any(String),
    };

    const response = {
      result: {
        random: {
          data: [randomData],
        },
      },
    };

    (request.post as jest.Mock).mockResolvedValueOnce(response as never);

    const result = await generateRandomString(length);

    expect(request.post).toHaveBeenCalledWith(
      process.env.RANDOM_ORG_API,
      expectedRequestPayload
    );
    expect(result).toEqual([randomData]);
  });

  it('should throw an error if the request fails', async () => {
    const length = 10;
    const expectedRequestPayload = {
      method: 'generateStrings',
      jsonrpc: '2.0',
      params: {
        length,
        apiKey: process.env.RANDOM_ORG_API_KEY,
        n: 1,
        characters: expect.any(String),
      },
      id: expect.any(String),
    };
    const expectedError = new Error('Failed to retrieve random data');

    (request.post as jest.Mock).mockRejectedValueOnce(expectedError as never);

    await expect(generateRandomString(length)).rejects.toThrowError(
      expectedError
    );
    expect(request.post).toHaveBeenCalledWith(
      process.env.RANDOM_ORG_API!,
      expect.any(Object)
    );
    expect(request.post).toHaveBeenCalledWith(
      process.env.RANDOM_ORG_API,
      expectedRequestPayload
    );
  });
});
