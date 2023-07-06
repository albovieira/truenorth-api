import * as Joi from 'joi';

const calculatorSchema = Joi.object({
  formula: Joi.string().required(),
});

export { calculatorSchema };
