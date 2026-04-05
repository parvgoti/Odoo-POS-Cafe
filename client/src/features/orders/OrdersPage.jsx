import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDateTime, formatRelativeTime, formatOrderNumber } from '../../lib/formatters';
import { Search, Filter, X, ShoppingBag, Clock, CreditCard, MapPin, FileText } from 'lucide-react';
import './orders.css';

const statusConfig = {
  draft: { label: 'Draft', class: 'badge-neutral' },
  confirmed: { label: 'Confirmed', class: 'badge-warning' },
  preparing: { label: 'Preparing', class: 'badge-warning' },
  ready: { label: 'Ready', class: 'badge-info' },
  completed: { label: 'Completed', class: 'badge-success' },
  cancelled: { label: 'Cancelled', class: 'badge-danger' },
};

const paymentConfig = {
  unpaid: { label: 'Unpaid', class: 'badge-danger' },
  partial: { label: 'Partial', class: 'badge-warning' },
  paid: { label: 'Paid', class: 'badge-success' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 15;

  useEffect(() => { fetchOrders(); }, [statusFilter, page]);

  async function fetchOrders() {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*, tables(table_number, floors(name))', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, count, error } = await query;
      if (error) throw error;
      if (data) setOrders(data);
      if (count !== null) setTotalCount(count);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }

  async function openOrderDetail(order) {
    setSelectedOrder(order);
    try {
      const { data } = await supabase
        .from('order_items')
        .select('*, products(name, price)')
        .eq('order_id', order.id);
      if (data) setOrderItems(data);
    } catch (err) {
      console.error('Error:', err);
    }
  }

  const filteredOrders = orders.filter(o => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const orderNum = String(o.order_number || '').padStart(4, '0');
    return orderNum.includes(searchLower) ||
      o.tables?.table_number?.toLowerCase()?.includes(searchLower) ||
      o.status.includes(searchLower);
  });

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="orders-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{totalCount} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="orders-filters">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            placeholder="Search by order # or table..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="orders-status-filters">
          {['all', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              className={`orders-status-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => { setStatusFilter(status); setPage(1); }}
            >
              {status === 'all' ? 'All' : statusConfig[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="orders-table-wrap">
          <div style={{ padding: 'var(--space-4)' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />
            ))}
          </div>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Table</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody className="stagger-children">
              {filteredOrders.map(order => (
                <tr key={order.id} onClick={() => openOrderDetail(order)}>
                  <td>
                    <span className="order-row-number">
                      {formatOrderNumber(order.order_number || order.id.slice(0, 4))}
                    </span>
                  </td>
                  <td>
                    <div className="order-row-table">
                      <MapPin size={14} className="text-tertiary" />
                      {order.tables?.table_number ? `Table ${order.tables.table_number}` : '—'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${statusConfig[order.status]?.class || 'badge-neutral'}`}>
                      {statusConfig[order.status]?.label || order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${paymentConfig[order.payment_status]?.class || 'badge-neutral'}`}>
                      {paymentConfig[order.payment_status]?.label || order.payment_status}
                    </span>
                  </td>
                  <td className="font-mono font-semibold">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="text-secondary text-sm">
                    {formatRelativeTime(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="orders-empty">
          <ShoppingBag size={56} className="orders-empty-icon" />
          <h3 className="font-display text-xl font-semibold mb-2">No orders found</h3>
          <p>No orders match your current filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="orders-pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page - 2 + i;
            if (p > totalPages) return null;
            return (
              <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>
                {p}
              </button>
            );
          })}
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="order-detail-modal" onClick={() => setSelectedOrder(null)}>
          <div className="order-detail-overlay" />
          <div className="order-detail-content animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="order-detail-header">
              <div>
                <h2 className="font-display text-xl font-bold">
                  Order {formatOrderNumber(selectedOrder.order_number || selectedOrder.id.slice(0, 4))}
                </h2>
                <span className={`badge ${statusConfig[selectedOrder.status]?.class || 'badge-neutral'}`}>
                  {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                </span>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="order-detail-body">
              {/* Meta Info */}
              <div className="order-detail-meta">
                <div className="order-detail-meta-item">
                  <span className="order-detail-meta-label">
                    <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Table
                  </span>
                  <span className="order-detail-meta-value">
                    {selectedOrder.tables?.table_number ? `Table ${selectedOrder.tables.table_number}` : '—'}
                  </span>
                </div>
                <div className="order-detail-meta-item">
                  <span className="order-detail-meta-label">
                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />Date & Time
                  </span>
                  <span className="order-detail-meta-value">{formatDateTime(selectedOrder.created_at)}</span>
                </div>
                <div className="order-detail-meta-item">
                  <span className="order-detail-meta-label">
                    <CreditCard size={12} style={{ display: 'inline', marginRight: 4 }} />Payment
                  </span>
                  <span className="order-detail-meta-value">
                    <span className={`badge ${paymentConfig[selectedOrder.payment_status]?.class}`}>
                      {paymentConfig[selectedOrder.payment_status]?.label}
                    </span>
                  </span>
                </div>
                <div className="order-detail-meta-item">
                  <span className="order-detail-meta-label">
                    <FileText size={12} style={{ display: 'inline', marginRight: 4 }} />Type
                  </span>
                  <span className="order-detail-meta-value">
                    {selectedOrder.is_self_order ? '📱 Self Order' : '🏪 POS Order'}
                  </span>
                </div>
              </div>

              {/* Items */}
              <h4 className="order-detail-items-title">Items ({orderItems.length})</h4>
              {orderItems.map(item => (
                <div key={item.id} className="order-detail-item">
                  <div>
                    <span className="order-detail-item-name">{item.products?.name || 'Unknown'}</span>
                    <span className="order-detail-item-qty">×{item.quantity}</span>
                  </div>
                  <span className="order-detail-item-price">
                    {formatCurrency(Number(item.unit_price) * item.quantity)}
                  </span>
                </div>
              ))}

              {orderItems.length === 0 && (
                <p className="text-sm text-tertiary text-center p-4">No items found</p>
              )}

              {/* Totals */}
              <div className="order-detail-totals">
                <div className="order-detail-total-row">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="order-detail-total-row">
                  <span>Tax</span>
                  <span className="font-mono">{formatCurrency(selectedOrder.tax_amount)}</span>
                </div>
                {Number(selectedOrder.discount_amount) > 0 && (
                  <div className="order-detail-total-row">
                    <span>Discount</span>
                    <span className="font-mono text-success">-{formatCurrency(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="order-detail-total-row final">
                  <span>Total</span>
                  <span className="font-mono">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
