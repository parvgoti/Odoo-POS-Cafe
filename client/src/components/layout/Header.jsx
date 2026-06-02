import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, Menu, Zap, ShoppingBag, CheckCheck, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { getActiveSessionId } from '../../features/sessions/SessionPage';
import './header.css';

export default function Header({ onMenuToggle }) {
  const [darkMode, setDarkMode] = useState(() => {
    return (localStorage.getItem('pos-theme') || 'dark') === 'dark';
  });
  const navigate = useNavigate();

  // ── Notification state ──
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [dropOpen, setDropOpen]         = useState(false);
  const dropRef = useRef(null);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Load recent orders as initial notifications ──
  useEffect(() => {
    async function loadRecent() {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // last 24h
      const { data } = await supabase
        .from('orders')
        .select('id, total, status, created_at, tables(table_number)')
        .gte('created_at', since)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        const items = data.map(o => ({
          id: o.id,
          title: `New Order — Table ${o.tables?.table_number ?? '?'}`,
          body:  `₹${Number(o.total).toFixed(2)} · ${o.status}`,
          time:  o.created_at,
          read:  true, // past orders start as read
          orderId: o.id,
        }));
        setNotifications(items);
      }
    }
    loadRecent();
  }, []);

  // ── Subscribe to real-time new orders ──
  useEffect(() => {
    const channel = supabase
      .channel('header-order-notifs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          const o = payload.new;
          // Fetch table number
          let tableNum = '?';
          if (o.table_id) {
            const { data: t } = await supabase
              .from('tables')
              .select('table_number')
              .eq('id', o.table_id)
              .single();
            if (t) tableNum = t.table_number;
          }
          const notif = {
            id: o.id,
            title: `New Order — Table ${tableNum}`,
            body:  `₹${Number(o.total).toFixed(2)} · ${o.status}`,
            time:  o.created_at,
            read:  false,
            orderId: o.id,
          };
          setNotifications(prev => [notif, ...prev].slice(0, 20));
          setUnreadCount(n => n + 1);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  function toggleDrop() {
    setDropOpen(v => !v);
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  function handleNotifClick(notif) {
    // mark this one read
    setNotifications(prev =>
      prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - (notif.read ? 0 : 1)));
    setDropOpen(false);
    navigate('/orders');
  }

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    const theme = next ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pos-theme', theme);
  }

  function handleOpenPOS() {
    const sessionId = getActiveSessionId();
    if (!sessionId) navigate('/sessions');
    else navigate('/pos/tables');
  }

  function relativeTime(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="header-menu-btn md-show" onClick={onMenuToggle}>
          <Menu size={20} />
        </button>
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="header-right">

        {/* ── Bell button + dropdown ── */}
        <div className="notif-wrapper" ref={dropRef}>
          <button
            className="header-icon-btn"
            title="Notifications"
            onClick={toggleDrop}
            aria-label="Open notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {dropOpen && (
            <div className="notif-dropdown animate-fadeInDown">
              {/* Header */}
              <div className="notif-head">
                <span className="notif-head-title">Notifications</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {unreadCount > 0 && (
                    <button className="notif-action-btn" onClick={markAllRead} title="Mark all read">
                      <CheckCheck size={14} /> All read
                    </button>
                  )}
                  <button className="notif-action-btn notif-close-btn" onClick={() => setDropOpen(false)}>
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <Bell size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <p>No notifications yet</p>
                    <p style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>New orders will appear here</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <button
                      key={notif.id}
                      className={`notif-item ${notif.read ? '' : 'notif-item--unread'}`}
                      onClick={() => handleNotifClick(notif)}
                    >
                      <div className="notif-icon-wrap">
                        <ShoppingBag size={15} />
                      </div>
                      <div className="notif-content">
                        <div className="notif-title">{notif.title}</div>
                        <div className="notif-body">{notif.body}</div>
                      </div>
                      <div className="notif-time">{relativeTime(notif.time)}</div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="notif-footer">
                  <button className="notif-view-all" onClick={() => { setDropOpen(false); navigate('/orders'); }}>
                    View all orders →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Theme toggle ── */}
        <button className="header-icon-btn" onClick={toggleTheme} title="Toggle Theme">
          <div className={`theme-toggle-icon ${darkMode ? 'dark' : ''}`}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </div>
        </button>

        {/* ── Open POS ── */}
        <button className="btn btn-accent btn-sm" onClick={handleOpenPOS}>
          <Zap size={16} />
          Open POS
        </button>

      </div>
    </header>
  );
}
