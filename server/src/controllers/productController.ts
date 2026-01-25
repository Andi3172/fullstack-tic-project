import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Product } from '../models/productModel';

// --- IN-MEMORY CACHE FOR QUOTA SAFETY ---
let productsCache: any[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 Minutes
// ---------------------------------------

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      limit = '12', 
      page = '1', 
      sortBy = 'price', 
      order = 'asc',
      minPrice,
      maxPrice,
      cores,
      vram,
      ramSize,
      forceRefresh
    } = req.query;

    let items: Product[] = [];

    // 1. Cache Check
    const isCacheValid = productsCache && (Date.now() - lastCacheTime < CACHE_TTL);
    const shouldRefresh = forceRefresh === 'true' || !isCacheValid;

    if (!shouldRefresh && productsCache) {
       console.log('📦 Serving products from IN-MEMORY CACHE');
       items = [...productsCache];
    } else {
       console.log('🔥 Fetching products from FIRESTORE (Writes to Cache)');
       // Fetch ALL documents - Safe ONLY because we are caching!
       const snapshot = await db.collection('products').get();
       items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

       // Update Cache
       productsCache = items;
       lastCacheTime = Date.now();
    }

    // 2. In-Memory Filtering

    // Category Filter
    if (category && category !== 'All') {
      items = items.filter(p => p.category === category);
    }

    // Price Filter
    if (minPrice || maxPrice) {
      const min = Number(minPrice) || 0;
      const max = Number(maxPrice) || 100000;
      items = items.filter(p => {
        const price = p.price || 0;
        return price >= min && price <= max;
      });
    }

    // Spec Filters
    if (cores) {
      const coreOptions = String(cores).split(',').map(Number);
      items = items.filter(p => {
        const pCores = Number(p.specs?.core_count);
        return coreOptions.includes(pCores);
      });
    }

    if (vram) {
      const vramOptions = String(vram).split(',').map(Number);
      items = items.filter(p => {
        const pMem = Number(p.specs?.memory);
        return vramOptions.includes(pMem);
      });
    }

    if (ramSize) {
      const ramOptions = String(ramSize).split(',').map(Number);
      items = items.filter(p => {
        const mods = p.specs?.modules;
        if (Array.isArray(mods) && mods.length >= 2) {
            const total = mods[0] * mods[1];
            return ramOptions.includes(total);
        }
        return false;
      });
    }

    // 3. Sorting
    items.sort((a: any, b: any) => {
      let valA = a[String(sortBy)];
      let valB = b[String(sortBy)];

      if (sortBy === 'price') {
         if (valA === null) valA = Infinity; 
         if (valB === null) valB = Infinity;
      }
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return order === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }

      return order === 'desc' ? (valB - valA) : (valA - valB);
    });

    // 4. Offset Pagination
    const limitNum = Number(limit);
    const pageNum = Number(page);
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / limitNum);
    const offset = (pageNum - 1) * limitNum;

    const paginatedItems = items.slice(offset, offset + limitNum);

    res.status(200).json({
      products: paginatedItems,
      totalItems,
      totalPages,
      currentPage: pageNum
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
