const supabaseUrl = 'https://vvkdptycohrersbwqiqr.supabase.co';
const supabaseKey = 'sb_publishable_ry_Z-Tb1--Mv_jmJNtvh8g_udvWejdQ';

const items = [
  { name: 'Caesar Salad', url: 'https://loremflickr.com/400/400/caesar,salad?lock=1' },
  { name: 'Bruschetta', url: 'https://loremflickr.com/400/400/bruschetta?lock=1' },
  { name: 'Burrata Salad', url: 'https://loremflickr.com/400/400/burrata?lock=1' },
  { name: 'Provence Rosé', url: 'https://loremflickr.com/400/400/rose,wine?lock=1' },
  { name: 'Barolo Reserve', url: 'https://loremflickr.com/400/400/redwine?lock=2' },
  { name: 'Aperol Spritz', url: 'https://loremflickr.com/400/400/aperol?lock=1' },
  { name: 'Ganache Tart', url: 'https://loremflickr.com/400/400/tart,dessert?lock=1' },
  { name: 'Tiramisu', url: 'https://loremflickr.com/400/400/tiramisu?lock=1' },
  { name: 'Panna Cotta', url: 'https://loremflickr.com/400/400/pannacotta?lock=1' },
  { name: 'Crème Brûlée', url: 'https://loremflickr.com/400/400/cremebrulee?lock=1' },
  { name: 'Sparkling Water', url: 'https://loremflickr.com/400/400/water,glass?lock=1' },
  { name: 'Fresh Orange Juice', url: 'https://loremflickr.com/400/400/orangejuice?lock=1' },
  { name: 'Craft Lemonade', url: 'https://loremflickr.com/400/400/lemonade?lock=1' }
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

async function run() {
  for (const item of items) {
    try {
      await updateProduct(item.name, item.url);
    } catch (err) {
      console.error('Error processing', item.name, err);
    }
  }
}

run();
