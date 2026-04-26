import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDateTime, formatRelativeTime } from '../../lib/formatters';
import { Clock, PlayCircle, StopCircle, DollarSign, ShoppingCart, Timer, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import './sessions.css';

// Helper to store/read active session
export function getActiveSessionId() {
  return localStorage.getItem('pos_active_session_id');
}

export function setActiveSessionId(id) {
  if (id) {
    localStorage.setItem('pos_active_session_id', id);
  } else {
    localStorage.removeItem('pos_active_session_id');
  }
}

export default function SessionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingAmount, setOpeningAmount] = useState(200);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [closingNotes, setClosingNotes] = useState('');
  const [elapsed, setElapsed] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => { fetchSessions(); }, []);

  // Live timer for active session
  useEffect(() => {
    const activeSession = sessions.find(s => s.status === 'open');
    if (!activeSession) return;

    const timer = setInterval(() => {
      const diff = Date.now() - new Date(activeSession.opened_at).getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsed(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [sessions]);

  async function fetchSessions() {
    setLoading(true);
    setError(null);
    try {
      // First try with user join
      let data, error;
      
      try {
        const result = await supabase
          .from('pos_sessions')
          .select('*, users(name)')
          .order('opened_at', { ascending: false })
          .limit(20);
        data = result.data;
        error = result.error;
      } catch {
        // If join fails, fetch without join
        const result = await supabase
          .from('pos_sessions')
          .select('*')
          .order('opened_at', { ascending: false })
          .limit(20);
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      if (data && data.length > 0) {
        // For each session, count orders and revenue
        const enriched = await Promise.all(data.map(async (session) => {
          try {
            const { data: orders } = await supabase
              .from('orders')
              .select('total')
              .eq('session_id', session.id)
              .neq('status', 'cancelled');

            const orderCount = orders?.length || 0;
            const revenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
            return { ...session, orderCount, revenue };
          } catch {
            return { ...session, orderCount: 0, revenue: 0 };
          }
        }));

        setSessions(enriched);

        // Sync localStorage with active session
        const activeSession = enriched.find(s => s.status === 'open');
        if (activeSession) {
          setActiveSessionId(activeSession.id);
        } else {
          setActiveSessionId(null);
        }
      } else {
        setSessions([]);
        setActiveSessionId(null);
      }
    } catch (err) {
      console.error('Sessions fetch error:', err);
      setError('Could not load sessions from database. Using local mode.');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenSession() {
    setError(null);
    try {
      // Check if there's already an open session
      const { data: existingOpen } = await supabase
        .from('pos_sessions')
        .select('id')
        .eq('status', 'open')
        .limit(1);

      if (existingOpen && existingOpen.length > 0) {
        setError('There is already an active session. Close it first before opening a new one.');
        setShowOpenModal(false);
        return;
      }

      // Try inserting with user reference first
      let insertResult;
      try {
        insertResult = await supabase.from('pos_sessions').insert({
          opened_by: user?.id || null,
          opening_amount: openingAmount,
          status: 'open',
        }).select().single();
      } catch {
        // If FK fails, try without opened_by
        insertResult = await supabase.from('pos_sessions').insert({
          opening_amount: openingAmount,
          status: 'open',
        }).select().single();
      }

      if (insertResult.error) {
        // If insert fails (e.g., FK constraint on opened_by), try without user reference
        const retryResult = await supabase.from('pos_sessions').insert({
          opening_amount: openingAmount,
          status: 'open',
        }).select().single();

        if (retryResult.error) {
          throw retryResult.error;
        }

        // Store the session ID
        setActiveSessionId(retryResult.data.id);
      } else {
        // Store the session ID
        setActiveSessionId(insertResult.data.id);
      }

      setShowOpenModal(false);
      setOpeningAmount(200);
      await fetchSessions();
    } catch (err) {
      console.error('Open session error:', err);
      // Fallback: create local session
      const localId = crypto.randomUUID();
      const newSession = {
        id: localId,
        status: 'open',
        opened_at: new Date().toISOString(),
        opening_amount: openingAmount,
        orderCount: 0,
        revenue: 0,
        users: { name: user?.user_metadata?.name || 'Staff' },
      };
      setSessions([newSession, ...sessions]);
      setActiveSessionId(localId);
      setShowOpenModal(false);
      setError('Session created locally (database unavailable).');
    }
  }

  async function handleCloseSession(sessionId) {
    if (!confirm('Close this POS session? This will end order tracking for this register.')) return;
    
    const session = sessions.find(s => s.id === sessionId);
    const closingAmount = (session?.opening_amount || 0) + (session?.revenue || 0);

    try {
      const { error } = await supabase.from('pos_sessions').update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        closing_amount: closingAmount,
        notes: closingNotes || null,
      }).eq('id', sessionId);

      if (error) throw error;

      // Clear active session from localStorage
      setActiveSessionId(null);
      setClosingNotes('');
      await fetchSessions();
    } catch (err) {
      console.error('Close session error:', err);
      // Fallback local update
      setSessions(sessions.map(s =>
        s.id === sessionId ? {
          ...s,
          status: 'closed',
          closed_at: new Date().toISOString(),
          closing_amount: closingAmount,
        } : s
      ));
      setActiveSessionId(null);
    }
  }

  const activeSession = sessions.find(s => s.status === 'open');
  const closedSessions = sessions.filter(s => s.status === 'closed');

  return (
    <div className="sessions-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">POS Sessions</h1>
          <p className="page-subtitle">Manage cash register sessions</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          {activeSession && (
            <button
              className="btn btn-accent"
              onClick={() => navigate('/pos/tables')}
            >
              <Zap size={16} /> Open POS Terminal
            </button>
          )}
          {!activeSession && (
            <button className="btn btn-accent" onClick={() => setShowOpenModal(true)}>
              <PlayCircle size={18} /> Open Session
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="session-error-banner animate-fadeIn">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Active Session Card */}
      {loading ? (
        <div className="skeleton" style={{ height: 200, borderRadius: 16, marginBottom: 24 }} />
      ) : activeSession ? (
        <div className="session-active-card glass-card animate-scaleIn">
          <div className="session-active-dot animate-breathe" />
          <div className="session-active-header">
            <div>
              <h3 className="font-display text-xl font-bold">Current Session</h3>
              <p className="text-sm text-secondary">
                Opened by {activeSession.users?.name || user?.user_metadata?.name || 'Staff'} · {formatRelativeTime(activeSession.opened_at)}
              </p>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => handleCloseSession(activeSession.id)}>
              <StopCircle size={16} /> Close Session
            </button>
          </div>
          <div className="session-active-stats">
            <div>
              <span className="text-sm text-secondary"><DollarSign size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Opening</span>
              <span className="font-mono font-bold text-lg">{formatCurrency(activeSession.opening_amount)}</span>
            </div>
            <div>
              <span className="text-sm text-secondary"><ShoppingCart size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Orders</span>
              <span className="font-mono font-bold text-lg">{activeSession.orderCount}</span>
            </div>
            <div>
              <span className="text-sm text-secondary"><DollarSign size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Revenue</span>
              <span className="font-mono font-bold text-lg">{formatCurrency(activeSession.revenue)}</span>
            </div>
            <div>
              <span className="text-sm text-secondary"><Timer size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Duration</span>
              <span className="font-mono font-bold text-lg">{elapsed || 'Starting...'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p className="text-tertiary">No active session. Open a new session to start tracking.</p>
        </div>
      )}

      {/* Session History */}
      <h3 className="text-base font-semibold mb-4 mt-6">Session History</h3>
      <div className="card">
        {loading ? (
          <div>
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />)}
          </div>
        ) : closedSessions.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Opened</th>
                <th>Closed</th>
                <th>Staff</th>
                <th>Opening</th>
                <th>Closing</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="stagger-children">
              {closedSessions.map(s => (
                <tr key={s.id}>
                  <td className="text-sm">{formatDateTime(s.opened_at)}</td>
                  <td className="text-sm">{s.closed_at ? formatDateTime(s.closed_at) : '—'}</td>
                  <td>{s.users?.name || user?.user_metadata?.name || 'Staff'}</td>
                  <td className="font-mono">{formatCurrency(s.opening_amount)}</td>
                  <td className="font-mono">{s.closing_amount ? formatCurrency(s.closing_amount) : '—'}</td>
                  <td className="font-mono">{s.orderCount || 0}</td>
                  <td className="font-mono font-semibold">{formatCurrency(s.revenue || 0)}</td>
                  <td><span className="badge badge-neutral">closed</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
            <p>No closed sessions yet</p>
          </div>
        )}
      </div>

      {/* Open Session Modal */}
      {showOpenModal && (
        <div className="modal-overlay" onClick={() => setShowOpenModal(false)}>
          <div className="modal-content animate-scaleIn" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 className="font-display text-lg font-bold">Open New Session</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowOpenModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label className="input-label">Opening Cash Amount ($)</label>
                <input
                  className="input-field"
                  type="number"
                  value={openingAmount}
                  onChange={e => setOpeningAmount(Number(e.target.value))}
                  min="0"
                  step="10"
                  autoFocus
                />
                <span className="input-hint">Count and enter the cash currently in the register</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowOpenModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleOpenSession}>
                <PlayCircle size={16} /> Start Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
