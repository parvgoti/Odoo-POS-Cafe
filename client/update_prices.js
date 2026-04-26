import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Setup supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Updating product prices to INR...");
  
  const { data: products, error: fetchErr } = await supabase.from('products').select('*');
  if (fetchErr) {
    console.error("Error fetching products:", fetchErr);
    return;
  }
  
  if (!products || products.length === 0) {
    console.log("No products found.");
    return;
  }
  
  let updatedCount = 0;
  for (const product of products) {
    // Only update if it seems like a USD price (e.g., less than 50 or so)
    if (product.price && product.price < 50) {
      // Conversion factor: let's multiply by 80
      const newPrice = Math.round(product.price * 80);
      const { error: updateErr } = await supabase
        .from('products')
        .update({ price: newPrice })
        .eq('id', product.id);
        
      if (updateErr) {
        console.error(`Error updating product ${product.id}:`, updateErr);
      } else {
        console.log(`Updated "${product.name}": ₹${product.price} -> ₹${newPrice}`);
        updatedCount++;
      }
    }
  }
  
  console.log(`Done. Updated ${updatedCount} products.`);
}

run();
