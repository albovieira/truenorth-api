import { jest, afterEach, expect, describe, it } from '@jest/globals';

import { PaymentRequiredError, BadRequestError } from '../../../../exceptions';
import * as cache from '../../../../utils/database/cache';
import { getLastTransaction, checkBalance } from '../../../wallet/helpers';
import {
  parseFormula,
  getOperationsPerSymbol,
  getTotalCost,
  saveOperations,
} from '../../helpers';
import { create } from '../create';

jest.mock('../../../wallet/helpers');
jest.mock('../../helpers');
jest.mock('../../helpers');
jest.mock('../../../../utils/database/cache', () => {
  return {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };
});

describe('create', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new record successfully', async () => {
    const data = { user: { id: 1 }, formula: '1+1' };
    const parsedFormula = { executedOperations: ['+'], finalResult: 100 };
    const operations = ['operation1'];
    const totalCost = 50;
    const lastTransaction = { id: 123 };

    (cache.get as jest.Mock).mockReturnValue(null as never);
    (cache.set as jest.Mock).mockImplementation(jest.fn());
    (parseFormula as jest.Mock).mockReturnValue(parsedFormula);
    (getOperationsPerSymbol as jest.Mock).mockResolvedValue(
      operations as never
    );
    (getTotalCost as jest.Mock).mockReturnValue(totalCost);
    (checkBalance as jest.Mock).mockResolvedValue(true as never);
    (getLastTransaction as jest.Mock).mockResolvedValue(
      lastTransaction as never
    );
    (saveOperations as jest.Mock).mockResolvedValue(true as never);

    const expectedResult = {
      formula: data.formula,
      result: parsedFormula.finalResult,
      success: true,
    };

    await expect(create(data)).resolves.toEqual(expectedResult);

    expect(cache.get).toHaveBeenCalled();
    expect(cache.set).toHaveBeenCalled();

    expect(parseFormula).toHaveBeenCalledTimes(1);
    expect(parseFormula).toHaveBeenCalledWith(data.formula);

    expect(getOperationsPerSymbol).toHaveBeenCalledTimes(1);

    expect(getTotalCost).toHaveBeenCalledTimes(1);
    expect(getTotalCost).toHaveBeenCalledWith(
      parsedFormula.executedOperations,
      operations
    );

    expect(checkBalance).toHaveBeenCalledTimes(1);
    expect(checkBalance).toHaveBeenCalledWith({
      user: data.user,
      cost: totalCost,
    });

    expect(getLastTransaction).toHaveBeenCalledTimes(1);
    expect(getLastTransaction).toHaveBeenCalledWith(data.user.id);

    expect(saveOperations).toHaveBeenCalledTimes(1);
    expect(saveOperations).toHaveBeenCalledWith({
      user: data.user,
      formula: data.formula,
      finalResult: parsedFormula.finalResult,
      executedOperations: parsedFormula.executedOperations,
      operations,
      totalCost,
      lastTransaction,
    });
  });

  it('should use formula from cache', async () => {
    const data = { user: { id: 1 }, formula: '1+1' };
    const parsedFormula = { executedOperations: ['+'], finalResult: 100 };
    const operations = ['operation1'];
    const totalCost = 50;
    const lastTransaction = { id: 123 };

    (cache.get as jest.Mock).mockReturnValue(
      JSON.stringify(parsedFormula) as never
    );
    (cache.set as jest.Mock).mockImplementation(jest.fn());
    (parseFormula as jest.Mock).mockReturnValue(parsedFormula);
    (getOperationsPerSymbol as jest.Mock).mockResolvedValue(
      operations as never
    );
    (getTotalCost as jest.Mock).mockReturnValue(totalCost as never);
    (checkBalance as jest.Mock).mockResolvedValue(true as never);
    (getLastTransaction as jest.Mock).mockResolvedValue(
      lastTransaction as never
    );
    (saveOperations as jest.Mock).mockResolvedValue(true as never);

    const expectedResult = {
      formula: data.formula,
      result: parsedFormula.finalResult,
      success: true,
    };

    await expect(create(data)).resolves.toEqual(expectedResult);

    expect(cache.get).toHaveBeenCalledWith(`formula_${data.formula}`);
    expect(cache.set).not.toHaveBeenCalled();
    expect(parseFormula).not.toHaveBeenCalled();
    expect(getOperationsPerSymbol).toHaveBeenCalledTimes(1);

    expect(getTotalCost).toHaveBeenCalledTimes(1);
    expect(getTotalCost).toHaveBeenCalledWith(
      parsedFormula.executedOperations,
      operations
    );

    expect(checkBalance).toHaveBeenCalledTimes(1);
    expect(checkBalance).toHaveBeenCalledWith({
      user: data.user,
      cost: totalCost,
    });

    expect(getLastTransaction).toHaveBeenCalledTimes(1);
    expect(getLastTransaction).toHaveBeenCalledWith(data.user.id);

    expect(saveOperations).toHaveBeenCalledTimes(1);
    expect(saveOperations).toHaveBeenCalledWith({
      user: data.user,
      formula: data.formula,
      finalResult: parsedFormula.finalResult,
      executedOperations: parsedFormula.executedOperations,
      operations,
      totalCost,
      lastTransaction,
    });
  });

  it('should throw BadRequestError if executedOperations is empty', async () => {
    const data = { user: { id: 1 }, formula: '1-----1' };
    const parsedFormula = { executedOperations: [], finalResult: 0 };

    (cache.get as jest.Mock).mockReturnValue(null as never);

    const cacheSetMock = jest.fn();
    (cache.set as jest.Mock).mockImplementation(cacheSetMock);

    (parseFormula as jest.Mock).mockReturnValue(parsedFormula as never);

    await expect(create(data)).rejects.toThrowError(
      new BadRequestError('Invalid formula')
    );

    expect(cache.get).toHaveBeenCalled();
    expect(cache.set).toHaveBeenCalled();
    expect(parseFormula).toHaveBeenCalledTimes(1);
    expect(parseFormula).toHaveBeenCalledWith(data.formula);

    expect(getOperationsPerSymbol).not.toHaveBeenCalled();
    expect(checkBalance).not.toHaveBeenCalled();
    expect(getLastTransaction).not.toHaveBeenCalled();
    expect(saveOperations).not.toHaveBeenCalled();
  });

  it('should throw PaymentRequiredError if checkBalance returns false', async () => {
    const data = { user: { id: 1 }, formula: '1+1' };
    const parsedFormula = { executedOperations: ['+'], finalResult: 100 };
    const operations = ['+'];
    const totalCost = 50;

    (cache.get as jest.Mock).mockReturnValue(null as never);

    const cacheSetMock = jest.fn();
    (cache.set as jest.Mock).mockImplementation(cacheSetMock);

    (parseFormula as jest.Mock).mockReturnValue(parsedFormula);
    (getOperationsPerSymbol as jest.Mock).mockResolvedValue(
      operations as never
    );
    (getTotalCost as jest.Mock).mockReturnValue(totalCost as never);
    (checkBalance as jest.Mock).mockResolvedValue(false as never);

    await expect(create(data)).rejects.toThrowError(
      new PaymentRequiredError('Insufficient funds')
    );

    expect(parseFormula).toHaveBeenCalledTimes(1);
    expect(parseFormula).toHaveBeenCalledWith(data.formula);

    expect(getOperationsPerSymbol).toHaveBeenCalledTimes(1);

    expect(getTotalCost).toHaveBeenCalledTimes(1);
    expect(getTotalCost).toHaveBeenCalledWith(
      parsedFormula.executedOperations,
      operations
    );

    expect(checkBalance).toHaveBeenCalledTimes(1);
    expect(checkBalance).toHaveBeenCalledWith({
      user: data.user,
      cost: totalCost,
    });

    expect(getLastTransaction).not.toHaveBeenCalled();
    expect(saveOperations).not.toHaveBeenCalled();
  });
});
