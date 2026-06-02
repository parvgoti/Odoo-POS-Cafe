import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { loadRazorpayScript } from '../../lib/razorpay';
import {
  Coffee, Plus, Minus, Trash2, ArrowLeft, ChevronRight,
  Banknote, Printer,
  RotateCcw, Home, PartyPopper, Sparkles
} from 'lucide-react';
import './self-ordering.css';

/* ── Constants ─────────────────────────────────────────── */
const STEP = { TABLE: 'table', MENU: 'menu', CART: 'cart', PAYMENT: 'payment', RECEIPT: 'receipt', THANKS: 'thanks' };


/* ── INR formatter ─────────────────────────────────────── */
const inr = (v) => `₹${(+v).toFixed(2)}`;

export default function SelfOrderingMenu() {
  const [searchParams] = useSearchParams();
  const cursorRef = useRef(null);

  /* ── Data state ── */
  const [categories,     setCategories]     = useState([]);
  const [products,       setProducts]       = useState([]);
  const [tables,         setTables]         = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [upiId,          setUpiId]          = useState('123@ybl.com');
  const [loadingData,    setLoadingData]    = useState(true);

  /* ── Flow state ── */
  const [step,          setStep]          = useState(searchParams.get('table') ? STEP.MENU : STEP.TABLE);
  const [selectedTable, setSelectedTable] = useState(searchParams.get('table') || '');
  const [activeCategory,setActiveCategory]= useState('All');
  const [cart,          setCart]          = useState([]);
  const [placing,       setPlacing]       = useState(false);
  const [razorpayPaying,setRazorpayPaying]= useState(false);
  const [orderToken,    setOrderToken]    = useState(null);
  const [orderSummary,  setOrderSummary]  = useState(null);
  const [error,         setError]         = useState('');

  /* ── Cursor glow ── */
  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;
    const move = (e) => {
      el.style.left = e.clientX + 'px';
      el.style.top  = e.clientY + 'px';
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  /* ── Load tables only (for refresh) ── */
  const loadTables = useCallback(async () => {
    const { data } = await supabase.from('tables').select('*, floors(name)').order('table_number');
    if (data) setTables(data);
  }, []);

  /* ── Refresh tables when entering TABLE step ── */
  useEffect(() => {
    if (step === STEP.TABLE) loadTables();
  }, [step, loadTables]);

  /* ── Realtime table subscription ── */
  useEffect(() => {
    const ch = supabase
      .channel('so-tables-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, loadTables)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [loadTables]);

  /* ── Full initial load ── */
  useEffect(() => {
    async function loadAll() {
      try {
        const [
          { data: cats  },
          { data: prods },
          { data: tbls  },
          { data: pms   },
        ] = await Promise.all([
          supabase.from('categories').select('*').order('sort_order'),
          supabase.from('products').select('*, categories(id,name,emoji)').eq('is_available', true).order('sort_order'),
          supabase.from('tables').select('*, floors(name)').order('table_number'),
          supabase.from('payment_methods').select('*').eq('is_enabled', true),
        ]);
        if (cats) setCategories(cats);
        if (prods) setProducts(prods);
        if (tbls) setTables(tbls);
        if (pms && pms.length > 0) {
          setPaymentMethods(pms);
          const upi = pms.find(p => p.type === 'upi' || p.name?.toLowerCase().includes('upi'));
          const id = upi?.upi_id || upi?.config?.upi_id;
          if (id) setUpiId(id);
        } else {
          setPaymentMethods([]);
        }
      } catch (e) {
        console.error(e);
        setPaymentMethods([]);
      } finally {
        setLoadingData(false);
      }
    }
    loadAll();
  }, []);

  /* ── Cart helpers ── */
  const allCats  = ['All', ...categories.map(c => c.name)];
  const filtered = activeCategory === 'All' ? products : products.filter(p => p.categories?.name === activeCategory);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax       = subtotal * 0.05;
  const total     = subtotal + tax;

  function addToCart(p) {
    setCart(prev => {
      const ex = prev.find(x => x.id === p.id);
      if (ex) return prev.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { id: p.id, name: p.name, price: +p.price, qty: 1, emoji: p.categories?.emoji, img: p.image_url }];
    });
  }

  function changeQty(id, delta) {
    setCart(prev => prev.map(x => x.id === id ? { ...x, qty: Math.max(0, x.qty + delta) } : x).filter(x => x.qty > 0));
  }

  /* ── Core order creation (shared by both payment paths) ── */
  async function placeOrderCore(transactionRef, methodName, methodId) {
    const { data: tbl } = await supabase.from('tables').select('id')
      .or(`table_number.eq.${selectedTable},table_number.eq."${selectedTable}"`).maybeSingle();
    const { data: last } = await supabase.from('orders').select('order_number')
      .order('order_number', { ascending: false }).limit(1).maybeSingle();
    const nextNum = (last?.order_number || 0) + 1;

    const { data: order, error: oErr } = await supabase.from('orders').insert({
      table_id: tbl?.id || null,
      order_number: nextNum, status: 'confirmed',
      subtotal: +subtotal.toFixed(2), tax_amount: +tax.toFixed(2),
      total: +total.toFixed(2), discount_amount: 0,
      payment_status: transactionRef ? 'paid' : 'unpaid',
      is_self_order: true,
    }).select().single();
    if (oErr) throw oErr;

    await supabase.from('order_items').insert(
      cart.map(i => ({ order_id: order.id, product_id: i.id, quantity: i.qty, unit_price: i.price }))
    );
    if (tbl?.id) await supabase.from('tables').update({ status: 'occupied' }).eq('id', tbl.id);
    try { await supabase.from('kitchen_tickets').insert({ order_id: order.id, table_number: String(selectedTable || 'Self-Order'), status: 'to_cook' }); } catch (_) {}

    if (methodId && transactionRef !== undefined) {
      try {
        await supabase.from('payments').insert({
          order_id: order.id,
          payment_method_id: methodId,
          amount: +total.toFixed(2),
          status: 'completed',
          transaction_ref: transactionRef,
        });
      } catch (_) {}
    }

    setOrderSummary({ items: [...cart], subtotal, tax, total, table: selectedTable, method: methodName, orderNum: nextNum });
    setOrderToken(nextNum);
    setCart([]);
    setStep(STEP.RECEIPT);
  }

  /* ── Cash: place order immediately ── */
  async function handleCashOrder() {
    if (cart.length === 0 || placing) return;
    setError(''); setPlacing(true);
    try {
      const cashMethod = paymentMethods.find(p => p.type === 'cash');
      await placeOrderCore(null, 'Cash', cashMethod?.id);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  /* ── Razorpay: open modal then place order on success ── */
  async function handleRazorpayOrder() {
    if (cart.length === 0 || razorpayPaying) return;
    setError('');
    setRazorpayPaying(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setRazorpayPaying(false);
      setError('Failed to load Razorpay. Check your internet connection.');
      return;
    }

    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key || key === 'rzp_test_YOUR_KEY_HERE') {
      setRazorpayPaying(false);
      setError('Razorpay Key ID not configured.');
      return;
    }

    const razorpayMethod = paymentMethods.find(p => p.type === 'razorpay');

    const options = {
      key,
      amount: Math.round(total * 100),
      currency: 'INR',
      name: 'Odoo POS Cafe',
      description: `Table ${selectedTable} — Self Order`,
      image: '/favicon.svg',
      handler: async function (response) {
        try {
          await placeOrderCore(response.razorpay_payment_id, 'Razorpay', razorpayMethod?.id);
          setRazorpayPaying(false);
        } catch (e) {
          console.error(e);
          setRazorpayPaying(false);
          setError('Payment done but order failed: ' + e.message);
        }
      },
      prefill: { name: '', email: '', contact: '' },
      notes: { table: String(selectedTable) },
      theme: { color: '#c97d2e' },
      modal: { ondismiss: () => setRazorpayPaying(false) },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (res) => {
      setRazorpayPaying(false);
      setError('Payment failed: ' + res.error.description);
    });
    rzp.open();
  }

  function resetAll() {
    setStep(STEP.TABLE);
    setSelectedTable(''); setCart([]); setRazorpayPaying(false);
    setOrderToken(null); setOrderSummary(null); setActiveCategory('All'); setError('');
  }

  /* ══════════════════════════════════════════════
     STEP 1 — Table Selection
  ══════════════════════════════════════════════ */
  if (step === STEP.TABLE) return (
    <div className="so-screen so-dark-bg">
      <div ref={cursorRef} className="so-cursor-glow" />
      <div className="so-table-screen so-animate-in">
        <div className="so-brand">
          <div className="so-brand-icon">
            <Coffee size={34} />
            <div className="so-brand-ring" />
          </div>
          <h1 className="so-brand-name">Odoo POS Cafe</h1>
          <p className="so-brand-tag">✨ Self Order · Dine In</p>
        </div>

        <div className="so-step-heading">
          <h2>Select Your Table</h2>
          <p>Tap the table number where you're seated</p>
        </div>

        {loadingData ? (
          <div className="so-table-grid">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div className="so-table-grid stagger-in">
            {tables.map((t, idx) => {
              const busy = t.status === 'occupied';
              const sel  = String(selectedTable) === String(t.table_number);
              return (
                <button
                  key={t.id}
                  className={`so-table-card ${sel ? 'selected' : ''} ${busy ? 'busy' : ''}`}
                  onClick={() => !busy && setSelectedTable(t.table_number)}
                  style={{ '--delay': `${idx * 0.04}s` }}
                  title={busy ? 'Table occupied' : `Select Table ${t.table_number}`}
                >
                  {busy && <span className="so-busy-pill">Busy</span>}
                  {sel  && <span className="so-selected-glow" />}
                  <span className="so-table-num">{t.table_number}</span>
                  <span className="so-table-sub">{t.floors?.name || 'Floor'}</span>
                </button>
              );
            })}
          </div>
        )}

        {selectedTable && (
          <button className="so-cta-btn so-cta-btn--full so-cta-pulse" onClick={() => setStep(STEP.MENU)}>
            <Sparkles size={18} /> Continue to Menu <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════
     STEP 2 — Menu
  ══════════════════════════════════════════════ */
  if (step === STEP.MENU) return (
    <div className="so-menu-root">
      <div ref={cursorRef} className="so-cursor-glow" />

      <header className="so-menu-header">
        <div className="so-menu-logo"><Coffee size={20} /><span>Odoo POS Cafe</span></div>
        {selectedTable && <span className="so-table-chip">🪑 Table {selectedTable}</span>}
      </header>

      <div className="so-cats-bar">
        {allCats.map(cat => {
          const obj = categories.find(c => c.name === cat);
          return (
            <button key={cat} className={`so-cat-pill ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
              {obj?.emoji && <span>{obj.emoji}</span>} {cat}
            </button>
          );
        })}
      </div>

      <div className="so-products-grid" style={{ paddingBottom: cartCount > 0 ? 96 : 24 }}>
        {loadingData
          ? [...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 18 }} />)
          : filtered.map((p, idx) => {
            const inCart = cart.find(c => c.id === p.id);
            return (
              <div key={p.id} className="so-product-card so-card-hover" style={{ '--delay': `${idx * 0.05}s`, animationDelay: `${idx * 0.05}s` }}>
                <div className="so-product-img" onClick={() => addToCart(p)}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} loading="lazy" />
                    : <span className="so-product-emoji">{p.categories?.emoji || '🍽️'}</span>}
                  {inCart && <div className="so-qty-badge so-badge-pop">{inCart.qty}</div>}
                  <div className="so-product-overlay">
                    <span>+ Add</span>
                  </div>
                </div>
                <div className="so-product-body">
                  <div className="so-product-name">{p.name}</div>
                  {p.description && <div className="so-product-desc">{p.description}</div>}
                  <div className="so-product-footer">
                    <span className="so-product-price">{inr(p.price)}</span>
                    {inCart ? (
                      <div className="so-qty-row">
                        <button className="so-qty-btn minus" onClick={() => changeQty(p.id, -1)}><Minus size={13} /></button>
                        <span className="so-qty-val">{inCart.qty}</span>
                        <button className="so-qty-btn plus"  onClick={() => addToCart(p)}><Plus size={13} /></button>
                      </div>
                    ) : (
                      <button className="so-add-btn" onClick={() => addToCart(p)}><Plus size={18} /></button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>

      {cartCount > 0 && (
        <div className="so-cart-float so-cart-float--bounce" onClick={() => setStep(STEP.CART)}>
          <div className="so-cart-float-left">
            <span className="so-cart-float-badge so-badge-pop">{cartCount}</span>
            <span>View Cart</span>
          </div>
          <span className="so-cart-float-total">{inr(total)}</span>
        </div>
      )}
    </div>
  );

  /* ══════════════════════════════════════════════
     STEP 3 — Cart
  ══════════════════════════════════════════════ */
  if (step === STEP.CART) return (
    <div className="so-inner-screen so-animate-slide-up">
      <div className="so-inner-header">
        <button className="so-back-btn" onClick={() => setStep(STEP.MENU)}><ArrowLeft size={20} /></button>
        <h2>Your Order</h2>
        <span className="so-table-chip">Table {selectedTable}</span>
      </div>

      <div className="so-inner-body">
        <div className="so-cart-list stagger-in">
          {cart.map((item, idx) => (
            <div key={item.id} className="so-cart-row" style={{ '--delay': `${idx * 0.06}s` }}>
              <div className="so-cart-thumb">
                {item.img ? <img src={item.img} alt={item.name} /> : <span>{item.emoji || '🍽️'}</span>}
              </div>
              <div className="so-cart-info">
                <div className="so-cart-name">{item.name}</div>
                <div className="so-cart-price">{inr(item.price * item.qty)}</div>
                <div className="so-cart-unit">{inr(item.price)} × {item.qty}</div>
              </div>
              <div className="so-cart-qty-ctrl">
                <button className="so-qty-btn minus" onClick={() => changeQty(item.id, -1)}><Minus size={13} /></button>
                <span className="so-qty-val">{item.qty}</span>
                <button className="so-qty-btn plus"  onClick={() => changeQty(item.id, +1)}><Plus size={13} /></button>
                <button className="so-qty-btn del"   onClick={() => changeQty(item.id, -item.qty)}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="so-bill-box so-animate-in">
          <div className="so-bill-row"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
          <div className="so-bill-row"><span>GST (5%)</span><span>{inr(tax)}</span></div>
          <div className="so-bill-row so-bill-total"><span>Total</span><span>{inr(total)}</span></div>
        </div>
      </div>

      <div className="so-inner-footer">
        <button className="so-cta-btn so-cta-btn--full" disabled={cart.length === 0} onClick={() => setStep(STEP.PAYMENT)}>
          Choose Payment <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════
     STEP 4 — Payment
  ══════════════════════════════════════════════ */
  if (step === STEP.PAYMENT) {
    const isWorking = razorpayPaying || placing;
    return (
      <div className="so-inner-screen so-animate-slide-up">
        <div className="so-inner-header">
          <button className="so-back-btn" onClick={() => setStep(STEP.CART)}><ArrowLeft size={20} /></button>
          <h2>Payment</h2>
          <span className="so-amount-chip">{inr(total)}</span>
        </div>

        <div className="so-inner-body--scroll">
          {/* Amount card */}
          <div className="so-amount-card so-glass-shine">
            <div className="so-amount-label">AMOUNT TO PAY</div>
            <div className="so-amount-value">{inr(total)}</div>
            <div className="so-amount-meta">Table {selectedTable} · {cartCount} item{cartCount !== 1 ? 's' : ''}</div>
          </div>

          {/* ── Razorpay Button (Primary) ── */}
          <button
            onClick={handleRazorpayOrder}
            disabled={isWorking}
            style={{
              width: '100%', marginTop: 20,
              padding: '16px 20px',
              background: razorpayPaying
                ? 'rgba(7,38,84,0.5)'
                : 'linear-gradient(135deg, #072654 0%, #1a4a9e 100%)',
              color: '#fff', border: 'none', borderRadius: 16,
              fontSize: 16, fontWeight: 700, cursor: isWorking ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s',
            }}
          >
            {razorpayPaying ? (
              <><span className="so-spinner" /> Opening Razorpay…</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M12.003 0L6.67 15.47h3.9L8.19 24l9.14-13.06h-4.13L17.336 0z"/>
                </svg>
                Pay {inr(total)} via Razorpay
              </>
            )}
          </button>

          {/* Test mode hint */}
          <div style={{
            margin: '12px 0 8px',
            padding: '10px 14px',
            background: 'rgba(7,38,84,0.2)',
            border: '1px solid rgba(114,160,229,0.25)',
            borderRadius: 12,
            fontSize: 12,
          }}>
            <p style={{ color: '#72a0e5', fontWeight: 600, marginBottom: 4 }}>🧪 Test Mode</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>
              UPI: <span style={{ fontFamily: 'monospace', color: '#90cdf4' }}>success@razorpay</span>
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              Card: <span style={{ fontFamily: 'monospace', color: '#90cdf4' }}>5267 3181 8797 5449</span>
              &nbsp;·&nbsp; CVV: 123 &nbsp;·&nbsp; OTP: 1234
            </p>
          </div>

          {/* OR divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* ── Cash Button (Secondary) ── */}
          <button
            onClick={handleCashOrder}
            disabled={isWorking}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff', border: '1.5px solid rgba(255,255,255,0.15)',
              borderRadius: 16, fontSize: 15, fontWeight: 600,
              cursor: isWorking ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s',
            }}
          >
            {placing ? (
              <><span className="so-spinner" /> Placing Order…</>
            ) : (
              <><Banknote size={18} style={{ color: '#22c55e' }} /> Pay with Cash at Table</>
            )}
          </button>

          {error && <div className="so-error-box so-animate-in" style={{ marginTop: 12 }}>{error}</div>}
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     STEP 5 — Receipt
  ══════════════════════════════════════════════ */
  if (step === STEP.RECEIPT && orderSummary) {
    const tokenStr = String(orderToken || '?').padStart(3, '0');
    return (
      <div className="so-inner-screen so-receipt-screen so-animate-slide-up">
        <div className="so-inner-header so-inner-header--dark">
          <span />
          <h2>Receipt</h2>
          <span />
        </div>

        <div className="so-inner-body--scroll">
          <div className="so-receipt-card so-animate-in">
            <div className="so-receipt-head">
              <div className="so-receipt-brand"><Coffee size={24} /> Odoo POS Cafe</div>
              <div className="so-receipt-dots">· · · · · · · · · ·</div>
              <div className="so-receipt-meta">
                <span>Table {orderSummary.table}</span>
                <span>·</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>·</span>
                <span>{new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div className="so-receipt-token-box so-token-glow">
              <div className="so-receipt-token-label">ORDER TOKEN</div>
              <div className="so-receipt-token-num">#{tokenStr}</div>
              <div className="so-receipt-token-note">Show this to your server</div>
            </div>

            <div className="so-receipt-items">
              <div className="so-receipt-items-head"><span>Item</span><span>Qty</span><span>Price</span></div>
              {orderSummary.items.map((item, i) => (
                <div key={i} className="so-receipt-item">
                  <span>{item.emoji} {item.name}</span>
                  <span>×{item.qty}</span>
                  <span>{inr(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <div className="so-receipt-totals">
              <div className="so-receipt-row"><span>Subtotal</span><span>{inr(orderSummary.subtotal)}</span></div>
              <div className="so-receipt-row"><span>GST (5%)</span><span>{inr(orderSummary.tax)}</span></div>
              <div className="so-receipt-row so-receipt-grand"><span>Total</span><span>{inr(orderSummary.total)}</span></div>
            </div>

            <div className="so-receipt-pm-row">
              <span>Paid via</span>
              <span className="so-receipt-pm-badge">{orderSummary.method}</span>
            </div>

            <div className="so-receipt-thank">
              Thank you for dining with us! 🙏<br />
              Your order is being prepared in the kitchen.
            </div>
          </div>
        </div>

        <div className="so-inner-footer so-inner-footer--two">
          <button className="so-outline-btn" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
          <button className="so-cta-btn" onClick={() => setStep(STEP.THANKS)}>
            Done <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     STEP 6 — Thank You  🎉
  ══════════════════════════════════════════════ */
  if (step === STEP.THANKS) {
    const tokenStr = String(orderToken || '?').padStart(3, '0');
    return (
      <div className="so-screen so-dark-bg so-thanks-screen">
        {/* Animated confetti */}
        {[...Array(24)].map((_, i) => (
          <div key={i} className="so-confetti-dot" style={{ '--i': i, '--hue': (i * 15) % 360 }} />
        ))}

        {/* Floating orbs */}
        <div className="so-orb so-orb-1" /><div className="so-orb so-orb-2" /><div className="so-orb so-orb-3" />

        <div className="so-thanks-card so-animate-scale-in">
          <div className="so-thanks-icon so-icon-float">
            <PartyPopper size={44} />
            <div className="so-icon-ring" />
          </div>

          <h1 className="so-thanks-title">Thank You! 🎉</h1>
          <p className="so-thanks-msg">
            Order <b>#{tokenStr}</b> is confirmed<br />
            and being prepared in the kitchen.
          </p>

          <div className="so-thanks-token so-token-shine">
            <div className="so-thanks-token-label">YOUR TOKEN</div>
            <div className="so-thanks-token-num">#{tokenStr}</div>
          </div>

          <p className="so-thanks-table">
            Sit back &amp; relax 😊<br />
            Our staff will serve you at <b>Table {orderSummary?.table}</b>
          </p>

          <div className="so-thanks-actions stagger-in">
            <button className="so-thanks-btn so-thanks-btn--primary" onClick={() => { setCart([]); setSelectedPmId(null); setStep(STEP.MENU); }}>
              <RotateCcw size={17} /> Order More
            </button>
            <button className="so-thanks-btn so-thanks-btn--outline" onClick={() => setStep(STEP.RECEIPT)}>
              <Printer size={17} /> View Receipt
            </button>
            <button className="so-thanks-btn so-thanks-btn--ghost" onClick={resetAll}>
              <Home size={17} /> Exit / New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
