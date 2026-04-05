import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, X, Users as UsersIcon, RotateCcw, CheckCircle } from 'lucide-react';
import './floor-plans.css';

const statusColors = {
  available: 'table-available',
  occupied: 'table-occupied',
  reserved: 'table-reserved',
};

export default function FloorPlanPage() {
  const [floors, setFloors] = useState([]);
  const [activeFloor, setActiveFloor] = useState(null);
  const [showAddFloor, setShowAddFloor] = useState(false);
  const [newFloorName, setNewFloorName] = useState('');
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTable, setNewTable] = useState({ table_number: '', seats: 4, is_active: true, appointment_resource: '' });
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState(null);   // tracks which table is being reset
  const [resetDoneId, setResetDoneId] = useState(null);   // brief success flash

  useEffect(() => { fetchFloors(); }, []);

  async function fetchFloors() {
    setLoading(true);
    try {
      const { data: floorsData } = await supabase.from('floors').select('*').order('sort_order');
      if (!floorsData || floorsData.length === 0) {
        setFloors([]);
        setLoading(false);
        return;
      }

      const { data: tablesData } = await supabase.from('tables').select('*').order('table_number');

      const floorsWithTables = floorsData.map(floor => ({
        ...floor,
        tables: (tablesData || []).filter(t => t.floor_id === floor.id)
      }));

      setFloors(floorsWithTables);
      if (!activeFloor && floorsData.length > 0) setActiveFloor(floorsData[0].id);
    } catch (err) {
      console.error('Error fetching floors:', err);
    } finally {
      setLoading(false);
    }
  }

  const currentFloor = floors.find(f => f.id === activeFloor);

  async function addFloor() {
    if (!newFloorName.trim()) return;
    const { error } = await supabase.from('floors').insert({
      name: newFloorName,
      sort_order: floors.length + 1
    });
    if (error) { console.error(error); return; }
    setNewFloorName('');
    setShowAddFloor(false);
    fetchFloors();
  }

  async function addTable() {
    if (!newTable.table_number || !activeFloor) return;
    const { error } = await supabase.from('tables').insert({
      floor_id: activeFloor,
      table_number: newTable.table_number,
      seats: newTable.seats,
      status: newTable.is_active ? 'available' : 'reserved',
      appointment_resource: newTable.appointment_resource || null,
    });
    if (error) { console.error(error); return; }
    setNewTable({ table_number: '', seats: 4, is_active: true, appointment_resource: '' });
    setShowAddTable(false);
    fetchFloors();
  }

  async function deleteFloor(id) {
    if (!confirm('Delete floor and all tables?')) return;
    await supabase.from('tables').delete().eq('floor_id', id);
    await supabase.from('floors').delete().eq('id', id);
    if (activeFloor === id) setActiveFloor(floors[0]?.id);
    fetchFloors();
  }

  async function deleteTable(tableId) {
    if (!confirm('Delete this table?')) return;
    await supabase.from('tables').delete().eq('id', tableId);
    fetchFloors();
  }

  // ── Per-table reset ──────────────────────────────────────────────────────
  async function resetTable(tableId) {
    setResettingId(tableId);
    try {
      const { error } = await supabase
        .from('tables')
        .update({ status: 'available' })
        .eq('id', tableId);

      if (error) throw error;

      // Optimistic UI: update local state instantly
      setFloors(prev =>
        prev.map(floor => ({
          ...floor,
          tables: floor.tables.map(t =>
            t.id === tableId ? { ...t, status: 'available' } : t
          ),
        }))
      );

      // Flash success tick for 1.5s
      setResetDoneId(tableId);
      setTimeout(() => setResetDoneId(null), 1500);
    } catch (err) {
      console.error('Reset error:', err);
      alert('Failed to reset table: ' + err.message);
    } finally {
      setResettingId(null);
    }
  }

  return (
    <div className="floor-plan-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Floor Plans</h1>
          <p className="page-subtitle">Manage your restaurant floors and tables</p>
        </div>
      </div>

      <div className="floor-plan-layout">
        {/* Left: Floor List */}
        <div className="floor-list">
          <div className="floor-list-header">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary">Floors</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddFloor(true)}><Plus size={16} /></button>
          </div>

          {showAddFloor && (
            <div className="floor-add-inline animate-fadeInDown">
              <input
                className="input-field"
                placeholder="Floor name"
                value={newFloorName}
                onChange={e => setNewFloorName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addFloor()}
                autoFocus
              />
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={addFloor}>Add</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAddFloor(false)}>Cancel</button>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ padding: 'var(--space-4)' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />
              ))}
            </div>
          ) : (
            floors.map(floor => (
              <div
                key={floor.id}
                className={`floor-item ${activeFloor === floor.id ? 'active' : ''}`}
                onClick={() => setActiveFloor(floor.id)}
              >
                <div>
                  <span className="floor-item-name">{floor.name}</span>
                  <span className="floor-item-count">{floor.tables?.length || 0} tables</span>
                </div>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={e => { e.stopPropagation(); deleteFloor(floor.id); }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Right: Table Grid */}
        <div className="table-grid-panel">
          {currentFloor && (
            <>
              <div className="table-grid-header">
                <h2 className="font-display text-xl font-bold">{currentFloor.name}</h2>
                <button className="btn btn-accent btn-sm" onClick={() => setShowAddTable(true)}>
                  <Plus size={16} /> Add Table
                </button>
              </div>

              {/* Legend */}
              <div className="table-legend">
                <span className="legend-pill legend-available">● Available</span>
                <span className="legend-pill legend-occupied">● Occupied</span>
                <span className="legend-pill legend-reserved">● Reserved</span>
                <span className="legend-hint">Hover occupied/reserved tables to reset individually</span>
              </div>

              <div className="table-grid stagger-children">
                {currentFloor.tables?.map(table => {
                  const isNonAvailable = table.status !== 'available';
                  const isResetting = resettingId === table.id;
                  const isDone = resetDoneId === table.id;

                  return (
                    <div
                      key={table.id}
                      className={`table-card ${statusColors[table.status]} ${isNonAvailable ? 'table-card-hoverable' : ''}`}
                    >
                      {/* Table info */}
                      <span className="table-number">{table.table_number}</span>
                      <div className="table-seats"><UsersIcon size={14} /> {table.seats}</div>
                      <span className="table-status-label">{table.status}</span>

                      {/* Action buttons overlay */}
                      <div className="table-card-actions">
                        {/* Reset button — only show for occupied/reserved */}
                        {isNonAvailable && (
                          <button
                            className={`table-reset-btn ${isResetting ? 'resetting' : ''} ${isDone ? 'done' : ''}`}
                            onClick={() => resetTable(table.id)}
                            disabled={isResetting}
                            title="Reset to Available"
                          >
                            {isDone
                              ? <CheckCircle size={13} />
                              : <RotateCcw size={13} className={isResetting ? 'spin' : ''} />
                            }
                            {isDone ? 'Done' : isResetting ? '…' : 'Reset'}
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          className="table-delete-btn"
                          onClick={() => deleteTable(table.id)}
                          title="Delete table"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {(!currentFloor.tables || currentFloor.tables.length === 0) && (
                <div className="empty-state">
                  <p className="empty-state-title">No tables yet</p>
                  <p>Add tables to this floor</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddTable && (
        <div className="modal-overlay" onClick={() => setShowAddTable(false)}>
          <div className="modal-content animate-scaleIn" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 className="font-display text-lg font-bold">Add Table</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddTable(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="input-group">
                  <label className="input-label">Table Number <span className="required">*</span></label>
                  <input
                    className="input-field"
                    value={newTable.table_number}
                    onChange={e => setNewTable({ ...newTable, table_number: e.target.value })}
                    placeholder="e.g. 15"
                    autoFocus
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Seats</label>
                  <input
                    className="input-field"
                    type="number"
                    value={newTable.seats}
                    onChange={e => setNewTable({ ...newTable, seats: Number(e.target.value) })}
                    min={1}
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">
                  Appointment Resource{' '}
                  <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  className="input-field"
                  value={newTable.appointment_resource}
                  onChange={e => setNewTable({ ...newTable, appointment_resource: e.target.value })}
                  placeholder="e.g. Bar Seat, Private Room, Terrace"
                />
                <p className="text-xs text-tertiary mt-1">Links this table to a booking/reservation resource</p>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-3)', background: 'var(--surface-secondary)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={newTable.is_active}
                    onChange={e => setNewTable({ ...newTable, is_active: e.target.checked })}
                  />
                  <span className="toggle-track" />
                  <span className="toggle-thumb" />
                </label>
                <div>
                  <div className="text-sm font-semibold">Active</div>
                  <div className="text-xs text-tertiary">
                    {newTable.is_active ? 'Table is available for use' : 'Table is inactive / reserved'}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAddTable(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addTable}>Save Table</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
