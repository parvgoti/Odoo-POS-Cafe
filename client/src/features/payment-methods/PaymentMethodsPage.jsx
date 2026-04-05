import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Banknote, CreditCard, QrCode, Check } from 'lucide-react';
import './payment-methods.css';

const iconMap = { cash: Banknote, digital: CreditCard, upi_qr: QrCode };
const accentMap = { cash: 'green', digital: 'blue', upi_qr: 'purple' };

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMethods(); }, []);

  async function fetchMethods() {
    try {
      const { data } = await supabase.from('payment_methods').select('*').order('created_at');
      if (data) setMethods(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleMethod(id) {
    const method = methods.find(m => m.id === id);
    const newEnabled = !method.is_enabled;

    // Optimistic update
    setMethods(methods.map(m => m.id === id ? { ...m, is_enabled: newEnabled } : m));

    const { error } = await supabase
      .from('payment_methods')
      .update({ is_enabled: newEnabled })
      .eq('id', id);

    if (error) {
      console.error('Toggle error:', error);
      fetchMethods(); // Rollback
    }
  }

  async function updateConfig(id, key, value) {
    const method = methods.find(m => m.id === id);
    const newConfig = { ...method.config, [key]: value };

    setMethods(methods.map(m => m.id === id ? { ...m, config: newConfig } : m));

    await supabase
      .from('payment_methods')
      .update({ config: newConfig })
      .eq('id', id);
  }

  return (
    <div className="payment-methods-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Methods</h1>
          <p className="page-subtitle">Configure accepted payment methods for your POS</p>
        </div>
      </div>

      {loading ? (
        <div className="payment-methods-list">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card skeleton-wrapper" style={{ height: 100 }}>
              <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 12 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="payment-methods-list stagger-children">
          {methods.map(method => {
            const Icon = iconMap[method.type] || CreditCard;
            const accent = accentMap[method.type] || 'blue';
            return (
              <div key={method.id} className={`payment-method-card card ${method.is_enabled ? 'enabled' : ''} accent-${accent}`}>
                <div className="pm-main">
                  <div className="pm-info">
                    <div className={`pm-icon-wrap pm-icon-${accent}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="pm-name">{method.name}</h3>
                      <p className="pm-desc">
                        {method.type === 'cash' && 'Accept cash payments at checkout'}
                        {method.type === 'digital' && 'Accept card and bank payments'}
                        {method.type === 'upi_qr' && 'Accept UPI payments via QR code'}
                      </p>
                    </div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={method.is_enabled} onChange={() => toggleMethod(method.id)} />
                    <span className="toggle-track" />
                    <span className="toggle-thumb" />
                  </label>
                </div>

                {/* Expanded Config for UPI */}
                {method.is_enabled && method.type === 'upi_qr' && (
                  <div className="pm-expanded animate-fadeInDown">
                    <div className="input-group">
                      <label className="input-label">UPI ID</label>
                      <input
                        className="input-field"
                        placeholder="restaurant@ybl"
                        value={method.config?.upi_id || ''}
                        onChange={e => updateConfig(method.id, 'upi_id', e.target.value)}
                      />
                      <span className="input-hint">QR code will be generated automatically during checkout</span>
                    </div>
                    {method.config?.upi_id && (
                      <div className="pm-qr-preview">
                        <div className="pm-qr-placeholder">
                          <QrCode size={48} strokeWidth={1} />
                          <span>QR Preview</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {method.is_enabled && (
                  <div className="pm-status">
                    <Check size={14} />
                    <span>Enabled — will appear during checkout</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
