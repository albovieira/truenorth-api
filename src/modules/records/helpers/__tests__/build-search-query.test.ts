import { expect, describe, it } from '@jest/globals';

import { buildSearchQuery } from '../build-search-query';

describe('buildSearchQuery', () => {
  it('should build the search query with contains operator', () => {
    const search = 'name%John|age%25';
    const query = buildSearchQuery(search);

    expect(query).toEqual({
      name: {
        contains: 'John',
        mode: 'insensitive',
      },
      age: {
        contains: 25,
        mode: 'insensitive',
      },
    });
  });

  it('should build the search query with equals operator', () => {
    const search = 'name=John|age=25';
    const query = buildSearchQuery(search);

    expect(query).toEqual({
      name: {
        equals: 'John',
      },
      age: {
        equals: 25,
      },
    });
  });

  it('should build the search query with insensitive mode for operation and formula', () => {
    const search = 'operation%Add|formula%Test';
    const query = buildSearchQuery(search);

    expect(query).toEqual({
      operation: {
        name: {
          contains: 'add',
          mode: 'insensitive',
        },
      },
      formula: {
        data: {
          contains: 'test',
          mode: 'insensitive',
        },
      },
    });
  });

  it('should convert numeric values to integers', () => {
    const search = 'age%25|count=10';
    const query = buildSearchQuery(search);

    expect(query).toEqual({
      age: {
        contains: 25,
        mode: 'insensitive',
      },
      count: {
        equals: 10,
      },
    });
  });

  it('should return an empty query object for empty search', () => {
    const search = '';
    const query = buildSearchQuery(search);

    expect(query).toEqual({});
  });
});
