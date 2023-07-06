import * as Joi from 'joi';

const addBalanceSchema = Joi.object({
  credits: Joi.number().required(),
});

export { addBalanceSchema };
