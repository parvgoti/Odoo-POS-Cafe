import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/formatters';
import { Plus, Search, Grid3x3, List, Edit, Trash2, X, Package } from 'lucide-react';
import './products.css';

const categoryEmojis = {
  'Coffee & Tea': '☕',
  'Signature Pizza': '🍕',
  'Pasta': '🍝',
  'Starters': '🥗',
  'Vino': '🍷',
  'Desserts': '🍰',
  'Drinks': '🥤',
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data } = await supabase.from('categories').select('*').order('sort_order');
      if (data) setCategories(data);
    } catch { /* use empty */ }
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name, emoji)')
        .order('sort_order');

      if (error) throw error;
      if (data) setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }

  const allCategories = ['All', ...categories.map(c => c.name)];

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || p.categories?.name === category;
    return matchSearch && matchCategory;
  });

  function openAdd() {
    setEditProduct(null);
    setShowModal(true);
  }

  function openEdit(product) {
    setEditProduct(product);
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    setProducts(products.filter(p => p.id !== id));
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Delete error:', error);
      fetchProducts(); // Refresh on error
    }
  }

  async function handleSave(productData) {
    try {
      if (editProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
      }
      setShowModal(false);
      fetchProducts(); // Refresh from server
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving product: ' + err.message);
    }
  }

  return (
    <div className="products-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} items in your menu</p>
        </div>
        <button className="btn btn-accent" onClick={openAdd}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="products-toolbar">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="pill-tabs">
          {allCategories.map(cat => (
            <button key={cat} className={`pill-tab ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
        <div className="view-toggle">
          <button aria-label="Grid View" className={`btn btn-ghost btn-icon ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><Grid3x3 size={18} /></button>
          <button aria-label="List View" className={`btn btn-ghost btn-icon ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={18} /></button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="products-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="product-card card skeleton-wrapper">
              <div className="product-card-image skeleton" style={{ height: 140 }} />
              <div className="product-card-body">
                <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 8, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: '80%', height: 16, marginBottom: 8, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: '40%', height: 12, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {!loading && (
        <div className={`products-${viewMode} stagger-children`}>
          {filtered.map((product, index) => (
            <div key={product.id} className="product-card card card-interactive" onClick={() => openEdit(product)}>
              <div className="product-card-image">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="product-image" 
                    loading={index < 6 ? "eager" : "lazy"} 
                    fetchpriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                  />
                ) : (
                  <span className="product-emoji">{product.categories?.emoji || categoryEmojis[product.categories?.name] || '🍽️'}</span>
                )}
              </div>
              <div className="product-card-body">
                <span className="badge badge-neutral mb-1">{product.categories?.name || 'Uncategorized'}</span>
                <h3 className="product-card-name">{product.name}</h3>
                <p className="product-card-desc">{product.description}</p>
                <div className="product-card-footer">
                  <span className="product-card-price font-mono">{formatCurrency(product.price)}</span>
                  <div className="product-card-actions">
                    <button aria-label="Edit product" className="btn btn-ghost btn-icon btn-sm" onClick={e => { e.stopPropagation(); openEdit(product); }}><Edit size={14} /></button>
                    <button aria-label="Delete product" className="btn btn-ghost btn-icon btn-sm" onClick={e => { e.stopPropagation(); handleDelete(product.id); }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <Package size={48} className="empty-state-icon" />
          <p className="empty-state-title">No products found</p>
          <p>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <ProductModal
          product={editProduct}
          categories={categories}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function ProductModal({ product, categories, onSave, onClose }) {
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState({
    name: product?.name || '',
    price: product?.price || '',
    category_id: product?.category_id || '',
    description: product?.description || '',
    image_url: product?.image_url || '',
    unit: product?.unit || 'piece',
    tax_percent: product?.tax_percent || 5,
    is_available: product?.is_available ?? true,
    sort_order: product?.sort_order || 0
  });
  // Variants — stored as JSON array in products.variants column
  const [variants, setVariants] = useState(
    product?.variants || []
  );
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // --- Variant helpers ---
  function addVariant() {
    setVariants(prev => [...prev, { attribute: '', values: [{ label: '', extra_price: 0 }] }]);
  }

  function removeVariant(vi) {
    setVariants(prev => prev.filter((_, i) => i !== vi));
  }

  function updateVariantAttr(vi, value) {
    setVariants(prev => prev.map((v, i) => i === vi ? { ...v, attribute: value } : v));
  }

  function addVariantValue(vi) {
    setVariants(prev => prev.map((v, i) =>
      i === vi ? { ...v, values: [...v.values, { label: '', extra_price: 0 }] } : v
    ));
  }

  function removeVariantValue(vi, vvi) {
    setVariants(prev => prev.map((v, i) =>
      i === vi ? { ...v, values: v.values.filter((_, j) => j !== vvi) } : v
    ));
  }

  function updateVariantValue(vi, vvi, field, value) {
    setVariants(prev => prev.map((v, i) =>
      i === vi ? {
        ...v,
        values: v.values.map((val, j) =>
          j === vvi ? { ...val, [field]: field === 'extra_price' ? Number(value) : value } : val
        )
      } : v
    ));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      price: Number(form.price),
      tax_percent: Number(form.tax_percent),
      category_id: form.category_id || null,
      sort_order: Number(form.sort_order),
      variants: variants.length > 0 ? variants : null,
    });
    setSaving(false);
  }

  const tabs = [
    { id: 'general', label: 'General Info' },
    { id: 'variants', label: `Variants${variants.length > 0 ? ` (${variants.length})` : ''}` },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-scaleIn" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2 className="font-display text-xl font-bold">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button aria-label="Close modal" className="btn btn-ghost btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Tab Nav */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-subtle)', padding: '0 var(--space-6)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none', padding: 'var(--space-3) var(--space-4)',
                fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer',
                color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--text-tertiary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-accent)' : '2px solid transparent',
                marginBottom: -1, transition: 'color 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

            {/* ── GENERAL INFO TAB ── */}
            {activeTab === 'general' && (
              <>
                <div className="input-group">
                  <label className="input-label">Product Name <span className="required">*</span></label>
                  <input className="input-field" value={form.name} onChange={e => update('name', e.target.value)} required placeholder="e.g. Espresso Macchiato" />
                </div>

                <div className="input-group">
                  <label className="input-label">Image URL</label>
                  <div className="flex gap-4">
                    <div style={{ flex: 1 }}>
                      <input className="input-field" value={form.image_url} onChange={e => update('image_url', e.target.value)} placeholder="https://..." />
                      <p className="text-xs text-tertiary mt-1">Provide a high-quality product image link.</p>
                    </div>
                    {form.image_url && (
                      <div className="product-preview-thumb">
                        <img src={form.image_url} alt="Preview" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="input-group">
                    <label className="input-label">Price (₹) <span className="required">*</span></label>
                    <input className="input-field" type="number" step="0.01" value={form.price} onChange={e => update('price', e.target.value)} required placeholder="0.00" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Category</label>
                    <select className="select-field" value={form.category_id} onChange={e => update('category_id', e.target.value)}>
                      <option value="">Select</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="input-group">
                    <label className="input-label">Unit</label>
                    <select className="select-field" value={form.unit} onChange={e => update('unit', e.target.value)}>
                      <option value="piece">Piece</option>
                      <option value="cup">Cup</option>
                      <option value="plate">Plate</option>
                      <option value="kg">Kilogram</option>
                      <option value="glass">Glass</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Tax (%)</label>
                    <input className="input-field" type="number" step="0.1" value={form.tax_percent} onChange={e => update('tax_percent', e.target.value)} placeholder="5" />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Description</label>
                  <textarea className="textarea-field" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Brief description..." rows={2} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <input type="checkbox" id="is_available" checked={form.is_available} onChange={e => update('is_available', e.target.checked)} />
                  <label htmlFor="is_available" className="text-sm">In Stock / Available</label>
                </div>
              </>
            )}

            {/* ── VARIANTS TAB ── */}
            {activeTab === 'variants' && (
              <div>
                <div style={{ marginBottom: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Add product variants with different attributes (e.g. Size, Pack) and optional extra prices.
                    </p>
                  </div>
                  <button type="button" className="btn btn-accent btn-sm" onClick={addVariant} style={{ flexShrink: 0 }}>
                    <Plus size={14} /> Add Attribute
                  </button>
                </div>

                {variants.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: 'var(--space-8)', border: '2px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-xl)', color: 'var(--text-tertiary)'
                  }}>
                    <Package size={32} style={{ margin: '0 auto var(--space-3)', opacity: 0.4 }} />
                    <p className="text-sm">No variants yet.</p>
                    <p className="text-xs">Click "Add Attribute" to create variants like Pack (6 items, 12 items) with extra prices.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {variants.map((variant, vi) => (
                      <div key={vi} style={{
                        border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-4)', background: 'var(--surface-secondary)'
                      }}>
                        {/* Attribute Name Row */}
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                          <div className="input-group" style={{ flex: 1, margin: 0 }}>
                            <label className="input-label" style={{ fontSize: 'var(--text-xs)' }}>Attribute Name</label>
                            <input
                              className="input-field"
                              placeholder="e.g. Pack, Size, Sugar Level"
                              value={variant.attribute}
                              onChange={e => updateVariantAttr(vi, e.target.value)}
                            />
                          </div>
                          <button aria-label="Remove attribute" type="button" className="btn btn-ghost btn-icon btn-sm" style={{ marginTop: 20 }} onClick={() => removeVariant(vi)}>
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Values */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                          <label className="input-label" style={{ fontSize: 'var(--text-xs)' }}>Values</label>
                          {variant.values.map((val, vvi) => (
                            <div key={vvi} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 'var(--space-2)', alignItems: 'center' }}>
                              <input
                                className="input-field"
                                placeholder="e.g. 6 items, Small, No Sugar"
                                value={val.label}
                                onChange={e => updateVariantValue(vi, vvi, 'label', e.target.value)}
                                style={{ fontSize: 'var(--text-sm)' }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>+₹</span>
                                <input
                                  className="input-field"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={val.extra_price}
                                  onChange={e => updateVariantValue(vi, vvi, 'extra_price', e.target.value)}
                                  style={{ width: 80, fontSize: 'var(--text-sm)' }}
                                />
                              </div>
                              {variant.values.length > 1 && (
                                <button aria-label="Remove value" type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => removeVariantValue(vi, vvi)}>
                                  <X size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', fontSize: 'var(--text-xs)' }} onClick={() => addVariantValue(vi)}>
                            <Plus size={12} /> Add Value
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} disabled={saving}>
              {saving ? '' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

