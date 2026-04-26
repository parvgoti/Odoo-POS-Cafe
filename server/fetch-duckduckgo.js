const https = require('https');

async function searchImage(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' dessert food high res')}`;
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Duckduckgo HTML image results usually have something like:
        // src="//external-content.duckduckgo.com/iu/?u=..."
        const match = data.match(/src="\/\/external-content\.duckduckgo\.com\/iu\/\?u=([^"&]+)/);
        if (match) {
          resolve(decodeURIComponent(match[1]));
        } else {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

const queries = [
  { name: 'Caesar Salad', q: 'Caesar Salad plate gourmet' },
  { name: 'Bruschetta', q: 'Bruschetta appetizer restaurant' },
  { name: 'Burrata Salad', q: 'Burrata Salad tomato basil' },
  { name: 'Provence Rosé', q: 'Rose wine glass elegant' },
  { name: 'Barolo Reserve', q: 'Red wine glass restaurant' },
  { name: 'Aperol Spritz', q: 'Aperol Spritz cocktail glass' },
  { name: 'Ganache Tart', q: 'Chocolate tart dessert gourmet' },
  { name: 'Tiramisu', q: 'Tiramisu italian dessert slice' },
  { name: 'Panna Cotta', q: 'Panna Cotta dessert berry' },
  { name: 'Crème Brûlée', q: 'Creme Brulee dessert' },
  { name: 'Sparkling Water', q: 'Sparkling water glass ice lemon' },
  { name: 'Fresh Orange Juice', q: 'Fresh Orange Juice glass breakfast' },
  { name: 'Craft Lemonade', q: 'Craft Lemonade glass ice' }
];

async function run() {
  const results = {};
  for (const item of queries) {
    const url = await searchImage(item.q);
    if (url) {
      console.log(`[OK] ${item.name}: ${url}`);
      results[item.name] = url;
    } else {
      console.log(`[FAIL] ${item.name}`);
    }
    // 1s delay to avoid being blocked
    await new Promise(r => setTimeout(r, 1000));
  }
}

run();
