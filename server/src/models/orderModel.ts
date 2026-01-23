import Joi from 'joi';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

export const orderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      name: Joi.string().required(),
      price: Joi.number().required(),
      quantity: Joi.number().min(1).required(),
      image: Joi.string().allow('').optional()
    })
  ).required()
});
