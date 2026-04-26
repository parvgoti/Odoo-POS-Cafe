const https = require('https');

async function getWikiImage(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}`;
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Node JS script)' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].original) {
            resolve(pages[pageId].original.source);
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
  { name: 'Caesar Salad', title: 'Caesar_salad' },
  { name: 'Bruschetta', title: 'Bruschetta' },
  { name: 'Burrata Salad', title: 'Burrata' },
  { name: 'Provence Rosé', title: 'Rosé' },
  { name: 'Barolo Reserve', title: 'Red_wine' },
  { name: 'Aperol Spritz', title: 'Spritz_(alcoholic_beverage)' },
  { name: 'Ganache Tart', title: 'Chocolate_tart' },
  { name: 'Tiramisu', title: 'Tiramisu' },
  { name: 'Panna Cotta', title: 'Panna_cotta' },
  { name: 'Crème Brûlée', title: 'Crème_brûlée' },
  { name: 'Sparkling Water', title: 'Carbonated_water' },
  { name: 'Fresh Orange Juice', title: 'Orange_juice' },
  { name: 'Craft Lemonade', title: 'Lemonade' }
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
    const url = await getWikiImage(item.title);
    if (url) {
      console.log(`[OK] ${item.name}: ${url}`);
      await updateProduct(item.name, url);
    } else {
      console.log(`[FAIL] ${item.name}`);
    }
  }
}

run();
