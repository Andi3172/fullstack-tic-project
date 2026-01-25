import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Product } from '../models/productModel';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      limit = '12', 
      sortBy = 'price', 
      order = 'asc',
      lastVisibleId
    } = req.query;
    
    // 1. Base Query
    let queryArgs: FirebaseFirestore.Query = db.collection('products');
    
    // 2. Filters & Sorts
    if (category && category !== 'All') {
      queryArgs = queryArgs.where('category', '==', category);
    }
    
    // Primary Sort
    queryArgs = queryArgs.orderBy(String(sortBy), order as 'asc' | 'desc');
    
    // Secondary Sort (Critical for Stability)
    // Firestore requires the second sort to be unique if the first one isn't distinct (like price)
    queryArgs = queryArgs.orderBy('id');

    // 3. Cursor Pagination
    if (lastVisibleId) {
       const docSnap = await db.collection('products').doc(String(lastVisibleId)).get();
       if (docSnap.exists) {
           queryArgs = queryArgs.startAfter(docSnap);
       }
    }
    
    // 4. Limit
    queryArgs = queryArgs.limit(Number(limit));

    // 5. Execute
    const snapshot = await queryArgs.get();
    const products: Product[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

    // 6. Response
    const lastItem = products.length > 0 ? products[products.length - 1] : null;
    
    res.status(200).json({
      products,
      lastVisibleId: lastItem ? lastItem.id : null,
      hasMore: products.length === Number(limit) // Canonical check: if we got full limit, maybe more exists
    });

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

    const product = { id: doc.id, ...doc.data() } as Product;
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
