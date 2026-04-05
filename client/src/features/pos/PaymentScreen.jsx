import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Banknote, CreditCard, QrCode, CheckCircle2, Printer, Download, Coffee } from 'lucide-react';

export default function PaymentScreen() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [cashTendered, setCashTendered] = useState('');
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);

  const iconMap = { cash: Banknote, digital: CreditCard, upi_qr: QrCode };
  const colorMap = { cash: 'var(--color-success)', digital: 'var(--color-info)', upi_qr: 'hsl(270, 60%, 55%)' };

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

  async function handlePay() {
    if (!selectedMethod) return;
    setPaying(true);

    try {
      // 1. Insert payment record
      await supabase.from('payments').insert({
        order_id: orderId,
        payment_method_id: selectedMethod,
        amount: total,
        status: 'completed',
      });

      // 2. Update order status to completed + paid
      await supabase.from('orders').update({
        status: 'completed',
        payment_status: 'paid',
      }).eq('id', orderId);

      // 3. Set table back to AVAILABLE (not occupied)
      if (order?.table_id) {
        await supabase.from('tables').update({ status: 'available' }).eq('id', order.table_id);
      }

      const method = paymentMethods.find(m => m.id === selectedMethod);
      setPaymentInfo({
        method: method?.name || 'Unknown',
        type: method?.type || 'cash',
        timestamp: new Date().toISOString(),
        cashTendered: method?.type === 'cash' ? Number(cashTendered) : null,
        change: method?.type === 'cash' ? Math.max(0, Number(cashTendered) - total) : null,
      });

      setPaying(false);
      setPaid(true);
    } catch (err) {
      console.error('Payment error:', err);
      setPaying(false);
      alert('Payment failed: ' + err.message);
    }
  }

  // Generate simple QR code SVG for UPI
  function generateQR(text) {
    const size = 21;
    const cells = [];
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isFTL = r < 7 && c < 7;
        const isFTR = r < 7 && c >= size - 7;
        const isFBL = r >= size - 7 && c < 7;
        if (isFTL || isFTR || isFBL) {
          const lr = isFTL ? r : isFTR ? r : r - (size - 7);
          const lc = isFTL ? c : isFTR ? c - (size - 7) : c;
          const isBorder = lr === 0 || lr === 6 || lc === 0 || lc === 6;
          const isInner = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
          if (isBorder || isInner) cells.push({ r, c });
          continue;
        }
        if (((hash * (r * size + c + 1)) >>> 0) % 100 < 42) cells.push({ r, c });
      }
    }
    const cs = 6, pad = 10, svgSize = size * cs + pad * 2;
    return (
      <svg viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ width: 160, height: 160 }}>
        <rect width={svgSize} height={svgSize} fill="white" rx="4" />
        {cells.map((cell, i) => <rect key={i} x={pad + cell.c * cs} y={pad + cell.r * cs} width={cs} height={cs} fill="#1a1614" rx={0.5} />)}
      </svg>
    );
  }

  // Receipt View
  if (paid && showReceipt) {
    const now = new Date(paymentInfo?.timestamp || Date.now());
    return (
      <div className="pos-payment-success" style={{ background: 'var(--neutral-950)' }}>
        <div style={{
          background: 'white', color: '#1a1614', width: '100%', maxWidth: 360, borderRadius: 16,
          padding: 'var(--space-6)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', position: 'relative'
        }}>
          {/* Receipt Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '2px dashed #ddd' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              <Coffee size={20} style={{ color: 'hsl(25, 75%, 42%)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'hsl(25, 75%, 42%)' }}>Odoo POS Cafe</span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: '#888' }}>123 Coffee Street, Downtown</p>
            <p style={{ fontSize: 'var(--text-xs)', color: '#888' }}>Tel: +1 (555) 123-4567</p>
          </div>

          {/* Receipt Meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)', fontSize: 'var(--text-xs)', color: '#888' }}>
            <span>Order #{String(order?.order_number || '').padStart(4, '0')}</span>
            <span>{order?.tables?.table_number ? `Table ${order.tables.table_number}` : '—'}</span>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: '#888', marginBottom: 'var(--space-4)' }}>
            {now.toLocaleDateString()} {now.toLocaleTimeString()}
          </div>

          {/* Items */}
          <div style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: 'var(--space-3) 0' }}>
            {orderItems.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>{item.products?.name} ×{item.quantity}</span>
                <span>${(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ padding: 'var(--space-3) 0', borderBottom: '2px dashed #ddd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#666' }}>
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#666' }}>
              <span>Tax</span><span>${taxAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: 700, fontSize: 'var(--text-lg)' }}>
              <span>TOTAL</span><span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div style={{ padding: 'var(--space-3) 0', fontSize: 'var(--text-xs)', color: '#888' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Payment Method</span><span>{paymentInfo?.method}</span>
            </div>
            {paymentInfo?.cashTendered && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cash Tendered</span><span>${paymentInfo.cashTendered.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#333' }}>
                  <span>Change</span><span>${paymentInfo.change.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: 'var(--space-4) 0', borderTop: '2px dashed #ddd', color: '#888', fontSize: 'var(--text-xs)' }}>
            <p style={{ marginBottom: 4 }}>Thank you for dining with us!</p>
            <p>See you again soon ☕</p>
          </div>

          {/* Actions */}
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

  // Payment Success Screen
  if (paid) {
    return (
      <div className="pos-payment-success">
        <div className="payment-success-card animate-bounceIn">
          <div className="payment-success-check">
            <CheckCircle2 size={80} strokeWidth={1.5} />
          </div>
          <h2 className="font-display">Payment Successful!</h2>
          <p className="font-mono text-2xl" style={{ color: 'var(--color-success)' }}>${total.toFixed(2)}</p>
          <p className="text-sm text-tertiary mt-2">via {paymentInfo?.method}</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button className="btn btn-secondary" onClick={() => setShowReceipt(true)}>
              <Printer size={16} /> View Receipt
            </button>
            <button className="btn btn-accent" onClick={() => navigate('/pos/tables')}>
              Back to Tables
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

  return (
    <div className="pos-payment-screen animate-fadeIn">
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
              <span className="font-mono">${(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="pos-payment-totals">
          <div className="pos-total-row"><span>Subtotal</span><span className="font-mono">${subtotal.toFixed(2)}</span></div>
          <div className="pos-total-row"><span>Tax</span><span className="font-mono">${taxAmount.toFixed(2)}</span></div>
          <div className="pos-total-row pos-total-final"><span>Total Due</span><span className="font-mono">${total.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="pos-payment-right">
        <h3 className="font-display text-xl font-bold mb-6">Select Payment Method</h3>

        <div className="pos-method-cards">
          {paymentMethods.map(method => {
            const Icon = iconMap[method.type] || CreditCard;
            const color = colorMap[method.type] || 'var(--color-primary)';
            return (
              <button
                key={method.id}
                className={`pos-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
                onClick={() => setSelectedMethod(method.id)}
                style={selectedMethod === method.id ? { borderColor: color, boxShadow: `0 0 20px ${color}33` } : {}}
              >
                <div className="pos-method-icon" style={{ background: `${color}15`, color }}>
                  <Icon size={28} />
                </div>
                <span className="pos-method-name">{method.name}</span>
              </button>
            );
          })}
        </div>

        {/* Cash Input */}
        {paymentMethods.find(m => m.id === selectedMethod)?.type === 'cash' && (
          <div className="pos-cash-input animate-fadeInUp">
            <label className="input-label" style={{ color: 'var(--neutral-400)' }}>Amount Tendered</label>
            <input
              className="input-field pos-cash-field"
              type="number"
              placeholder="0.00"
              value={cashTendered}
              onChange={e => setCashTendered(e.target.value)}
              autoFocus
            />
            {Number(cashTendered) >= total && (
              <p className="pos-cash-change">Change: <span className="font-mono font-bold">${(Number(cashTendered) - total).toFixed(2)}</span></p>
            )}
          </div>
        )}

        {/* UPI QR Code */}
        {paymentMethods.find(m => m.id === selectedMethod)?.type === 'upi_qr' && (
          <div className="animate-fadeInUp" style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
            <p style={{ color: 'var(--neutral-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>Scan QR Code to Pay</p>
            <div style={{ background: 'white', padding: 'var(--space-3)', borderRadius: 12, display: 'inline-block' }}>
              {generateQR(`upi://pay?pa=restaurant@ybl&am=${total.toFixed(2)}&cu=INR`)}
            </div>
            <p style={{ color: 'var(--neutral-600)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
              Amount: ${total.toFixed(2)}
            </p>
          </div>
        )}

        <button
          className={`btn btn-accent btn-xl btn-full mt-6 ${paying ? 'btn-loading' : ''}`}
          disabled={!selectedMethod || paying}
          onClick={handlePay}
        >
          {paying ? '' : `Validate Payment — $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
