import { useState, useEffect } from 'react';
import { Coffee, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './customer-display.css';

export default function CustomerDisplay() {
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | active | paid

  useEffect(() => {
    fetchLatestOrder();

    // Subscribe to real-time order updates
    const channel = supabase
      .channel('customer-display-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchLatestOrder();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchLatestOrder() {
    try {
      // Get the most recent active (unpaid) order
      const { data: activeOrder } = await supabase
        .from('orders')
        .select('*, tables(table_number), order_items(quantity, unit_price, products(name))')
        .in('status', ['confirmed', 'preparing', 'ready'])
        .eq('payment_status', 'unpaid')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (activeOrder) {
        const items = (activeOrder.order_items || []).map(item => ({
          name: item.products?.name || 'Item',
          qty: item.quantity,
          price: Number(item.unit_price) * item.quantity,
        }));

        setOrder({
          order_number: activeOrder.order_number,
          table: activeOrder.tables?.table_number,
          items,
          subtotal: Number(activeOrder.subtotal),
          tax: Number(activeOrder.tax_amount),
          total: Number(activeOrder.total),
        });
        setStatus('active');
      } else {
        // Check if there's a recently PAID order (last 60 seconds)
        const since = new Date(Date.now() - 60000).toISOString();
        const { data: paidOrder } = await supabase
          .from('orders')
          .select('*, tables(table_number), order_items(quantity, unit_price, products(name))')
          .eq('payment_status', 'paid')
          .gte('updated_at', since)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (paidOrder) {
          const items = (paidOrder.order_items || []).map(item => ({
            name: item.products?.name || 'Item',
            qty: item.quantity,
            price: Number(item.unit_price) * item.quantity,
          }));
          setOrder({
            order_number: paidOrder.order_number,
            table: paidOrder.tables?.table_number,
            items,
            subtotal: Number(paidOrder.subtotal),
            tax: Number(paidOrder.tax_amount),
            total: Number(paidOrder.total),
          });
          setStatus('paid');
          // After 8 seconds, go back to idle
          setTimeout(() => { setOrder(null); setStatus('idle'); }, 8000);
        } else {
          setOrder(null);
          setStatus('idle');
        }
      }
    } catch {
      // No active order — show idle screen
      setOrder(null);
      setStatus('idle');
    }
  }

  if (status === 'idle') {
    return (
      <div className="customer-display customer-idle" data-theme="dark">
        <div className="customer-welcome animate-fadeIn">
          <div className="customer-steam">
            <div className="steam steam-1" />
            <div className="steam steam-2" />
            <div className="steam steam-3" />
          </div>
          <Coffee size={72} className="customer-logo animate-float" />
          <h1 className="customer-welcome-title">Welcome to<br /><span>Odoo POS Cafe</span></h1>
          <p className="customer-welcome-sub">Your order will appear here moments after placing it</p>
          <div className="customer-idle-clock">
            <Clock size={16} />
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'paid') {
    return (
      <div className="customer-display customer-idle" data-theme="dark">
        <div className="customer-welcome animate-fadeIn">
          <CheckCircle2 size={80} className="customer-logo" style={{ color: 'var(--color-success)' }} />
          <h1 className="customer-welcome-title" style={{ color: 'var(--color-success)' }}>Payment Received!</h1>
          <p className="customer-welcome-sub" style={{ fontSize: 'var(--text-lg)' }}>
            Total: <strong>${order?.total?.toFixed(2)}</strong>
          </p>
          <p className="customer-welcome-sub" style={{ marginTop: 'var(--space-2)' }}>
            Thank you for dining with us! ☕
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-display customer-active" data-theme="dark">
      <header className="customer-header">
        <div className="customer-header-logo">
          <Coffee size={24} />
          <span>Odoo POS Cafe</span>
        </div>
        <div className="customer-status-badge badge badge-warning">
          Awaiting Payment
        </div>
      </header>

      <div className="customer-order-card animate-fadeInUp">
        <h2 className="customer-order-title">
          Your Order
          {order?.table && <span className="customer-table-badge">Table {order.table}</span>}
        </h2>
        <div className="customer-items">
          {order?.items.map((item, i) => (
            <div key={i} className="customer-item">
              <span className="customer-item-name">{item.qty}× {item.name}</span>
              <span className="customer-item-price font-mono">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="customer-totals">
          <div className="customer-total-row"><span>Subtotal</span><span className="font-mono">${order?.subtotal?.toFixed(2)}</span></div>
          <div className="customer-total-row"><span>Tax</span><span className="font-mono">${order?.tax?.toFixed(2)}</span></div>
          <div className="customer-total-row customer-total-final">
            <span>Total Due</span>
            <span className="font-mono">${order?.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="customer-wifi-note">
        <span>🔒 Secure transaction in progress</span>
      </div>
    </div>
  );
}
