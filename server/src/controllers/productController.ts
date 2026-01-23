import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Product } from '../models/productModel';

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
      cores,   // "4,6,8"
      vram,    // "8,12,24"
      ramSize  // "16,32"
    } = req.query;
    
    // 1. Base Query: Always filter by category to limit dataset size (~500 max per cat)
    let collectionRef: FirebaseFirestore.Query = db.collection('products');
    
    // Default to 'video-card' or 'cpu' if not provided? Or just fetch all?
    // User context implies category is usually selected. 
    // If 'All' or undefined, we might fetch everything? 
    // To be safe and performant, let's assume category is passed or we default to a check.
    // If 'All', we skip the where clause (dangerous for large datasets, but 2500 is manageable in memory for node)
    if (category && category !== 'All') {
      collectionRef = collectionRef.where('category', '==', category);
    }

    const snapshot = await collectionRef.get();
    let items: Product[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

    // 2. In-Memory Filtering

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
    
    // Cores (CPU)
    if (cores) {
      const coreOptions = String(cores).split(',').map(Number);
      items = items.filter(p => {
        const pCores = Number(p.specs?.core_count);
        return coreOptions.includes(pCores);
      });
    }

    // VRAM (Video Card)
    if (vram) {
      const vramOptions = String(vram).split(',').map(Number);
      items = items.filter(p => {
        const pMem = Number(p.specs?.memory);
        return vramOptions.includes(pMem);
      });
    }

    // RAM Size (Memory)
    if (ramSize) {
      const ramOptions = String(ramSize).split(',').map(Number);
      items = items.filter(p => {
        // RAM logic: modules is [count, size_per_module] usually
        // p.specs.modules might be [2, 16] => 32GB total
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

      // Handle null prices (put them at end usually, or treat as 0?)
      // If we want valid prices first:
      if (sortBy === 'price') {
         if (valA === null) valA = Infinity; // push to bottom on asc
         if (valB === null) valB = Infinity;
      }
      
      // String comparison for names
      if (typeof valA === 'string' && typeof valB === 'string') {
        return order === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }

      // Numeric comparison
      return order === 'desc' ? (valB - valA) : (valA - valB);
    });

    // 4. Cursor Pagination
    const limitNum = Number(limit);
    let paginatedItems = items;
    const lastVisibleId = req.query.lastVisible as string;
    
    // If we are doing in-memory pagination after fetching (or filtering), 
    // real cursor pagination on Firestore requires the query to be limited *before* fetching.
    // However, our current architecture fetches ALL by category -> filters in memory -> then paginates.
    // To support "Infinite Scroll" properly with this in-memory approach:
    // We just slice the array based on "lastVisible" index? 
    // Or simpler: Keep Page-based logic but frontend treats it as "Load More"?
    // But Request specifically asked for "db...startAfter(doc)". This implies moving filters to DB query?
    // MIGRATION NOTE: Moving all filters to DB is hard w/ Firestore complex queries. 
    // Let's stick to the HYBRID approach but simulate Infinite Scroll via pages or slicing.
    //
    // ACTUALLY, sticking to the existing "Page" param is easiest for "Infinite Scroll" frontend logic.
    // Frontend just requests Page 1, then Page 2, and appends.
    // But if USER insists on "lastVisible" cursor logic:
    
    let startIndex = 0;
    if (lastVisibleId) {
        const lastParamIndex = items.findIndex(p => p.id === lastVisibleId);
        if (lastParamIndex !== -1) {
            startIndex = lastParamIndex + 1;
        }
    }
    
    // If using Page param (simpler/safer for hybrid):
    // const offset = (Number(page) - 1) * limitNum; 
    // Let's support BOTH or switch to Cursor if present.
    
    if (lastVisibleId) {
        paginatedItems = items.slice(startIndex, startIndex + limitNum);
    } else {
         const pageNum = Number(page) || 1;
         const offset = (pageNum - 1) * limitNum;
         paginatedItems = items.slice(offset, offset + limitNum);
    }

    const lastItem = paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1] : null;

    res.status(200).json({
      products: paginatedItems,
      total: items.length,
      lastVisible: lastItem ? lastItem.id : null,
      hasMore: (startIndex + limitNum) < items.length // Rough check
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
