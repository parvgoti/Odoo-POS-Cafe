import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/formatters';
import {
  DollarSign, ShoppingCart, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, RefreshCw,
} from 'lucide-react';
import './dashboard.css';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DashboardPage() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, activeTables: '0/0', avgOrder: 0 });
  const [weeklyData, setWeeklyData] = useState(Array(7).fill(0));
  const [paymentBreakdown, setPaymentBreakdown] = useState({ cash: 0, digital: 0, upi: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const channelRef = useRef(null);

  const fetchDashboardData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // ── 1. Today's orders ──────────────────────────────────────────────
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      const { data: todayOrders, error: todayErr } = await supabase
        .from('orders')
        .select('id, total, status')
        .gte('created_at', startOfDay.toISOString())
        .neq('status', 'cancelled');

      if (todayErr) console.error('Today orders error:', todayErr);

      const revenue = (todayOrders || []).reduce((s, o) => s + Number(o.total), 0);
      const orderCount = (todayOrders || []).length;
      const avgOrder = orderCount > 0 ? revenue / orderCount : 0;

      // ── 2. Payment method breakdown (today via payments table) ────────
      const pmBreak = { cash: 0, digital: 0, upi: 0 };
      const todayOrderIds = (todayOrders || []).map(o => o.id);

      if (todayOrderIds.length > 0) {
        const { data: todayPayments } = await supabase
          .from('payments')
          .select('amount, payment_methods(type, name)')
          .in('order_id', todayOrderIds)
          .eq('status', 'completed');

        (todayPayments || []).forEach(p => {
          const type = (p.payment_methods?.type || p.payment_methods?.name || '').toLowerCase();
          if (type.includes('cash')) pmBreak.cash += Number(p.amount);
          else if (type.includes('upi') || type.includes('qr')) pmBreak.upi += Number(p.amount);
          else pmBreak.digital += Number(p.amount);
        });
      }
      setPaymentBreakdown(pmBreak);

      // ── 3. Active tables ───────────────────────────────────────────────
      const { data: tables } = await supabase.from('tables').select('status');
      const totalTables = tables?.length || 0;
      const occupiedTables = tables?.filter(t => t.status === 'occupied').length || 0;

      setStats({ revenue, orders: orderCount, activeTables: `${occupiedTables}/${totalTables}`, avgOrder });

      // ── 4. Weekly bar chart (last 7 days real data) ───────────────────
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const { data: weekOrders } = await supabase
        .from('orders')
        .select('created_at, total')
        .gte('created_at', sevenDaysAgo.toISOString())
        .neq('status', 'cancelled');

      // Aggregate revenue by day-of-week index (0=Sun … 6=Sat)
      const dayRevenue = Array(7).fill(0);
      (weekOrders || []).forEach(o => {
        const d = new Date(o.created_at).getDay();
        dayRevenue[d] += Number(o.total);
      });

      // Build ordered array starting from (today - 6 days) up to today
      const ordered = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        ordered.push({ label: DAY_LABELS[d.getDay()], value: dayRevenue[d.getDay()] });
      }
      setWeeklyData(ordered);

      // ── 5. Recent orders ───────────────────────────────────────────────
      const { data: recent } = await supabase
        .from('orders')
        .select('id, order_number, total, status, created_at, tables(table_number)')
        .order('created_at', { ascending: false })
        .limit(8);

      setRecentOrders(
        (recent || []).map(o => ({
          id: o.id,
          order_number: o.order_number || o.id.slice(0, 4),
          table: o.tables?.table_number ? `Table ${o.tables.table_number}` : '—',
          total: Number(o.total),
          status: o.status,
          time: formatTimeAgo(o.created_at),
        }))
      );

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ── Realtime subscription + 30-second polling fallback ─────────────────
  useEffect(() => {
    fetchDashboardData();

    // Realtime — listen to any change on orders or tables
    channelRef.current = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    // 30-second polling as a reliability fallback
    const interval = setInterval(() => fetchDashboardData(), 30_000);

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      clearInterval(interval);
    };
  }, [fetchDashboardData]);

  // ── Helpers ────────────────────────────────────────────────────────────
  function formatTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  const maxWeekly = Math.max(...weeklyData.map(d => d.value), 1);
  const pmTotal = paymentBreakdown.cash + paymentBreakdown.digital + paymentBreakdown.upi || 1;
  const cashPct = Math.round((paymentBreakdown.cash / pmTotal) * 100);
  const digitalPct = Math.round((paymentBreakdown.digital / pmTotal) * 100);
  const upiPct = 100 - cashPct - digitalPct;

  // SVG donut parameters (circumference of r=50 circle = 314.16)
  const C = 314.16;
  const cashLen = (cashPct / 100) * C;
  const digitalLen = (digitalPct / 100) * C;
  const upiLen = (upiPct / 100) * C;

  const statusColors = {
    completed: 'badge-success',
    confirmed: 'badge-warning',
    preparing: 'badge-warning',
    ready: 'badge-info',
    draft: 'badge-neutral',
    cancelled: 'badge-danger',
  };

  return (
    <div className="dashboard-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {lastUpdated
              ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
              : "Welcome back! Here's your cafe overview."}
          </p>
        </div>
        <button
          className={`btn btn-secondary ${refreshing ? 'refreshing' : ''}`}
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid stagger-children">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats.revenue)}
          change={stats.revenue > 0 ? 'Live' : '—'}
          changeType="up"
          icon={<DollarSign size={22} />}
          loading={loading}
        />
        <StatCard
          title="Orders Today"
          value={stats.orders}
          change={stats.orders > 0 ? 'Live' : '—'}
          changeType="up"
          icon={<ShoppingCart size={22} />}
          loading={loading}
        />
        <StatCard
          title="Active Tables"
          value={stats.activeTables}
          subtitle="Currently occupied"
          icon={<Users size={22} />}
          loading={loading}
        />
        <StatCard
          title="Avg Order Value"
          value={stats.avgOrder ? formatCurrency(stats.avgOrder) : '$0.00'}
          change={stats.avgOrder > 0 ? 'Live' : '—'}
          changeType="up"
          icon={<TrendingUp size={22} />}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts">
        {/* Real weekly bar chart */}
        <div className="card chart-card chart-card-wide">
          <h3 className="chart-title">Sales This Week</h3>
          <div className="chart-placeholder">
            <div className="bar-chart">
              {weeklyData.map((d, i) => (
                <div key={i} className="bar-group">
                  <div
                    className="bar"
                    style={{
                      height: `${(d.value / maxWeekly) * 100}%`,
                      animationDelay: `${i * 0.1}s`,
                      minHeight: d.value > 0 ? 4 : 0,
                    }}
                    title={`${d.label}: ${formatCurrency(d.value)}`}
                  />
                  <span className="bar-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real payment method donut */}
        <div className="card chart-card">
          <h3 className="chart-title">Payment Methods</h3>
          <div className="chart-placeholder">
            <div className="donut-chart">
              <svg viewBox="0 0 120 120" className="donut-svg">
                {/* Cash segment */}
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="var(--color-primary-200)"
                  strokeWidth="20"
                  className="donut-segment"
                  strokeDasharray={`${cashLen} ${C - cashLen}`}
                  strokeDashoffset={C * 0.25}
                />
                {/* Digital segment */}
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="20"
                  className="donut-segment"
                  strokeDasharray={`${digitalLen} ${C - digitalLen}`}
                  strokeDashoffset={C * 0.25 - cashLen}
                />
                {/* UPI segment */}
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="var(--color-success)"
                  strokeWidth="20"
                  className="donut-segment"
                  strokeDasharray={`${upiLen} ${C - upiLen}`}
                  strokeDashoffset={C * 0.25 - cashLen - digitalLen}
                />
              </svg>
              <div className="donut-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: 'var(--color-primary-200)' }} />
                  Cash ({cashPct}%)
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: 'var(--color-accent)' }} />
                  Digital ({digitalPct}%)
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: 'var(--color-success)' }} />
                  UPI ({upiPct}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h3 className="chart-title mb-4">Recent Orders</h3>
        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8, borderRadius: 8 }} />
            ))}
          </div>
        ) : recentOrders.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Table</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody className="stagger-children">
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td className="font-mono font-semibold">#{String(order.order_number).padStart(4, '0')}</td>
                  <td>{order.table}</td>
                  <td className="font-mono">{formatCurrency(order.total)}</td>
                  <td>
                    <span className={`badge ${statusColors[order.status] || 'badge-neutral'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-secondary text-sm">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
            <p>No orders yet. Start taking orders from the POS terminal!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, change, changeType, subtitle, icon, loading }) {
  return (
    <div className="stat-card hover-lift">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-icon">{icon}</div>
      </div>
      {loading ? (
        <div className="skeleton" style={{ width: '60%', height: 32, borderRadius: 6, marginBottom: 8 }} />
      ) : (
        <div className="stat-card-value animate-countup">{value}</div>
      )}
      {change && change !== '—' && (
        <div className={`stat-card-change ${changeType === 'up' ? 'change-up' : 'change-down'}`}>
          {changeType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      )}
      {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
    </div>
  );
}
