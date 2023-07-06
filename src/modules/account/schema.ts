import * as Joi from 'joi';

const registerSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const authSchema = Joi.object({
  password: Joi.string().required(),
  username: Joi.string().required(),
});

const updateSchema = Joi.object({
  enable: Joi.boolean().required(),
});

export { authSchema, registerSchema, updateSchema };
