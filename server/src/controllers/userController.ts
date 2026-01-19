import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { User } from '../models/userModel';

export const syncUser = async (req: Request, res: Response) => {
  try {
    const { uid, email } = res.locals.user;

    if (!uid || !email) {
      return res.status(400).json({ message: 'Invalid user data from token' });
    }

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const newUser: User = {
        uid,
        email,
        role: 'customer',
        profile: {
          firstName: '',
          lastName: '',
        },
        shippingAddresses: [],
        metadata: {
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
      };

      await userRef.set(newUser);
      return res.status(201).json({ message: 'User created', user: newUser });
    } else {
      // Update last login
      await userRef.update({
        'metadata.lastLogin': new Date().toISOString(),
      });
      const userData = userDoc.data() as User;
      return res.status(200).json({ message: 'User synced', user: userData });
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
