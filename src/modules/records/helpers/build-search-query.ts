/* eslint-disable prefer-const */
const buildSearchQuery = (search: string) => {
  const searchArray = search.split('|');
  const query = {} as any;
  ['%', '='].forEach((type: string) => {
    searchArray.reduce((acc: any, searchItem) => {
      const hasType = searchItem.includes(type);
      if (!hasType) return acc;
      let [field, value] = searchItem.split(type) as any;

      if (field === 'operation') {
        acc[field] = {
          name:
            type === '%'
              ? {
                  contains: value.toLowerCase(),
                  mode: 'insensitive',
                }
              : { equals: value },
        };
        return acc;
      }
      if (field === 'formula') {
        acc[field] = {
          data:
            type === '%'
              ? {
                  contains: value.toLowerCase(),
                  mode: 'insensitive',
                }
              : { equals: value },
        };
        return acc;
      }

      const parseToInt = parseInt(value, 10);
      if (parseToInt) {
        value = parseToInt;
      }

      const searchValue =
        type === '%'
          ? { contains: value, mode: 'insensitive' }
          : { equals: value };
      acc[field as any] = searchValue;
      return acc;
    }, query);
  });

  return query;
};

export { buildSearchQuery };
