import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvkdptycohrersbwqiqr.supabase.co';
const supabaseKey = 'sb_publishable_ry_Z-Tb1--Mv_jmJNtvh8g_udvWejdQ';

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
    // Only update if it seems like a USD price (not already converted, let's say < 50)
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
