import Joi from 'joi';

export interface Product {
  id?: string;
  price: number | null;
  category: string;
  name: string;
  image: string;
  description: string;
  stock: number;
  specs: Record<string, any>;
  metadata: {
    createdAt: string;
  };
}

export const productSchema = Joi.object({
  price: Joi.number().allow(null).optional(),
  category: Joi.string().required(),
  name: Joi.string().required(),
  image: Joi.string().required(),
  description: Joi.string().required(),
  stock: Joi.number().required(),
  specs: Joi.object().unknown(true).required(),
  metadata: Joi.object({
    createdAt: Joi.string().isoDate().required()
  }).required()
});
