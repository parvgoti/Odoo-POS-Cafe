import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Users, DollarSign } from 'lucide-react';

export default function FloorView() {
  const [floors, setFloors] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeFloor, setActiveFloor] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();

    // ── Realtime subscription: update table status instantly ──────────
    const channel = supabase
      .channel('floor-tables-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            // Update just the changed table in local state — no full re-fetch needed
            setTables(prev =>
              prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t)
            );
          } else {
            // INSERT or DELETE — do a full refresh
            fetchData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchData() {
    try {
      const { data: floorsData } = await supabase.from('floors').select('*').order('sort_order');
      const { data: tablesData } = await supabase.from('tables').select('*').order('table_number');

      if (floorsData) setFloors(floorsData);
      if (tablesData) setTables(tablesData);
      if (floorsData?.length > 0) setActiveFloor(prev => prev || floorsData[0].id);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredTables = tables.filter(t => t.floor_id === activeFloor);

  function selectTable(table) {
    navigate(`/pos/order/${table.id}`);
  }

  return (
    <div className="pos-floor-view animate-fadeIn">
      {/* Floor Tabs */}
      <div className="pos-floor-tabs">
        {floors.map(floor => (
          <button
            key={floor.id}
            className={`pos-floor-tab ${activeFloor === floor.id ? 'active' : ''}`}
            onClick={() => setActiveFloor(floor.id)}
          >
            {floor.name}
          </button>
        ))}
      </div>

      {/* Table Grid */}
      {loading ? (
        <div className="pos-table-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="pos-table-card pos-table-available skeleton-wrapper" style={{ height: 180 }}>
              <div className="skeleton" style={{ width: 60, height: 40, borderRadius: 8, margin: '0 auto' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="pos-table-grid stagger-children">
          {filteredTables.map(table => (
            <button
              key={table.id}
              className={`pos-table-card pos-table-${table.status}`}
              onClick={() => selectTable(table)}
            >
              <span className="pos-table-number">{table.table_number}</span>
              <div className="pos-table-seats">
                <Users size={14} />
                <span>{table.seats}</span>
              </div>
              {table.status === 'occupied' && table.current_total && (
                <div className="pos-table-info">
                  <span className="pos-table-total">
                    <DollarSign size={12} />
                    {Number(table.current_total).toFixed(2)}
                  </span>
                </div>
              )}
              <span className="pos-table-status">{table.status}</span>
            </button>
          ))}
        </div>
      )}

      {!loading && filteredTables.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--neutral-500)' }}>
          <p style={{ fontSize: 'var(--text-lg)' }}>No tables on this floor</p>
          <p style={{ fontSize: 'var(--text-sm)' }}>Add tables in Floor Plans settings</p>
        </div>
      )}
    </div>
  );
}
