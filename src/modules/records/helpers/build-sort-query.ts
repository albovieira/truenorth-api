const buildSortQuery = (sort: string) => {
  const sortArray = sort.split('|');
  const sortQuery = {} as any;
  sortArray.reduce((acc: any, sortItem) => {
    const [field, value] = sortItem.split('=') as any;
    if (field === 'operation') {
      acc[field] = {
        name: value,
      };
      return acc;
    }
    if (field === 'formula') {
      acc[field] = {
        data: value,
      };
      return acc;
    }

    acc[field as any] = value;
    return acc;
  }, sortQuery);

  return sortQuery;
};

export { buildSortQuery };
