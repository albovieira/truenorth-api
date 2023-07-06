import * as Joi from 'joi';

const randomizeSchema = Joi.object({
  length: Joi.number().min(1).required(),
});

export { randomizeSchema };
