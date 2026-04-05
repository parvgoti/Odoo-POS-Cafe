const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const supabaseUrl = 'https://vvkdptycohrersbwqiqr.supabase.co';
const supabaseKey = 'sb_publishable_ry_Z-Tb1--Mv_jmJNtvh8g_udvWejdQ';

const items = [
  { name: 'Caesar Salad', file: 'caesar_salad.png', url: 'https://loremflickr.com/400/400/caesar,salad?lock=1' },
  { name: 'Bruschetta', file: 'bruschetta.png', url: 'https://loremflickr.com/400/400/bruschetta?lock=1' },
  { name: 'Burrata Salad', file: 'burrata_salad.png', url: 'https://loremflickr.com/400/400/burrata?lock=1' },
  { name: 'Provence Rosé', file: 'provence_rose.png', url: 'https://loremflickr.com/400/400/rose,wine?lock=1' },
  { name: 'Barolo Reserve', file: 'barolo_reserve.png', url: 'https://loremflickr.com/400/400/redwine?lock=1' },
  { name: 'Aperol Spritz', file: 'aperol_spritz.png', url: 'https://loremflickr.com/400/400/aperol?lock=1' },
  { name: 'Ganache Tart', file: 'ganache_tart.png', url: 'https://loremflickr.com/400/400/tart,dessert?lock=1' },
  { name: 'Tiramisu', file: 'tiramisu.png', url: 'https://loremflickr.com/400/400/tiramisu?lock=1' },
  { name: 'Panna Cotta', file: 'panna_cotta.png', url: 'https://loremflickr.com/400/400/pannacotta?lock=1' },
  { name: 'Crème Brûlée', file: 'creme_brulee.png', url: 'https://loremflickr.com/400/400/cremebrulee?lock=1' },
  { name: 'Sparkling Water', file: 'sparkling_water.png', url: 'https://loremflickr.com/400/400/water,glass?lock=1' },
  { name: 'Fresh Orange Juice', file: 'orange_juice.png', url: 'https://loremflickr.com/400/400/orangejuice?lock=1' },
  { name: 'Craft Lemonade', file: 'craft_lemonade.png', url: 'https://loremflickr.com/400/400/lemonade?lock=1' }
];

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

const dir = path.join(__dirname, '../client/public/images');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function download(urlStr, filename) {
  return new Promise((resolve, reject) => {
    const client = urlStr.startsWith('https') ? https : http;
    client.get(urlStr, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirUrl = new URL(res.headers.location, urlStr).href;
        return download(redirUrl, filename).then(resolve).catch(reject);
      }
      
      const fileStream = fs.createWriteStream(filename);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log('Downloaded', path.basename(filename));
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  for (const item of items) {
    try {
      const filePath = path.join(dir, item.file);
      await download(item.url, filePath);
      await updateProduct(item.name, `/images/${item.file}`);
    } catch (err) {
      console.error('Error processing', item.name, err);
    }
  }
}

run();
