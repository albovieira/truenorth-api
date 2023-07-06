import { expect, describe, it } from '@jest/globals';

import { buildSortQuery } from '../build-sort-query';

describe('buildSortQuery', () => {
  it('should build the sort query', () => {
    const sort = 'name=asc|age=desc';
    const query = buildSortQuery(sort);

    expect(query).toEqual({
      name: 'asc',
      age: 'desc',
    });
  });

  it('should build the sort query for operation and formula', () => {
    const sort = 'operation=name|formula=data';
    const query = buildSortQuery(sort);

    expect(query).toEqual({
      operation: {
        name: 'name',
      },
      formula: {
        data: 'data',
      },
    });
  });

  it('should handle multiple sort fields', () => {
    const sort = 'name=asc|age=desc|count=asc';
    const query = buildSortQuery(sort);

    expect(query).toEqual({
      name: 'asc',
      age: 'desc',
      count: 'asc',
    });
  });

  it('should return an empty sort query object for empty sort', () => {
    const sort = '';
    const query = buildSortQuery(sort);

    expect(query).toEqual({});
  });
});
