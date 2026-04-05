import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getActiveSessionId } from '../sessions/SessionPage';
import { ArrowLeft, Minus, Plus, Trash2, Send, CreditCard } from 'lucide-react';

export default function OrderScreen() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [orderSent, setOrderSent] = useState(false);
  const [tableInfo, setTableInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [tableId]);

  async function fetchData() {
    try {
      // Fetch table info
      const { data: table } = await supabase.from('tables').select('*').eq('id', tableId).single();
      if (table) setTableInfo(table);

      // Fetch categories
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
      if (cats) setCategories(cats);

      // Fetch products
      const { data: prods } = await supabase
        .from('products')
        .select('*, categories(id, name, emoji)')
        .eq('is_available', true)
        .order('sort_order');
      if (prods) setProducts(prods);

      // Check existing draft order for this table
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name, price))')
        .eq('table_id', tableId)
        .in('status', ['draft', 'confirmed'])
        .single();

      if (existingOrder) {
        setOrderId(existingOrder.id);
        // Restore cart from existing order items
        const restoredCart = (existingOrder.order_items || []).map(item => ({
          id: item.product_id,
          name: item.products?.name,
          price: Number(item.unit_price),
          quantity: item.quantity,
          order_item_id: item.id,
        }));
        setCart(restoredCart);
      }
    } catch (err) {
      console.error('Error loading order data:', err);
    } finally {
      setLoading(false);
    }
  }

  const allCategories = [{ id: 'all', name: 'All' }, ...categories];
  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.categories?.name === activeCategory);

  function addToCart(product) {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { id: product.id, name: product.name, price: Number(product.price), quantity: 1, emoji: product.categories?.emoji }];
    });
  }

  function updateQuantity(id, delta) {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  }

  function removeItem(id) {
    setCart(prev => prev.filter(item => item.id !== id));
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  async function handleSendToKitchen() {
    try {
      let currentOrderId = orderId;
      const sessionId = getActiveSessionId();

      // Create order if new
      if (!currentOrderId) {
        const orderPayload = {
          table_id: tableId,
          status: 'confirmed',
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax_amount: parseFloat(tax.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          discount_amount: 0,
          payment_status: 'unpaid',
        };

        // Link to active session if available
        if (sessionId) {
          orderPayload.session_id = sessionId;
        }

        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert(orderPayload)
          .select()
          .single();

        if (orderError) throw orderError;
        currentOrderId = newOrder.id;
        setOrderId(currentOrderId);
      } else {
        // Update existing order totals
        const updatePayload = {
          status: 'confirmed',
          subtotal,
          tax_amount: tax,
          total,
        };

        // Ensure session linkage on existing orders too
        const sessionId = getActiveSessionId();
        if (sessionId) {
          updatePayload.session_id = sessionId;
        }

        await supabase.from('orders').update(updatePayload).eq('id', currentOrderId);

        // Clear old items
        await supabase.from('order_items').delete().eq('order_id', currentOrderId);
      }

      // Insert order items
      const orderItems = cart.map(item => ({
        order_id: currentOrderId,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      await supabase.from('order_items').insert(orderItems);

      // Mark table as occupied
      await supabase.from('tables').update({ status: 'occupied' }).eq('id', tableId);

      // Create kitchen ticket
      await supabase.from('kitchen_tickets').insert({
        order_id: currentOrderId,
        table_number: tableInfo?.table_number || '',
        status: 'to_cook',
      });

      setOrderSent(true);
      setTimeout(() => setOrderSent(false), 2000);
    } catch (err) {
      console.error('Error sending to kitchen:', err);
      alert('Error: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="pos-order-screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-accent)', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div className="pos-order-screen">
      {/* LEFT: Products */}
      <div className="pos-products-panel">
        <div className="pos-products-header">
          <button className="pos-back-btn" onClick={() => navigate('/pos/tables')}>
            <ArrowLeft size={18} />
          </button>
          <h2 className="pos-table-label">Table {tableInfo?.table_number || '?'}</h2>
        </div>

        {/* Category Tabs */}
        <div className="pos-category-tabs">
          {allCategories.map(cat => (
            <button key={cat.id || cat.name} className={`pos-cat-tab ${activeCategory === cat.name ? 'active' : ''}`} onClick={() => setActiveCategory(cat.name)}>
              {cat.emoji && <span>{cat.emoji} </span>}{cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="pos-product-grid">
          {filteredProducts.map(product => (
            <button key={product.id} className="pos-product-item hover-lift press-effect" onClick={() => addToCart(product)}>
              {product.image_url ? (
                <div className="pos-product-image-wrap">
                  <img src={product.image_url} alt={product.name} loading="lazy" />
                </div>
              ) : (
                <span className="pos-product-emoji">{product.categories?.emoji || '🍽️'}</span>
              )}
              <span className="pos-product-name">{product.name}</span>
              <span className="pos-product-price">${Number(product.price).toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="pos-cart-panel">
        <div className="pos-cart-header">
          <h3>Current Order</h3>
          <span className="badge badge-accent">{itemCount} items</span>
        </div>

        <div className="pos-cart-items">
          {cart.length === 0 ? (
            <div className="pos-cart-empty">
              <span className="pos-cart-empty-emoji">🛒</span>
              <p>Cart is empty</p>
              <p className="text-xs text-tertiary">Tap products to add</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="pos-cart-item animate-fadeInRight">
                <div className="pos-cart-item-info">
                  <span className="pos-cart-item-name">{item.name}</span>
                  <span className="pos-cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="pos-cart-item-actions">
                  <button className="pos-qty-btn" onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                  <span className="pos-qty-value">{item.quantity}</span>
                  <button className="pos-qty-btn" onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                  <button className="pos-remove-btn" onClick={() => removeItem(item.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        {cart.length > 0 && (
          <div className="pos-cart-totals">
            <div className="pos-total-row"><span>Subtotal</span><span className="font-mono">${subtotal.toFixed(2)}</span></div>
            <div className="pos-total-row"><span>Tax (5%)</span><span className="font-mono">${tax.toFixed(2)}</span></div>
            <div className="pos-total-row pos-total-final"><span>Total</span><span className="font-mono">${total.toFixed(2)}</span></div>

            <div className="pos-cart-actions">
              <button className={`btn btn-secondary btn-full ${orderSent ? 'btn-success' : ''}`} onClick={handleSendToKitchen}>
                <Send size={16} /> {orderSent ? 'Sent! ✓' : 'Send to Kitchen'}
              </button>
              <button className="btn btn-accent btn-full" onClick={() => orderId && navigate(`/pos/payment/${orderId}`)}>
                <CreditCard size={16} /> Pay ${total.toFixed(2)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
