import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { loadRazorpayScript } from '../../lib/razorpay';
import { ArrowLeft, Banknote, CheckCircle2, Printer, Coffee } from 'lucide-react';

export default function PaymentScreen() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [payingCash, setPayingCash] = useState(false);
  const [paid, setPaid] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showCashInput, setShowCashInput] = useState(false);
  const [cashTendered, setCashTendered] = useState('');
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => { fetchData(); }, [orderId]);

  async function fetchData() {
    try {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*, tables(table_number)')
        .eq('id', orderId)
        .single();
      if (orderData) setOrder(orderData);

      const { data: items } = await supabase
        .from('order_items')
        .select('*, products(name)')
        .eq('order_id', orderId);
      if (items) setOrderItems(items);

      const { data: methods } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_enabled', true);
      if (methods) setPaymentMethods(methods);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  const total = order ? Number(order.total) : 0;
  const subtotal = order ? Number(order.subtotal) : 0;
  const taxAmount = order ? Number(order.tax_amount) : 0;

  // ── Shared DB write ────────────────────────────────────────────────
  async function recordPaymentInDB(methodId, amount, transactionRef) {
    await supabase.from('payments').insert({
      order_id: orderId,
      payment_method_id: methodId,
      amount,
      status: 'completed',
      transaction_ref: transactionRef,
    });
    await supabase.from('orders').update({
      status: 'completed',
      payment_status: 'paid',
    }).eq('id', orderId);
  }

  // ── Razorpay flow ──────────────────────────────────────────────────
  async function handleRazorpayPay() {
    setPaying(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setPaying(false);
      alert('Failed to load Razorpay. Check your internet connection.');
      return;
    }

    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key || key === 'rzp_test_YOUR_KEY_HERE') {
      setPaying(false);
      alert('Razorpay Key ID not configured.\nSet VITE_RAZORPAY_KEY_ID in Vercel environment variables.');
      return;
    }

    const razorpayMethod = paymentMethods.find(m => m.type === 'razorpay');

    const options = {
      key,
      amount: Math.round(total * 100), // paise
      currency: 'INR',
      name: 'Odoo POS Cafe',
      description: `Table ${order?.tables?.table_number || ''} — Order #${String(order?.order_number || '').padStart(4, '0')}`,
      image: '/favicon.svg',
      handler: async function (response) {
        try {
          await recordPaymentInDB(razorpayMethod?.id, total, response.razorpay_payment_id);
          setPaymentInfo({
            method: 'Razorpay',
            type: 'razorpay',
            timestamp: new Date().toISOString(),
            razorpayId: response.razorpay_payment_id,
            cashTendered: null,
            change: null,
          });
          setPaying(false);
          setPaid(true);
        } catch (err) {
          console.error('Post-Razorpay DB error:', err);
          setPaying(false);
          alert('Payment captured but record failed: ' + err.message);
        }
      },
      prefill: { name: '', email: '', contact: '' },
      notes: {
        table: order?.tables?.table_number || '',
        order_id: orderId,
      },
      theme: { color: '#c97d2e' },
      modal: { ondismiss: () => setPaying(false) },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      setPaying(false);
      alert('Payment failed: ' + response.error.description);
    });
    rzp.open();
  }

  // ── Cash flow ──────────────────────────────────────────────────────
  async function handleCashPay() {
    setPayingCash(true);
    try {
      const cashMethod = paymentMethods.find(m => m.type === 'cash');
      await recordPaymentInDB(cashMethod?.id, total, null);
      setPaymentInfo({
        method: 'Cash',
        type: 'cash',
        timestamp: new Date().toISOString(),
        cashTendered: cashTendered ? Number(cashTendered) : null,
        change: cashTendered ? Math.max(0, Number(cashTendered) - total) : null,
      });
      setPayingCash(false);
      setPaid(true);
    } catch (err) {
      console.error('Cash payment error:', err);
      setPayingCash(false);
      alert('Payment failed: ' + err.message);
    }
  }

  // ── Clear table ────────────────────────────────────────────────────
  async function clearTable() {
    if (order?.table_id) {
      await supabase.from('tables').update({ status: 'available' }).eq('id', order.table_id);
    }
    navigate('/pos/tables');
  }

  // ── Receipt ────────────────────────────────────────────────────────
  if (paid && showReceipt) {
    const now = new Date(paymentInfo?.timestamp || Date.now());
    return (
      <div className="pos-payment-success" style={{ background: 'var(--neutral-950)' }}>
        <div style={{
          background: 'white', color: '#1a1614', width: '100%', maxWidth: 360, borderRadius: 16,
          padding: 'var(--space-6)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '2px dashed #ddd' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              <Coffee size={20} style={{ color: 'hsl(25, 75%, 42%)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'hsl(25, 75%, 42%)' }}>Odoo POS Cafe</span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: '#888' }}>123 Coffee Street, Downtown</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', color: '#888' }}>
            <span>Order #{String(order?.order_number || '').padStart(4, '0')}</span>
            <span>{order?.tables?.table_number ? `Table ${order.tables.table_number}` : '—'}</span>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: '#888', marginBottom: 'var(--space-4)' }}>
            {now.toLocaleDateString()} {now.toLocaleTimeString()}
          </div>

          <div style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: 'var(--space-3) 0' }}>
            {orderItems.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>{item.products?.name} ×{item.quantity}</span>
                <span>₹{(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: 'var(--space-3) 0', borderBottom: '2px dashed #ddd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#666' }}>
              <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#666' }}>
              <span>Tax</span><span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: 700, fontSize: 'var(--text-lg)' }}>
              <span>TOTAL</span><span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ padding: 'var(--space-3) 0', fontSize: 'var(--text-xs)', color: '#888' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Payment</span><span>{paymentInfo?.method}</span>
            </div>
            {paymentInfo?.razorpayId && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Transaction ID</span><span style={{ fontSize: 10 }}>{paymentInfo.razorpayId}</span>
              </div>
            )}
            {paymentInfo?.cashTendered && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cash Tendered</span><span>₹{paymentInfo.cashTendered.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#333' }}>
                  <span>Change</span><span>₹{paymentInfo.change.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <div style={{ textAlign: 'center', padding: 'var(--space-4) 0', borderTop: '2px dashed #ddd', color: '#888', fontSize: 'var(--text-xs)' }}>
            <p style={{ marginBottom: 4 }}>Thank you for dining with us!</p>
            <p>See you again soon ☕</p>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-4)' }}>
            <button className="btn btn-secondary btn-full btn-sm" onClick={() => window.print()}>
              <Printer size={14} /> Print
            </button>
            <button className="btn btn-accent btn-full btn-sm" onClick={() => navigate('/pos/tables')}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment Success ────────────────────────────────────────────────
  if (paid) {
    return (
      <div className="pos-payment-success">
        <div className="payment-success-card animate-bounceIn">
          <div className="payment-success-check">
            <CheckCircle2 size={80} strokeWidth={1.5} />
          </div>
          <h2 className="font-display">Payment Successful!</h2>
          <p className="font-mono text-2xl" style={{ color: 'var(--color-success)' }}>₹{total.toFixed(2)}</p>
          <p className="text-sm text-tertiary mt-2">via {paymentInfo?.method}</p>
          {order?.tables?.table_number && (
            <p className="text-sm mt-1" style={{ color: 'var(--neutral-400)' }}>
              Table {order.tables.table_number} — bill paid ✓
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-6)', width: '100%', maxWidth: 280 }}>
            <button className="btn btn-secondary" onClick={() => setShowReceipt(true)}>
              <Printer size={16} /> View Receipt
            </button>
            <button className="btn btn-accent" onClick={clearTable}>
              ✓ Clear Table &amp; Back
            </button>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-400)' }}
              onClick={() => navigate('/pos/tables')}
            >
              Back to Tables (keep occupied)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pos-payment-success">
        <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-accent)', borderRadius: '50%' }} />
      </div>
    );
  }

  // ── Main payment screen ────────────────────────────────────────────
  return (
    <div className="pos-payment-screen animate-fadeIn">
      {/* LEFT: Order Summary */}
      <div className="pos-payment-left">
        <button className="pos-back-btn mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> <span>Back to Order</span>
        </button>

        <h2 className="font-display text-2xl font-bold mb-2">Order Summary</h2>
        {order?.tables?.table_number && (
          <p className="text-sm text-secondary mb-6">Table {order.tables.table_number}</p>
        )}

        <div className="pos-payment-items">
          {orderItems.map(item => (
            <div key={item.id} className="pos-payment-item">
              <span>{item.products?.name} ×{item.quantity}</span>
              <span className="font-mono">₹{(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="pos-payment-totals">
          <div className="pos-total-row"><span>Subtotal</span><span className="font-mono">₹{subtotal.toFixed(2)}</span></div>
          <div className="pos-total-row"><span>Tax</span><span className="font-mono">₹{taxAmount.toFixed(2)}</span></div>
          <div className="pos-total-row pos-total-final"><span>Total Due</span><span className="font-mono">₹{total.toFixed(2)}</span></div>
        </div>
      </div>

      {/* RIGHT: Payment Options */}
      <div className="pos-payment-right">
        <h3 className="font-display text-xl font-bold mb-2">Payment</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--neutral-400)' }}>
          Total: <span className="font-mono font-bold" style={{ color: 'var(--color-accent)', fontSize: 'var(--text-lg)' }}>₹{total.toFixed(2)}</span>
        </p>

        {/* ── Razorpay Button (Primary) ── */}
        <button
          className={`btn btn-xl btn-full ${paying ? 'btn-loading' : ''}`}
          style={{
            background: 'linear-gradient(135deg, #072654 0%, #1a4a9e 100%)',
            color: '#fff',
            border: 'none',
            marginBottom: 'var(--space-3)',
            fontSize: 'var(--text-base)',
            letterSpacing: 0.3,
          }}
          disabled={paying || payingCash}
          onClick={handleRazorpayPay}
        >
          {paying ? '' : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M12.003 0L6.67 15.47h3.9L8.19 24l9.14-13.06h-4.13L17.336 0z"/>
              </svg>
              Pay ₹{total.toFixed(2)} via Razorpay
            </span>
          )}
        </button>

        {/* Test mode hint */}
        <div style={{
          padding: 'var(--space-3)',
          background: 'rgba(7,38,84,0.25)',
          border: '1px solid rgba(114,160,229,0.3)',
          borderRadius: 'var(--radius-lg)',
          fontSize: 'var(--text-xs)',
          marginBottom: 'var(--space-4)',
        }}>
          <p style={{ color: '#72a0e5', fontWeight: 600, marginBottom: 6 }}>🧪 Test Mode — Use any of these</p>
          <p style={{ color: 'var(--neutral-300)', marginBottom: 2 }}>
            <span style={{ color: 'var(--neutral-500)' }}>UPI (easiest):</span>{' '}
            <span style={{ fontFamily: 'monospace', color: '#90cdf4' }}>success@razorpay</span>
          </p>
          <p style={{ color: 'var(--neutral-300)', marginBottom: 2 }}>
            <span style={{ color: 'var(--neutral-500)' }}>Indian Card:</span>{' '}
            <span style={{ fontFamily: 'monospace', color: '#90cdf4' }}>5267 3181 8797 5449</span>
          </p>
          <p style={{ color: 'var(--neutral-400)' }}>Expiry: 12/26 &nbsp;|&nbsp; CVV: 123 &nbsp;|&nbsp; OTP: <span style={{ fontFamily: 'monospace', color: 'var(--neutral-200)' }}>1234</span></p>
        </div>


        {/* ── Divider ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-xs)' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* ── Cash Button ── */}
        {!showCashInput ? (
          <button
            className="btn btn-secondary btn-full"
            style={{ gap: 8 }}
            disabled={paying || payingCash}
            onClick={() => setShowCashInput(true)}
          >
            <Banknote size={18} /> Pay with Cash
          </button>
        ) : (
          <div className="animate-fadeInUp" style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-3)' }}>
              <Banknote size={16} style={{ color: 'var(--color-success)' }} />
              <span className="font-semibold text-sm">Cash Payment</span>
            </div>
            <label className="input-label" style={{ color: 'var(--neutral-400)' }}>Amount Tendered (₹)</label>
            <input
              className="input-field pos-cash-field"
              type="number"
              placeholder={total.toFixed(2)}
              value={cashTendered}
              onChange={e => setCashTendered(e.target.value)}
              autoFocus
              style={{ marginBottom: 'var(--space-2)' }}
            />
            {Number(cashTendered) >= total && (
              <p className="pos-cash-change">
                Change: <span className="font-mono font-bold">₹{(Number(cashTendered) - total).toFixed(2)}</span>
              </p>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setShowCashInput(false); setCashTendered(''); }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className={`btn btn-sm ${payingCash ? 'btn-loading' : ''}`}
                style={{ flex: 2, background: 'var(--color-success)', color: '#fff', border: 'none' }}
                disabled={payingCash || paying}
                onClick={handleCashPay}
              >
                {payingCash ? '' : `Confirm ₹${total.toFixed(2)} Cash`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
