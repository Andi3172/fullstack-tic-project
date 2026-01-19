import Joi from 'joi';

export interface Address {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UserMetadata {
  createdAt: string; // ISO Date string
  lastLogin: string; // ISO Date string
}

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'customer';
  profile: UserProfile;
  shippingAddresses: Address[];
  metadata: UserMetadata;
}

export const userSchema = Joi.object<User>({
  uid: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'customer').required(),
  profile: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().optional(),
  }).required(),
  shippingAddresses: Joi.array().items(
    Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      zip: Joi.string().required(),
      country: Joi.string().required(),
    })
  ).required(),
  metadata: Joi.object({
    createdAt: Joi.string().isoDate().required(),
    lastLogin: Joi.string().isoDate().required(),
  }).required(),
});
