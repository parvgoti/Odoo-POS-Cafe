import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Coffee, Clock, CheckCircle2, ChefHat, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './kitchen.css';

export default function KitchenDisplay() {
  const [tickets, setTickets] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [preparedItems, setPreparedItems] = useState({}); // { ticketId: Set<itemIndex> }
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();

    // Live timer
    const timerInterval = setInterval(() => setNow(Date.now()), 1000);

    // Supabase Realtime — listen for new kitchen tickets
    const channel = supabase
      .channel('kitchen-tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kitchen_tickets' }, () => {
        fetchTickets(); // Refresh on any change
      })
      .subscribe();

    return () => {
      clearInterval(timerInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchTickets() {
    try {
      const { data } = await supabase
        .from('kitchen_tickets')
        .select('*, orders(id, order_number, order_items(*, products(name)))')
        .order('created_at', { ascending: false })
        .limit(30);

      if (data) {
        const enriched = data.map(ticket => ({
          ...ticket,
          items: ticket.orders?.order_items?.map(item => ({
            name: item.products?.name || 'Unknown',
            quantity: item.quantity,
            notes: item.notes,
          })) || [],
          order_number: ticket.orders?.order_number || ticket.id.slice(0, 4),
        }));
        setTickets(enriched);
      }
    } catch (err) {
      console.error('Kitchen fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function advanceTicket(id) {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    let newStatus;
    if (ticket.status === 'to_cook') newStatus = 'preparing';
    else if (ticket.status === 'preparing') newStatus = 'completed';
    else return;

    // Optimistic update
    setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));

    const { error } = await supabase
      .from('kitchen_tickets')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Advance error:', error);
      fetchTickets(); // Rollback on error
    }

    // If completed, update order status too
    if (newStatus === 'completed' && ticket.orders?.id) {
      await supabase.from('orders').update({ status: 'ready' }).eq('id', ticket.orders.id);
    }
  }

  function toggleItemPrepared(ticketId, itemIndex) {
    setPreparedItems(prev => {
      const current = new Set(prev[ticketId] || []);
      if (current.has(itemIndex)) current.delete(itemIndex);
      else current.add(itemIndex);
      return { ...prev, [ticketId]: current };
    });
  }

  function formatElapsed(createdAt) {
    const seconds = Math.floor((now - new Date(createdAt).getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  const columns = [
    { key: 'to_cook', title: 'To Cook', icon: <Clock size={18} />, color: 'var(--color-warning)' },
    { key: 'preparing', title: 'Preparing', icon: <ChefHat size={18} />, color: 'var(--color-info)' },
    { key: 'completed', title: 'Completed', icon: <CheckCircle2 size={18} />, color: 'var(--color-success)' },
  ];

  return (
    <div className="kitchen-display" data-theme="dark">
      {/* Header */}
      <header className="kitchen-header">
        <div className="kitchen-header-left">
          <button className="pos-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
          </button>
          <ChefHat size={24} className="kitchen-logo" />
          <h1 className="kitchen-title">Kitchen Display</h1>
        </div>
        <div className="kitchen-header-right">
          <span className="kitchen-count">
            {tickets.filter(t => t.status !== 'completed').length} active orders
          </span>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="kitchen-board">
        {columns.map(col => (
          <div key={col.key} className="kitchen-column">
            <div className="kitchen-column-header" style={{ borderBottomColor: col.color }}>
              <div className="kitchen-col-title-wrap">
                <span style={{ color: col.color }}>{col.icon}</span>
                <span className="kitchen-col-title">{col.title}</span>
              </div>
              <span className="kitchen-col-count" style={{ background: `${col.color}22`, color: col.color }}>
                {tickets.filter(t => t.status === col.key).length}
              </span>
            </div>

            <div className="kitchen-tickets">
              {tickets.filter(t => t.status === col.key).map(ticket => (
                <div
                  key={ticket.id}
                  className={`kitchen-ticket animate-fadeInUp ${col.key === 'to_cook' ? 'ticket-urgent' : ''}`}
                  onClick={() => advanceTicket(ticket.id)}
                >
                  <div className="ticket-header">
                    <span className="ticket-order">#{String(ticket.order_number).padStart(4, '0')}</span>
                    <span className="ticket-table">Table {ticket.table_number}</span>
                  </div>
                  <div className="ticket-items">
                    {ticket.items.map((item, i) => {
                      const isDone = (preparedItems[ticket.id] || new Set()).has(i);
                      return (
                        <div
                          key={i}
                          className={`ticket-item ${isDone ? 'ticket-item-done' : ''}`}
                          onClick={e => { e.stopPropagation(); toggleItemPrepared(ticket.id, i); }}
                          title={isDone ? 'Click to unmark' : 'Click to mark as prepared'}
                        >
                          <span className="ticket-item-qty">{item.quantity}×</span>
                          <span className="ticket-item-name">{item.name}</span>
                          {item.notes && <span className="ticket-item-notes">{item.notes}</span>}
                          {isDone && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--color-success)', fontWeight: 700 }}>✓</span>}
                        </div>
                      );
                    })}
                    {ticket.items.length === 0 && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-600)' }}>Loading items...</p>
                    )}
                  </div>
                  <div className="ticket-footer">
                    <span className="ticket-time" style={{ color: col.color }}>
                      <Clock size={12} /> {formatElapsed(ticket.created_at)}
                    </span>
                    {col.key !== 'completed' && (
                      <span className="ticket-action">Tap to advance →</span>
                    )}
                  </div>
                </div>
              ))}

              {tickets.filter(t => t.status === col.key).length === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--neutral-700)' }}>
                  <p style={{ fontSize: 'var(--text-sm)' }}>No tickets</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
