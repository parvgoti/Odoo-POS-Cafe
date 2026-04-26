const https = require('https');

async function searchImage(query) {
  const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=1`;
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            // Get a nice size (like regular or small)
            resolve(json.results[0].urls.regular);
          } else {
            resolve(null);
          }
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

const queries = [
  { name: 'Caesar Salad', q: 'caesar salad' },
  { name: 'Bruschetta', q: 'bruschetta' },
  { name: 'Burrata Salad', q: 'burrata salad' },
  { name: 'Provence Rosé', q: 'glass of rose wine' },
  { name: 'Barolo Reserve', q: 'glass of red wine' },
  { name: 'Aperol Spritz', q: 'aperol spritz' },
  { name: 'Ganache Tart', q: 'chocolate tart' },
  { name: 'Tiramisu', q: 'tiramisu dessert' },
  { name: 'Panna Cotta', q: 'panna cotta' },
  { name: 'Crème Brûlée', q: 'creme brulee' },
  { name: 'Sparkling Water', q: 'sparkling water glass' },
  { name: 'Fresh Orange Juice', q: 'fresh orange juice' },
  { name: 'Craft Lemonade', q: 'craft lemonade' }
];

const supabaseUrl = 'https://vvkdptycohrersbwqiqr.supabase.co';
const supabaseKey = 'sb_publishable_ry_Z-Tb1--Mv_jmJNtvh8g_udvWejdQ';

async function updateProduct(name, imageUrl) {
  const res = await fetch(`${supabaseUrl}/rest/v1/products?name=eq.${encodeURIComponent(name)}`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ image_url: imageUrl })
  });
  if (!res.ok) console.error('Failed', name);
  else console.log('Updated DB:', name);
}

async function run() {
  for (const item of queries) {
    const url = await searchImage(item.q);
    if (url) {
      console.log(`[OK] ${item.name}: ${url}`);
      await updateProduct(item.name, url);
    } else {
      console.log(`[FAIL] ${item.name}`);
    }
    // delay to avoid rate limit
    await new Promise(r => setTimeout(r, 1000));
  }
}

run();
