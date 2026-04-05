const url = 'https://vvkdptycohrersbwqiqr.supabase.co/rest/v1/products';
const key = 'sb_publishable_ry_Z-Tb1--Mv_jmJNtvh8g_udvWejdQ';

async function updateProduct(name, imageUrl) {
  const res = await fetch(`${url}?name=eq.${encodeURIComponent(name)}`, {
    method: 'PATCH',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ image_url: imageUrl })
  });
  if (!res.ok) {
    console.error('Failed', name, await res.text());
  } else {
    console.log('Updated', name);
  }
}

async function run() {
  await updateProduct('Signature Cold Brew', '/images/cold_brew.png');
  await updateProduct('Cappuccino', '/images/cappuccino.png');
  await updateProduct('Matcha Latte', '/images/matcha_latte.png');
  await updateProduct('Margherita Pizza', '/images/margherita_pizza.png');
  await updateProduct('Quattro Formaggi', '/images/quattro_formaggi.png');
  await updateProduct('Prosciutto e Rucola', '/images/prosciutto_rucola.png');
  await updateProduct('Truffle Risotto', '/images/truffle_risotto.png');
  await updateProduct('Aglio Olio', '/images/aglio_olio.png');
  await updateProduct('Espresso Macchiato', '/images/espresso_macchiato.png');
  await updateProduct('Earl Grey', '/images/earl_grey.png');
}
run();
