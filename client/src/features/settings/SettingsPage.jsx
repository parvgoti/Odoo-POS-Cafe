import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Store, Receipt, Percent, Bell, Printer, Palette, Shield,
  Sun, Moon, Save, Trash2, Coffee, RotateCcw, Check
} from 'lucide-react';
import './settings.css';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    restaurant_name: 'Odoo POS Cafe',
    address: '123 Coffee Street, Downtown',
    phone: '+1 (555) 123-4567',
    email: 'hello@odooposcafe.com',
    currency: '$',
    timezone: 'UTC+5:30',
    receipt_header: 'Thank you for dining with us!',
    receipt_footer: 'See you again soon ☕',
    receipt_show_logo: true,
    receipt_show_address: true,
    default_tax: 5,
    tax_inclusive: false,
    notify_new_order: true,
    notify_kitchen_ready: true,
    notify_low_stock: false,
    sound_enabled: true,
    printer_enabled: false,
    printer_name: '',
    auto_print_receipt: false,
    auto_print_kitchen: true,
    theme: 'light',
  });

  function update(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    // Simulate save delay for demo
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleClearDemoData() {
    if (!confirm('This will clear all orders, payments, and kitchen tickets. Tables and products will remain. Continue?')) return;
    try {
      await supabase.from('kitchen_tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('tables').update({ status: 'available' }).neq('id', '00000000-0000-0000-0000-000000000000');
      alert('Demo data cleared successfully!');
    } catch (err) {
      console.error('Clear error:', err);
      alert('Error clearing data: ' + err.message);
    }
  }

  async function handleResetTables() {
    if (!confirm('Reset all tables to "available" status?')) return;
    try {
      await supabase.from('tables').update({ status: 'available' }).neq('id', '00000000-0000-0000-0000-000000000000');
      alert('All tables reset to available!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  return (
    <div className="settings-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your restaurant and POS preferences</p>
        </div>
      </div>

      <div className="settings-grid stagger-children">

        {/* ─────────── Restaurant Profile ─────────── */}
        <section className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-title">
              <div className="settings-icon settings-icon-primary"><Store size={18} /></div>
              <h3>Restaurant Profile</h3>
            </div>
          </div>
          <div className="settings-section-body">
            <div className="logo-upload-area">
              <div className="logo-preview"><Coffee size={32} /></div>
              <div className="logo-upload-info">
                <h4>Restaurant Logo</h4>
                <p>Upload a logo for receipts and displays (PNG, JPG)</p>
                <button className="btn btn-ghost btn-sm mt-2">Change Logo</button>
              </div>
            </div>
            <div className="settings-form-grid">
              <div className="input-group">
                <label className="input-label">Restaurant Name</label>
                <input className="input-field" value={settings.restaurant_name} onChange={e => update('restaurant_name', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input className="input-field" type="email" value={settings.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Address</label>
                <input className="input-field" value={settings.address} onChange={e => update('address', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Phone</label>
                <input className="input-field" value={settings.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Currency Symbol</label>
                <input className="input-field" value={settings.currency} onChange={e => update('currency', e.target.value)} maxLength={3} style={{ maxWidth: 80 }} />
              </div>
              <div className="input-group">
                <label className="input-label">Timezone</label>
                <select className="select-field" value={settings.timezone} onChange={e => update('timezone', e.target.value)}>
                  <option value="UTC+5:30">IST (UTC+5:30)</option>
                  <option value="UTC+0">GMT (UTC+0)</option>
                  <option value="UTC-5">EST (UTC-5)</option>
                  <option value="UTC-8">PST (UTC-8)</option>
                  <option value="UTC+1">CET (UTC+1)</option>
                  <option value="UTC+8">SGT (UTC+8)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────── Receipt Customization ─────────── */}
        <section className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-title">
              <div className="settings-icon settings-icon-accent"><Receipt size={18} /></div>
              <h3>Receipt Customization</h3>
            </div>
          </div>
          <div className="settings-section-body">
            <div className="settings-form-grid full-width">
              <div className="input-group">
                <label className="input-label">Receipt Header</label>
                <input className="input-field" value={settings.receipt_header} onChange={e => update('receipt_header', e.target.value)} placeholder="Message shown at top of receipt" />
              </div>
              <div className="input-group">
                <label className="input-label">Receipt Footer</label>
                <input className="input-field" value={settings.receipt_footer} onChange={e => update('receipt_footer', e.target.value)} placeholder="Message shown at bottom of receipt" />
              </div>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">Show Logo on Receipt</div>
                <div className="setting-desc">Display your restaurant logo at the top of printed receipts</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={settings.receipt_show_logo} onChange={e => update('receipt_show_logo', e.target.checked)} />
                <span className="toggle-track" />
                <span className="toggle-thumb" />
              </label>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">Show Address on Receipt</div>
                <div className="setting-desc">Include restaurant address and contact info on receipts</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={settings.receipt_show_address} onChange={e => update('receipt_show_address', e.target.checked)} />
                <span className="toggle-track" />
                <span className="toggle-thumb" />
              </label>
            </div>
          </div>
        </section>

        {/* ─────────── Tax Configuration ─────────── */}
        <section className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-title">
              <div className="settings-icon settings-icon-success"><Percent size={18} /></div>
              <h3>Tax Configuration</h3>
            </div>
          </div>
          <div className="settings-section-body">
            <div className="settings-form-grid">
              <div className="input-group">
                <label className="input-label">Default Tax Rate (%)</label>
                <input className="input-field" type="number" step="0.1" min="0" max="100" value={settings.default_tax} onChange={e => update('default_tax', Number(e.target.value))} />
                <span className="input-hint">Applied to new products by default</span>
              </div>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">Tax Inclusive Pricing</div>
                <div className="setting-desc">If enabled, product prices include tax. Otherwise tax is added on top.</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={settings.tax_inclusive} onChange={e => update('tax_inclusive', e.target.checked)} />
                <span className="toggle-track" />
                <span className="toggle-thumb" />
              </label>
            </div>
          </div>
        </section>

        {/* ─────────── Notifications ─────────── */}
        <section className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-title">
              <div className="settings-icon settings-icon-info"><Bell size={18} /></div>
              <h3>Notifications</h3>
            </div>
          </div>
          <div className="settings-section-body">
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">New Order Alert</div>
                <div className="setting-desc">Get notified when a new order is placed</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={settings.notify_new_order} onChange={e => update('notify_new_order', e.target.checked)} />
                <span className="toggle-track" />
                <span className="toggle-thumb" />
              </label>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">Kitchen Ready Alert</div>
                <div className="setting-desc">Notify when kitchen marks an order as ready</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={settings.notify_kitchen_ready} onChange={e => update('notify_kitchen_ready', e.target.checked)} />
                <span className="toggle-track" />
                <span className="toggle-thumb" />
              </label>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">Sound Effects</div>
                <div className="setting-desc">Play sound effects for alerts and interactions</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={settings.sound_enabled} onChange={e => update('sound_enabled', e.target.checked)} />
                <span className="toggle-track" />
                <span className="toggle-thumb" />
              </label>
            </div>
          </div>
        </section>

        {/* ─────────── Printer Settings ─────────── */}
        <section className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-title">
              <div className="settings-icon settings-icon-warning"><Printer size={18} /></div>
              <h3>Printer Settings</h3>
            </div>
          </div>
          <div className="settings-section-body">
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">Enable Printer</div>
                <div className="setting-desc">Connect to a receipt printer for automatic printing</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={settings.printer_enabled} onChange={e => update('printer_enabled', e.target.checked)} />
                <span className="toggle-track" />
                <span className="toggle-thumb" />
              </label>
            </div>
            {settings.printer_enabled && (
              <>
                <div className="input-group animate-fadeInDown">
                  <label className="input-label">Printer Name / IP</label>
                  <input className="input-field" value={settings.printer_name} onChange={e => update('printer_name', e.target.value)} placeholder="e.g., POS-Printer-01 or 192.168.1.100" />
                </div>
                <div className="setting-row animate-fadeInDown">
                  <div className="setting-info">
                    <div className="setting-label">Auto-Print Receipts</div>
                    <div className="setting-desc">Automatically print receipt after payment</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={settings.auto_print_receipt} onChange={e => update('auto_print_receipt', e.target.checked)} />
                    <span className="toggle-track" />
                    <span className="toggle-thumb" />
                  </label>
                </div>
                <div className="setting-row animate-fadeInDown">
                  <div className="setting-info">
                    <div className="setting-label">Auto-Print Kitchen Tickets</div>
                    <div className="setting-desc">Automatically print ticket when order is sent to kitchen</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={settings.auto_print_kitchen} onChange={e => update('auto_print_kitchen', e.target.checked)} />
                    <span className="toggle-track" />
                    <span className="toggle-thumb" />
                  </label>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ─────────── Appearance ─────────── */}
        <section className="settings-section">
          <div className="settings-section-header">
            <div className="settings-section-title">
              <div className="settings-icon settings-icon-accent"><Palette size={18} /></div>
              <h3>Appearance</h3>
            </div>
          </div>
          <div className="settings-section-body">
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">Theme</div>
                <div className="setting-desc">Choose between light and dark mode for the dashboard</div>
              </div>
              <div className="theme-buttons">
                <button className={`theme-btn ${settings.theme === 'light' ? 'active' : ''}`} onClick={() => update('theme', 'light')}>
                  <Sun size={16} /> Light
                </button>
                <button className={`theme-btn ${settings.theme === 'dark' ? 'active' : ''}`} onClick={() => update('theme', 'dark')}>
                  <Moon size={16} /> Dark
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────── Danger Zone ─────────── */}
        <section className="settings-section danger-zone">
          <div className="settings-section-header">
            <div className="settings-section-title">
              <div className="settings-icon settings-icon-danger"><Shield size={18} /></div>
              <h3>Danger Zone</h3>
            </div>
          </div>
          <div className="settings-section-body">
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">Reset All Tables</div>
                <div className="setting-desc">Set all tables back to "available" status. Useful after demo sessions.</div>
              </div>
              <button className="btn-danger-outline" onClick={handleResetTables}>
                <RotateCcw size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Reset Tables
              </button>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-label">Clear Demo Data</div>
                <div className="setting-desc">Delete all orders, payments, and kitchen tickets. Products and tables will remain.</div>
              </div>
              <button className="btn-danger-outline" onClick={handleClearDemoData}>
                <Trash2 size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Clear Data
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Save Bar */}
      <div className="settings-save-bar animate-fadeInUp">
        <span className="settings-save-text">
          {saved ? '✓ Settings saved successfully' : 'Changes will be applied immediately'}
        </span>
        <button className="btn btn-ghost" onClick={() => window.location.reload()}>Discard</button>
        <button className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} onClick={handleSave} disabled={saving}>
          {saving ? '' : saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
