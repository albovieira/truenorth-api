/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const operations = [
    {
      cost: 1,
      type: 'addition',
      name: 'Addition',
      symbol: '+',
    },
    {
      cost: 1,
      type: 'substraction',
      name: 'Substraction',
      symbol: '-',
    },
    {
      cost: 1,
      type: 'multiplication',
      name: 'Multiplication',
      symbol: '*',
    },
    {
      cost: 1,
      type: 'division',
      name: 'Division',
      symbol: '/',
    },
    {
      cost: 1,
      type: 'square_root',
      name: 'Square root',
      symbol: '√',
    },
    {
      cost: 1,
      type: 'random_string',
      name: 'Random string',
      symbol: 'rand',
    },
  ];

  await prisma.operation.createMany({
    data: operations,
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
