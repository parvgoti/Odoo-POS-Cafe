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
  await updateProduct('Oat Milk Cortado', '/images/oat_cortado.png');
  await updateProduct('Wild Truffle Pizza', '/images/truffle_pizza.png');
  await updateProduct('Pesto Tagliatelle', '/images/pesto_pasta.png');
  await updateProduct('Classic Negroni', '/images/negroni.png');
}
run();
