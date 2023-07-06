import { calculateBalance } from './calculate-balance';

const checkBalance = async ({ user, cost }: any) => {
  const balance = await calculateBalance(user.id);
  return balance >= cost;
};

export { checkBalance };
