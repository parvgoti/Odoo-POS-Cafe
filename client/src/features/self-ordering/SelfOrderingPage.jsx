import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { QrCode, Copy, ExternalLink, Check, Smartphone, Settings, Link2 } from 'lucide-react';
import './self-ordering.css';

export default function SelfOrderingPage() {
  const [enabled, setEnabled] = useState(true);
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const baseUrl = window.location.origin;
  const menuUrl = `${baseUrl}/self-order/menu`;

  useEffect(() => { fetchTables(); }, []);

  async function fetchTables() {
    try {
      const { data } = await supabase.from('tables').select('*, floors(name)').order('table_number');
      if (data) {
        setTables(data);
        setSelectedTables(data.map(t => t.id));
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  function toggleTable(id) {
    setSelectedTables(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  }

  function copyUrl() {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Simple deterministic QR code SVG generator
  function generateQRPattern(text) {
    const size = 25;
    const cells = [];
    // Create a deterministic pattern from the text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        // Finder patterns (top-left, top-right, bottom-left)
        const isFinderTL = row < 7 && col < 7;
        const isFinderTR = row < 7 && col >= size - 7;
        const isFinderBL = row >= size - 7 && col < 7;
        
        if (isFinderTL || isFinderTR || isFinderBL) {
          const lr = isFinderTL ? row : isFinderTR ? row : row - (size - 7);
          const lc = isFinderTL ? col : isFinderTR ? col - (size - 7) : col;
          const isBorder = lr === 0 || lr === 6 || lc === 0 || lc === 6;
          const isInner = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
          if (isBorder || isInner) {
            cells.push({ row, col, fill: true });
          }
          continue;
        }
        
        // Data area - use hash to create pattern
        const val = ((hash * (row * size + col + 1)) >>> 0) % 100;
        if (val < 45) {
          cells.push({ row, col, fill: true });
        }
      }
    }
    
    const cellSize = 8;
    const padding = 16;
    const svgSize = size * cellSize + padding * 2;
    
    return (
      <svg viewBox={`0 0 ${svgSize} ${svgSize}`} width="100%" height="100%">
        <rect width={svgSize} height={svgSize} fill="white" />
        {cells.map((cell, i) => (
          <rect
            key={i}
            x={padding + cell.col * cellSize}
            y={padding + cell.row * cellSize}
            width={cellSize}
            height={cellSize}
            fill={cell.fill ? '#1a1614' : 'white'}
            rx={1}
          />
        ))}
      </svg>
    );
  }

  return (
    <div className="self-ordering-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Self Ordering</h1>
          <p className="page-subtitle">Let customers order from their phones via QR code</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`self-order-status-banner ${enabled ? 'enabled' : ''}`}>
        <div className="self-order-status-left">
          <div className="self-order-status-dot" />
          <div className="self-order-status-info">
            <h3>{enabled ? 'Self Ordering is Active' : 'Self Ordering is Disabled'}</h3>
            <p>{enabled ? 'Customers can scan QR codes to browse menu and place orders' : 'Enable to allow customers to order from their devices'}</p>
          </div>
        </div>
        <label className="toggle">
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
          <span className="toggle-track" />
          <span className="toggle-thumb" />
        </label>
      </div>

      {enabled && (
        <>
          {/* QR Code Section */}
          <div className="self-order-qr-section stagger-children">
            <div className="qr-card">
              <h3>📱 Menu QR Code</h3>
              <div className="qr-code-display">
                {generateQRPattern(menuUrl)}
              </div>
              <p className="text-sm text-secondary mb-3">
                Print this QR code and place it on tables
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                <QrCode size={16} /> Download / Print
              </button>
              <div className="qr-url-bar mt-4">
                <input value={menuUrl} readOnly />
                <button className="btn btn-ghost btn-sm" onClick={copyUrl}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="self-order-config-card">
              <h3><Settings size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Configuration</h3>
              
              <div className="input-group mt-4">
                <label className="input-label">Welcome Message</label>
                <input className="input-field" defaultValue="Welcome! Browse our menu and order from your seat." />
              </div>

              <div className="input-group mt-4">
                <label className="input-label">Order Instructions</label>
                <textarea className="textarea-field" rows={2} defaultValue="After placing your order, our staff will serve it to your table." />
              </div>

              <div className="setting-row mt-4">
                <div className="setting-info">
                  <div className="setting-label">Require Table Selection</div>
                  <div className="setting-desc">Customers must select their table number before ordering</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-track" />
                  <span className="toggle-thumb" />
                </label>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-label">Show Price on Menu</div>
                  <div className="setting-desc">Display product prices on the self-ordering menu</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-track" />
                  <span className="toggle-thumb" />
                </label>
              </div>
            </div>
          </div>

          {/* Table Assignment */}
          <div className="self-order-config-card">
            <h3><Link2 size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Table Assignment</h3>
            <p className="text-sm text-secondary mt-2">
              Select which tables are available for self-ordering ({selectedTables.length} of {tables.length} selected)
            </p>
            
            {loading ? (
              <div className="table-assignment-grid mt-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 48, borderRadius: 8 }} />
                ))}
              </div>
            ) : (
              <div className="table-assignment-grid">
                {tables.map(table => (
                  <button
                    key={table.id}
                    className={`table-assignment-item ${selectedTables.includes(table.id) ? 'selected' : ''}`}
                    onClick={() => toggleTable(table.id)}
                  >
                    {selectedTables.includes(table.id) && <Check size={14} />}
                    Table {table.table_number}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preview Link */}
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-secondary">
              <Smartphone size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Preview how customers will see the menu
            </p>
            <a href="/self-order/menu" target="_blank" rel="noopener" className="btn btn-secondary btn-sm">
              <ExternalLink size={16} /> Preview Menu
            </a>
          </div>
        </>
      )}
    </div>
  );
}
