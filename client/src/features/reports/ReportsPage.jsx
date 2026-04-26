import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/formatters';
import { Download, Filter, TrendingUp, ShoppingCart, DollarSign, Users, ChevronDown, X } from 'lucide-react';
import './reports.css';

export default function ReportsPage() {
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, uniqueTables: 0 });
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentSplit, setPaymentSplit] = useState({ cash: 0, digital: 0, upi: 0 });
  const [rawOrders, setRawOrders] = useState([]);

  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [staff, setStaff] = useState([]);
  const [products, setProducts] = useState([]);
  const [filterSession, setFilterSession] = useState('');
  const [filterStaff, setFilterStaff] = useState('');
  const [filterProduct, setFilterProduct] = useState('');

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => { fetchReportData(); }, [period, filterSession, filterStaff, filterProduct]);

  async function fetchFilterOptions() {
    const [{ data: sessData }, { data: usersData }, { data: prodData }] = await Promise.all([
      supabase.from('pos_sessions').select('id, opened_at, status').order('opened_at', { ascending: false }).limit(20),
      supabase.from('users').select('id, name'),
      supabase.from('products').select('id, name').order('name'),
    ]);
    if (sessData) setSessions(sessData);
    if (usersData) setStaff(usersData);
    if (prodData) setProducts(prodData);
  }

  function getDateRange() {
    const now = new Date();
    let start;
    switch (period) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
      case 'week':
        start = new Date(now); start.setDate(now.getDate() - 7); break;
      case 'month':
        start = new Date(now); start.setMonth(now.getMonth() - 1); break;
      case 'year':
        start = new Date(now); start.setFullYear(now.getFullYear() - 1); break;
      default:
        start = new Date(now); start.setDate(now.getDate() - 7);
    }
    return start.toISOString();
  }

  async function fetchReportData() {
    setLoading(true);
    const startDate = getDateRange();

    try {
      // Build orders query with optional filters
      let ordersQuery = supabase
        .from('orders')
        .select('*, tables(table_number)')
        .gte('created_at', startDate)
        .neq('status', 'cancelled');

      if (filterSession) ordersQuery = ordersQuery.eq('session_id', filterSession);
      if (filterStaff) ordersQuery = ordersQuery.eq('created_by', filterStaff);

      const { data: orders } = await ordersQuery;
      setRawOrders(orders || []);

      if (orders && orders.length > 0) {
        const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
        const uniqueTableSet = new Set(orders.filter(o => o.tables?.table_number).map(o => o.tables.table_number));
        setStats({
          totalRevenue: revenue,
          totalOrders: orders.length,
          avgOrderValue: revenue / orders.length,
          uniqueTables: uniqueTableSet.size,
        });

        // Daily sales
        const dailySales = {};
        orders.forEach(o => {
          const day = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
          dailySales[day] = (dailySales[day] || 0) + Number(o.total);
        });
        setSalesData(Object.entries(dailySales).map(([date, amount]) => ({ date, amount })).slice(-7));
      } else {
        setStats({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, uniqueTables: 0 });
        setSalesData([]);
      }

      // Top products with optional product filter
      let itemsQuery = supabase
        .from('order_items')
        .select('quantity, unit_price, products(id, name), orders!inner(status, created_at)')
        .gte('orders.created_at', startDate)
        .neq('orders.status', 'cancelled');

      if (filterProduct) itemsQuery = itemsQuery.eq('product_id', filterProduct);

      const { data: orderItems } = await itemsQuery;

      if (orderItems && orderItems.length > 0) {
        const productMap = {};
        orderItems.forEach(item => {
          const name = item.products?.name || 'Unknown';
          if (!productMap[name]) productMap[name] = { name, qty: 0, revenue: 0 };
          productMap[name].qty += item.quantity;
          productMap[name].revenue += Number(item.unit_price) * item.quantity;
        });
        setTopProducts(Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5));
      } else {
        setTopProducts([]);
      }

      // Payments split
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, payment_method_id, payment_methods(type)')
        .gte('created_at', startDate)
        .eq('status', 'completed');

      if (payments && payments.length > 0) {
        const split = { cash: 0, digital: 0, upi: 0 };
        let total = 0;
        payments.forEach(p => {
          const type = p.payment_methods?.type;
          const amt = Number(p.amount);
          total += amt;
          if (type === 'cash') split.cash += amt;
          else if (type === 'digital') split.digital += amt;
          else if (type === 'upi_qr') split.upi += amt;
        });
        if (total > 0) {
          setPaymentSplit({
            cash: Math.round((split.cash / total) * 100),
            digital: Math.round((split.digital / total) * 100),
            upi: Math.round((split.upi / total) * 100),
          });
        }
      } else {
        setPaymentSplit({ cash: 50, digital: 30, upi: 20 });
      }
    } catch (err) {
      console.error('Report fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  // ——— CSV Export ———
  function exportCSV() {
    const rows = [
      ['Order ID', 'Table', 'Status', 'Total', 'Date'],
      ...rawOrders.map(o => [
        o.id.slice(0, 8),
        o.tables?.table_number || '—',
        o.status,
        o.total,
        new Date(o.created_at).toLocaleString(),
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pos-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ——— PDF Print Export ———
  function exportPDF() {
    const w = window.open('', '_blank');
    const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);
    w.document.write(`
      <html><head><title>POS Report — ${periodLabel}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #1a1614; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        .meta { color: #888; font-size: 13px; margin-bottom: 24px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat { border: 1px solid #e0d8d0; border-radius: 10px; padding: 16px; }
        .stat-label { font-size: 12px; color: #888; }
        .stat-value { font-size: 22px; font-weight: bold; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #f5f0eb; text-align: left; padding: 10px 12px; font-size: 13px; }
        td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f0ebe4; }
        .footer { margin-top: 32px; font-size: 12px; color: #aaa; text-align: center; }
      </style></head><body>
      <h1>☕ Odoo POS Cafe — Sales Report</h1>
      <div class="meta">Period: ${periodLabel} · Generated: ${new Date().toLocaleString()}</div>
      <div class="stats">
        <div class="stat"><div class="stat-label">Total Revenue</div><div class="stat-value">${formatCurrency(stats.totalRevenue)}</div></div>
        <div class="stat"><div class="stat-label">Total Orders</div><div class="stat-value">${stats.totalOrders}</div></div>
        <div class="stat"><div class="stat-label">Avg Order Value</div><div class="stat-value">${formatCurrency(stats.avgOrderValue)}</div></div>
        <div class="stat"><div class="stat-label">Tables Served</div><div class="stat-value">${stats.uniqueTables}</div></div>
      </div>
      <h2>Top Products</h2>
      <table><thead><tr><th>#</th><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
      <tbody>${topProducts.map((p, i) => `<tr><td>${i + 1}</td><td>${p.name}</td><td>${p.qty}</td><td>${formatCurrency(p.revenue)}</td></tr>`).join('')}</tbody></table>
      <h2 style="margin-top:24px;">Orders</h2>
      <table><thead><tr><th>Order ID</th><th>Table</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
      <tbody>${rawOrders.slice(0, 50).map(o => `<tr><td>${o.id.slice(0, 8)}</td><td>${o.tables?.table_number || '—'}</td><td>${o.status}</td><td>${formatCurrency(o.total)}</td><td>${new Date(o.created_at).toLocaleString()}</td></tr>`).join('')}</tbody></table>
      <div class="footer">Odoo POS Cafe · Powered by Supabase</div>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  }

  const maxSales = salesData.length > 0 ? Math.max(...salesData.map(d => d.amount)) : 1;
  const activeFilterCount = [filterSession, filterStaff, filterProduct].filter(Boolean).length;

  function clearFilters() {
    setFilterSession('');
    setFilterStaff('');
    setFilterProduct('');
  }

  return (
    <div className="reports-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Track your cafe performance</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={exportPDF}>
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Period + Filters Bar */}
      <div className="report-filters mb-6">
        <div className="tabs">
          {['today', 'week', 'month', 'year'].map(p => (
            <button key={p} className={`tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <button
          className={`btn btn-sm ${showFilters || activeFilterCount > 0 ? 'btn-accent' : 'btn-ghost'}`}
          onClick={() => setShowFilters(v => !v)}
        >
          <Filter size={16} />
          Advanced Filters
          {activeFilterCount > 0 && (
            <span style={{
              background: 'var(--color-accent)', color: '#fff', borderRadius: '50%',
              width: 18, height: 18, fontSize: 11, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4
            }}>{activeFilterCount}</span>
          )}
          <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </button>
      </div>

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="card mb-6 animate-fadeInDown" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', alignItems: 'end' }}>

            {/* Session Filter */}
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Session</label>
              <select className="select-field" value={filterSession} onChange={e => setFilterSession(e.target.value)}>
                <option value="">All Sessions</option>
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>
                    Session — {new Date(s.opened_at).toLocaleDateString()} ({s.status})
                  </option>
                ))}
              </select>
              <p className="text-xs text-tertiary mt-1">Filter by specific POS session (shift-wise analysis)</p>
            </div>

            {/* Responsible / Staff Filter */}
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Responsible (Staff)</label>
              <select className="select-field" value={filterStaff} onChange={e => setFilterStaff(e.target.value)}>
                <option value="">All Staff</option>
                {staff.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <p className="text-xs text-tertiary mt-1">Filter by staff member responsible for orders</p>
            </div>

            {/* Product Filter */}
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Product</label>
              <select className="select-field" value={filterProduct} onChange={e => setFilterProduct(e.target.value)}>
                <option value="">All Products</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <p className="text-xs text-tertiary mt-1">Track best-selling or low-selling items</p>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                <X size={14} /> Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="stats-grid stagger-children mb-6">
        <div className="stat-card hover-lift">
          <div className="stat-card-header"><span className="stat-card-title">Total Revenue</span><div className="stat-card-icon"><DollarSign size={22} /></div></div>
          {loading ? <div className="skeleton" style={{ width: '60%', height: 32, borderRadius: 6 }} /> : <div className="stat-card-value">{formatCurrency(stats.totalRevenue)}</div>}
        </div>
        <div className="stat-card hover-lift">
          <div className="stat-card-header"><span className="stat-card-title">Total Orders</span><div className="stat-card-icon"><ShoppingCart size={22} /></div></div>
          {loading ? <div className="skeleton" style={{ width: '60%', height: 32, borderRadius: 6 }} /> : <div className="stat-card-value">{stats.totalOrders}</div>}
        </div>
        <div className="stat-card hover-lift">
          <div className="stat-card-header"><span className="stat-card-title">Avg Order Value</span><div className="stat-card-icon"><TrendingUp size={22} /></div></div>
          {loading ? <div className="skeleton" style={{ width: '60%', height: 32, borderRadius: 6 }} /> : <div className="stat-card-value">{formatCurrency(stats.avgOrderValue)}</div>}
        </div>
        <div className="stat-card hover-lift">
          <div className="stat-card-header"><span className="stat-card-title">Tables Served</span><div className="stat-card-icon"><Users size={22} /></div></div>
          {loading ? <div className="skeleton" style={{ width: '60%', height: 32, borderRadius: 6 }} /> : <div className="stat-card-value">{stats.uniqueTables}</div>}
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-charts mb-6">
        <div className="card chart-card chart-card-wide">
          <h3 className="chart-title">Sales Over Time</h3>
          <div className="chart-placeholder">
            {loading ? (
              <div className="skeleton" style={{ width: '100%', height: 180, borderRadius: 8 }} />
            ) : salesData.length > 0 ? (
              <div className="bar-chart">
                {salesData.map((day, i) => (
                  <div key={day.date} className="bar-group">
                    <div className="bar" style={{ height: `${(day.amount / maxSales) * 100}%`, animationDelay: `${i * 0.1}s` }} />
                    <span className="bar-label">{day.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                <p>No sales data for this period</p>
              </div>
            )}
          </div>
        </div>

        <div className="card chart-card">
          <h3 className="chart-title">Payment Split</h3>
          <div className="chart-placeholder">
            <div className="donut-chart">
              <svg viewBox="0 0 120 120" className="donut-svg">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-primary-200)" strokeWidth="20" className="donut-segment"
                  strokeDasharray={`${(paymentSplit.cash / 100) * 314} ${314 - (paymentSplit.cash / 100) * 314}`} />
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-accent)" strokeWidth="20" className="donut-segment"
                  strokeDasharray={`${(paymentSplit.digital / 100) * 314} ${314 - (paymentSplit.digital / 100) * 314}`}
                  strokeDashoffset={`${-((paymentSplit.cash / 100) * 314)}`} />
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-success)" strokeWidth="20" className="donut-segment"
                  strokeDasharray={`${(paymentSplit.upi / 100) * 314} ${314 - (paymentSplit.upi / 100) * 314}`}
                  strokeDashoffset={`${-(((paymentSplit.cash + paymentSplit.digital) / 100) * 314)}`} />
              </svg>
              <div className="donut-legend">
                <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--color-primary-200)' }} />Cash ({paymentSplit.cash}%)</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--color-accent)' }} />Digital ({paymentSplit.digital}%)</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--color-success)' }} />UPI ({paymentSplit.upi}%)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="card">
        <h3 className="chart-title mb-4">
          Top Products
          {filterProduct && products.find(p => p.id === filterProduct) && (
            <span style={{ marginLeft: 8, fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', fontWeight: 400 }}>
              — filtered: {products.find(p => p.id === filterProduct)?.name}
            </span>
          )}
        </h3>
        {loading ? (
          <div>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8, borderRadius: 8 }} />)}</div>
        ) : topProducts.length > 0 ? (
          <table className="data-table">
            <thead><tr><th>#</th><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
            <tbody className="stagger-children">
              {topProducts.map((product, i) => (
                <tr key={product.name}>
                  <td className="font-mono text-tertiary">{i + 1}</td>
                  <td className="font-semibold">{product.name}</td>
                  <td className="font-mono">{product.qty}</td>
                  <td className="font-mono font-semibold">{formatCurrency(product.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
            <p>No product data for this period</p>
          </div>
        )}
      </div>
    </div>
  );
}
