const https = require('https');
const fs = require('fs');

async function getPexelsImage(query) {
  return new Promise((resolve, reject) => {
    https.get(`https://www.pexels.com/search/${encodeURIComponent(query)}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Look for the first image URL matching images.pexels.com/photos/
        const match = data.match(/https:\/\/images\.pexels\.com\/photos\/\d+\/pexels-photo-\d+\.jpeg\?auto=compress&cs=tinysrgb&w=400/);
        if (match) {
          resolve(match[0]);
        } else {
          // fallback regex
          const fallback = data.match(/https:\/\/images\.pexels\.com\/photos\/\d+\/[a-zA-Z0-9-]+\.jpeg[^\s"']*/);
          if (fallback) resolve(fallback[0]);
          else reject(`No image found for ${query}`);
        }
      });
    }).on('error', reject);
  });
}

const queries = [
  'Caesar Salad', 'Bruschetta', 'Burrata Salad', 
  'Rose Wine', 'Red Wine Glass', 'Aperol Spritz', 
  'Chocolate Tart', 'Tiramisu Dessert', 'Panna Cotta', 'Creme Brulee', 
  'Sparkling Water Glass', 'Fresh Orange Juice', 'Glass of Lemonade'
];

async function run() {
  for (const q of queries) {
    try {
      const url = await getPexelsImage(q);
      console.log(`${q}: ${url}`);
    } catch(err) {
      console.log(`Failed to find image for ${q}`);
    }
  }
}
run();
