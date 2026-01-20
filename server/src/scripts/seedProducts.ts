
import axios from 'axios';
import { db } from '../config/firebase';
import { Product } from '../models/productModel';

const CATEGORIES = ['cpu', 'video-card', 'motherboard', 'memory', 'internal-hard-drive'];
const LIMIT_PER_CATEGORY = 500;
const BATCH_SIZE = 400; // Firestore limit is 500, keeping it safe

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

const seedCategory = async (category: string) => {
  console.log(`\n--- Processing Category: ${category} ---`);
  try {
    const url = `https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/${category}.json`;
    const { data } = await axios.get(url);
    const itemsToProcess = data.slice(0, LIMIT_PER_CATEGORY);

    console.log(`Fetched ${itemsToProcess.length} items from ${category}. Checking for existing items...`);

    // Chunk the processing to manage memory and promise concurrency
    for (let i = 0; i < itemsToProcess.length; i += BATCH_SIZE) {
      const chunk = itemsToProcess.slice(i, i + BATCH_SIZE);
      const chunkProposals: { slug: string; item: any; ref: FirebaseFirestore.DocumentReference }[] = [];

      // 1. Prepare proposals (calculate slugs and refs)
      for (const item of chunk) {
        // Some items might not have a name, skip them if so (or handle gracefully)
        if (!item.name) continue;
        const slug = slugify(item.name);
        // Add minimal randomness to slug if really needed, but dataset is usually unique-ish per name
        chunkProposals.push({
            slug,
            item,
            ref: db.collection('products').doc(slug)
        });
      }

      // 2. Check existence in parallel
      // Firestore supports getting multiple docs, but `getAll` is often cleaner or just Promise.all on individual gets
      // Promise.all is 'Cheap' Read operations.
      const snapshots = await Promise.all(chunkProposals.map(p => p.ref.get()));

      // 3. Filter for non-existing
      const missingProposals = chunkProposals.filter((_, index) => !snapshots[index].exists);
      
      console.log(`Chunk ${i / BATCH_SIZE + 1}: Checked ${chunk.length}. Found ${missingProposals.length} new items.`);

      if (missingProposals.length === 0) continue;

      // 4. Batch Write
      const batch = db.batch();
      let writeCount = 0;

      for (const proposal of missingProposals) {
        const item = proposal.item;
        
        const newProduct: Product = {
            price: (item.price && item.price > 0) ? item.price : null,
            category: category,
            name: item.name,
            image: item.image || `https://placehold.co/300x300?text=${category}`,
            description: item.name, // Dataset often lacks desc, use name
            stock: 0,
            specs: { ...item }, // Store all original props as specs
            metadata: {
                createdAt: new Date().toISOString()
            }
        };

        // Remove known top-level keys from specs to avoid duplication if desired, 
        // but for now keeping it simple as requested: "specs: Rest of object"
        // Actually, let's clean 'specs' a tiny bit to not duplicate 'name', 'price', 'image' too much if strictly requested
        // But the prompt says "specs: Rest of object", so strictly:
        delete newProduct.specs.price;
        delete newProduct.specs.name; 
        delete newProduct.specs.image;

        batch.set(proposal.ref, newProduct);
        writeCount++;
      }

      if (writeCount > 0) {
        await batch.commit();
        console.log(`  -> Committed ${writeCount} writes.`);
      }
    }

  } catch (error) {
    console.error(`Error processing ${category}:`, error);
  }
};

const run = async () => {
    console.log("Starting Product Seed...");
    for (const cat of CATEGORIES) {
        await seedCategory(cat);
    }
    console.log("\nSeeding Complete.");
    // Force exit as firebase admin might keep connection open
    process.exit(0);
};

run();
