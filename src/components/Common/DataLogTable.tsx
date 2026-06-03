import React from 'react';
import type { SimEvent } from '../../types/network';

interface DataLogTableProps {
  events: SimEvent[];
  onFire: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

type StatusVariant = 'success' | 'failed' | 'sent';

const STATUS_META: Record<string, StatusVariant> = {
  Success: 'success',
  Failed: 'failed',
  Sent: 'sent',
};

const PROTOCOL_COLORS: Record<string, string> = {
  ICMP: '#14b8a6',
  TCP: '#3b82f6',
  UDP: '#6366f1',
  HTTP: '#f59e0b',
  HTTPS: '#22c55e',
};

const STATUS_COLORS: Record<string, string> = {
  Success: 'var(--accent-emerald)',
  Failed: 'var(--accent-rose)',
  Sent: 'var(--accent-amber)',
};

const TIME_FACTOR: Record<string, number> = {
  ICMP: 45,
  TCP: 120,
  UDP: 10,
  HTTP: 180,
  HTTPS: 200,
};

export const DataLogTable: React.FC<DataLogTableProps> = ({ events, onFire, onEdit, onDelete }) => {
  const effectiveEvents = React.useMemo(
    () => events.slice().reverse().slice(0, 40),
    [events]
  );

  return (
    <div className="data-log-container">
      <div className="data-log-header">
        <span className="data-log-title">Data Log</span>
        <span className="data-log-count">{events.length} entries</span>
      </div>

      <div className="data-log-table-wrapper">
        <table className="data-log-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}>Fire</th>
              <th style={{ width: 110 }}>Last Status</th>
              <th className="col-source">Source</th>
              <th className="col-destination">Destination</th>
              <th className="col-type">Type</th>
              <th style={{ width: 64 }}>Color</th>
              <th style={{ width: 80 }}>Time(sec)</th>
              <th style={{ width: 80 }}>Periodic</th>
              <th style={{ width: 58 }}>Num</th>
              <th style={{ width: 100 }}>Edit / Delete</th>
            </tr>
          </thead>
          <tbody>
            {effectiveEvents.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: 22, color: '#64748b' }}>
                  No data log entries yet.
                </td>
              </tr>
            ) : (
              effectiveEvents.map((ev, idx) => {
                const statusVariant = STATUS_META[ev.status] ?? 'sent';
                const colorHex = PROTOCOL_COLORS[ev.protocol] ?? '#94a3b8';
                const timeSec = Math.max(0.0, TIME_FACTOR[ev.protocol] ?? 5);
                const originIndex = events.length - 1 - idx;
                const periodic = idx % 3 === 0;

                return (
                  <tr key={ev.id}>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="data-log-cell-fire"
                        onClick={() => onFire(ev.id)}
                        aria-label={`Fire ${ev.protocol} packet`}
                      >
                        ▸
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`data-log-cell-status data-log-status-${statusVariant}`}>
                        <span
                          className={`data-log-status-dot data-log-backdrop-${statusVariant}`}
                          style={{ background: STATUS_COLORS[ev.status] ?? '#94a3b8' }}
                        />
                        {ev.status}
                      </span>
                    </td>
                    <td className="col-source">{ev.source}</td>
                    <td className="col-destination">{ev.dest}</td>
                    <td className="col-type">{ev.protocol}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className="data-log-cell-color"
                        style={{ background: colorHex }}
                        aria-hidden
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>{timeSec.toFixed(1)}</td>
                    <td style={{ textAlign: 'center' }}>{periodic ? 'Yes' : 'No'}</td>
                    <td style={{ textAlign: 'center', color: '#cbd5e1', fontVariantNumeric: 'tabular-nums' }}>
                      {originIndex + 1}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="data-log-cell-actions">
                        <button
                          className="data-log-action-btn"
                          onClick={() => onEdit(ev.id)}
                          aria-label={`Edit event ${ev.id}`}
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          className="data-log-action-btn danger"
                          onClick={() => onDelete(ev.id)}
                          aria-label={`Delete event ${ev.id}`}
                          title="Delete"
                        >
                          ✕
                        </button>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
