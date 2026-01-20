import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Product } from '../models/productModel';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, limit = '12' } = req.query;
    
    let query: FirebaseFirestore.Query = db.collection('products');

    if (category) {
      query = query.where('category', '==', category);
    }

    // Always apply limit
    query = query.limit(Number(limit));

    const snapshot = await query.get();
    const products: Product[] = snapshot.docs.map(doc => doc.data() as Product);

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('products').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = doc.data() as Product;
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
