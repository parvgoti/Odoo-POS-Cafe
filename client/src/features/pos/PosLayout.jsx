import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Coffee, ArrowLeft, User, RefreshCw, Settings,
  LayoutGrid, Monitor, X, ChevronDown, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getActiveSessionId, setActiveSessionId } from '../sessions/SessionPage';
import './pos.css';

export default function PosLayout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    setCheckingSession(true);
    try {
      // Check localStorage first for quick check
      const localSessionId = getActiveSessionId();
      
      // Verify against database
      const { data } = await supabase
        .from('pos_sessions')
        .select('id')
        .eq('status', 'open')
        .limit(1);

      if (data && data.length > 0) {
        setHasActiveSession(true);
        setActiveSessionId(data[0].id);
      } else if (localSessionId) {
        // Local session exists but not in DB — might be stale
        setActiveSessionId(null);
        setHasActiveSession(false);
      } else {
        setHasActiveSession(false);
      }
    } catch (err) {
      // If DB check fails, trust localStorage
      const localSessionId = getActiveSessionId();
      setHasActiveSession(!!localSessionId);
    } finally {
      setCheckingSession(false);
    }
  }

  async function handleReloadData() {
    setMenuOpen(false);
    window.location.reload();
  }

  function handleGoToBackend() {
    setMenuOpen(false);
    navigate('/');
  }

  function handleCloseRegister() {
    setMenuOpen(false);
    setConfirmClose(true);
  }

  async function confirmCloseRegister() {
    setClosing(true);
    try {
      const sessionId = getActiveSessionId();
      
      if (sessionId) {
        // Get session revenue info
        const { data: orders } = await supabase
          .from('orders')
          .select('total')
          .eq('session_id', sessionId)
          .neq('status', 'cancelled');

        const revenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

        // Get opening amount
        const { data: session } = await supabase
          .from('pos_sessions')
          .select('opening_amount')
          .eq('id', sessionId)
          .single();

        const closingAmount = (session?.opening_amount || 0) + revenue;

        // Close the session in database
        await supabase.from('pos_sessions').update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          closing_amount: closingAmount,
        }).eq('id', sessionId);
      }

      // Clear the active session
      setActiveSessionId(null);
      setConfirmClose(false);
      
      // Navigate to sessions page
      navigate('/sessions');
    } catch (err) {
      console.error('Error closing register:', err);
      // Even if DB update fails, clear local and navigate
      setActiveSessionId(null);
      setConfirmClose(false);
      navigate('/sessions');
    } finally {
      setClosing(false);
    }
  }

  // Loading state
  if (checkingSession) {
    return (
      <div className="layout-pos" data-theme="dark">
        <div className="pos-session-gate">
          <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-accent)', borderRadius: '50%' }} />
        </div>
      </div>
    );
  }

  // No active session gate
  if (!hasActiveSession) {
    return (
      <div className="layout-pos" data-theme="dark">
        <div className="pos-session-gate">
          <div className="pos-session-gate-card animate-scaleIn">
            <div className="pos-session-gate-icon">
              <AlertCircle size={48} />
            </div>
            <h2 className="font-display">No Active Session</h2>
            <p>You need to open a POS session before using the terminal.</p>
            <p className="text-xs text-tertiary">Go to POS Sessions page to open a new cash register session.</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/')}>
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              <button className="btn btn-accent" onClick={() => navigate('/sessions')}>
                <Monitor size={16} /> Open Session
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-pos" data-theme="dark">
      {/* POS Top Bar */}
      <header className="pos-topbar">
        <div className="pos-topbar-left">
          {/* Back button */}
          <button className="pos-back-btn" onClick={() => navigate('/')} title="Go to Backend">
            <ArrowLeft size={18} />
          </button>

          <div className="pos-logo">
            <Coffee size={22} className="pos-logo-icon" />
            <span className="pos-logo-text">Odoo POS Cafe</span>
          </div>

          {/* Top nav links */}
          <nav className="pos-topnav">
            <button
              className="pos-topnav-btn"
              onClick={() => navigate('/pos/tables')}
              title="Go to Table / Floor Plan"
            >
              <LayoutGrid size={16} />
              <span>Table</span>
            </button>
            <button
              className="pos-topnav-btn"
              onClick={() => navigate('/pos/tables')}
              title="Open Register"
            >
              <Monitor size={16} />
              <span>Register</span>
            </button>
          </nav>
        </div>

        <div className="pos-topbar-right">
          <div className="pos-session-indicator">
            <div className="pos-session-dot" />
            <span>Session Active</span>
          </div>

          <div className="pos-user">
            <div className="avatar avatar-sm">
              <User size={16} />
            </div>
            <span className="pos-user-name">Terminal 1</span>
          </div>

          {/* Action Menu */}
          <div style={{ position: 'relative' }}>
            <button
              className="pos-topnav-btn pos-action-menu-btn"
              onClick={() => setMenuOpen(v => !v)}
            >
              <span>Actions</span>
              <ChevronDown size={14} style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>

            {menuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                  onClick={() => setMenuOpen(false)}
                />
                <div className="pos-action-dropdown" style={{ zIndex: 100 }}>
                  <button className="pos-action-item" onClick={handleReloadData}>
                    <RefreshCw size={15} />
                    <div>
                      <div className="pos-action-label">Reload Data</div>
                      <div className="pos-action-desc">Refresh products &amp; settings from backend</div>
                    </div>
                  </button>
                  <button className="pos-action-item" onClick={handleGoToBackend}>
                    <Settings size={15} />
                    <div>
                      <div className="pos-action-label">Go to Back-end</div>
                      <div className="pos-action-desc">Open POS configuration &amp; settings</div>
                    </div>
                  </button>
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />
                  <button className="pos-action-item pos-action-danger" onClick={handleCloseRegister}>
                    <X size={15} />
                    <div>
                      <div className="pos-action-label">Close Register</div>
                      <div className="pos-action-desc">End session &amp; close the register</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* POS Content */}
      <div className="pos-content">
        <Outlet />
      </div>

      {/* Close Register Confirmation Modal */}
      {confirmClose && (
        <div className="modal-overlay" onClick={() => setConfirmClose(false)}>
          <div
            className="modal-content animate-scaleIn"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 400, background: 'var(--neutral-900)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="modal-header">
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--neutral-100)' }}>
                Close Register?
              </h2>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--neutral-400)', fontSize: 'var(--text-sm)' }}>
                This will end the current POS session and close the register. All open orders will be preserved.
                You'll be redirected to the Sessions page.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmClose(false)} disabled={closing}>
                Cancel
              </button>
              <button
                className={`btn ${closing ? 'btn-loading' : ''}`}
                style={{ background: 'var(--color-danger)', color: '#fff' }}
                onClick={confirmCloseRegister}
                disabled={closing}
              >
                {!closing && <X size={16} />}
                {closing ? 'Closing...' : 'Close Register'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
