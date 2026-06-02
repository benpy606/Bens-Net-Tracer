import React from 'react';
import type { DeviceType } from '../../types/network';

interface BottomDockProps {
  onAddDevice: (type: DeviceType, modelName?: string) => void;
  onPlaySimulation: () => void;
  onStepSimulation: () => void;
  onResetSimulation: () => void;
  simulationMode: 'realtime' | 'simulation';
  setSimulationMode: (mode: 'realtime' | 'simulation') => void;
  simulationEvents: Array<{ id: string; protocol: string; source: string; dest: string; status: string }>;
  isConnectingMode: boolean;
  onCancelConnectingMode: () => void;
  height?: number;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  onAddDevice,
  onPlaySimulation,
  onStepSimulation,
  onResetSimulation,
  simulationMode,
  setSimulationMode,
  simulationEvents,
  isConnectingMode,
  onCancelConnectingMode,
  height = 190,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<'network' | 'end' | 'connections'>('network');

  const networkDevices: { type: DeviceType; label: string; icon: string }[] = [
    { type: 'router', label: 'Router', icon: '🌐' },
    { type: 'switch', label: 'Switch', icon: '🔌' },
    { type: 'pc', label: 'PC', icon: '🖥️' },
    { type: 'server', label: 'Server', icon: '🗄️' },
    { type: 'firewall', label: 'Firewall', icon: '🔥' },
  ];

  const endDevices: { type: DeviceType; label: string; icon: string }[] = [
    { type: 'pc', label: 'Workstation', icon: '🖥️' },
    { type: 'server', label: 'Database', icon: '🗄️' },
  ];

  const connectionsDevices: { type: DeviceType; label: string; icon: string }[] = [
    { type: 'router', label: 'WAN Router', icon: '🌍' },
    { type: 'switch', label: 'Trunk Switch', icon: '🔌' },
  ];

  const categories = [
    { key: 'network' as const, label: 'Network', tag: 'CORE' },
    { key: 'end' as const, label: 'End', tag: 'ENDPOINTS' },
    { key: 'connections' as const, label: 'Connections', tag: 'LINKS' },
  ];

  const currentDevices = () => {
    if (selectedCategory === 'network') return networkDevices;
    if (selectedCategory === 'end') return endDevices;
    return connectionsDevices;
  };

  return (
    <div className="cisco-bottom-dock" style={{ height: `${height}px` }}>
      <div className="cisco-dock-col">
        <div className="cisco-dock-col-header">
          <h3 className="cisco-dock-col-title">📂 Categories</h3>
        </div>
        <div className="cisco-dock-scroll">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {categories.map(({ key, label, tag }) => {
              const isActive = selectedCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '9px 10px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(20, 184, 166, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                    border: isActive ? '1px solid rgba(20, 184, 166, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#fff' : '#e2e8f0',
                    boxShadow: isActive ? '0 0 18px rgba(20, 184, 166, 0.16)' : 'none',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>
                    {key === 'network' ? '🌐' : key === 'end' ? '💻' : '🔗'}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                      color: isActive ? '#14b8a6' : '#94a3b8',
                      background: isActive ? 'rgba(20, 184, 166, 0.16)' : 'rgba(255, 255, 255, 0.06)',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="cisco-dock-col">
        <div className="cisco-dock-col-header">
          <h3 className="cisco-dock-col-title">⚙️ Device Models</h3>
        </div>
        <div className="cisco-dock-scroll">
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
            {currentDevices().map((dev) => (
              <button
                key={dev.type}
                onClick={() => onAddDevice(dev.type)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 8px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  transition: 'all 0.18s ease',
                }}
              >
                <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{dev.icon}</span>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.2px', textAlign: 'center' }}>
                  {dev.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="cisco-dock-col">
        <div className="cisco-dock-col-header">
          <h3 className="cisco-dock-col-title">📝 Packet Streams</h3>
        </div>
        <div className="cisco-dock-scroll">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.7rem', color: '#e2e8f0', letterSpacing: '0.4px', textTransform: 'uppercase', fontWeight: 600 }}>
            <span>Active Streams</span>
            <span style={{ fontSize: '0.6rem', background: 'rgba(59, 130, 246, 0.16)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#bfdbfe', padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
              {simulationEvents.length} events
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {simulationEvents.length === 0 && (
              <div style={{ fontSize: '0.75rem', color: '#64748b', padding: '16px 6px', textAlign: 'center' }}>
                No packet streams tracked yet.
              </div>
            )}
            {simulationEvents.slice().reverse().map((ev, idx) => (
              <div
                key={`${ev.id}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.4px', color: '#14b8a6', background: 'rgba(20, 184, 166, 0.12)', padding: '3px 8px', borderRadius: '999px', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
                  {ev.protocol}
                </span>
                <span style={{ color: '#cbd5e1', fontSize: '0.73rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.source}
                  <span style={{ color: '#64748b', margin: '0 6px' }}>→</span>
                  <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{ev.dest}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cisco-dock-col cisco-sim-panel">
        <div className="cisco-dock-col-header">
          <h3 className="cisco-dock-col-title">🕓 Realtime / Simulation</h3>
        </div>
        <div className="cisco-dock-scroll">
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', borderRadius: '10px', padding: '4px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <button
              onClick={() => setSimulationMode('realtime')}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '10px',
                fontSize: '0.74rem',
                cursor: 'pointer',
                border: 'none',
                background: simulationMode === 'realtime' ? '#14b8a6' : 'transparent',
                color: simulationMode === 'realtime' ? '#fff' : '#e2e8f0',
                fontWeight: 700,
              }}
            >
              Realtime
            </button>
            <button
              onClick={() => setSimulationMode('simulation')}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '10px',
                fontSize: '0.74rem',
                cursor: 'pointer',
                border: 'none',
                background: simulationMode === 'simulation' ? '#2563eb' : 'transparent',
                color: simulationMode === 'simulation' ? '#fff' : '#e2e8f0',
                fontWeight: 700,
              }}
            >
              Simulation
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <button onClick={onPlaySimulation} style={{ flex: 1, padding: '8px 10px', borderRadius: '10px', fontSize: '0.74rem', cursor: 'pointer', border: 'none', background: '#22c55e', color: '#052e16', fontWeight: 700 }}>
              ▶ Play
            </button>
            <button onClick={onStepSimulation} style={{ flex: 1, padding: '8px 10px', borderRadius: '10px', fontSize: '0.74rem', cursor: 'pointer', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700 }}>
              ⏭ Step
            </button>
            <button onClick={onResetSimulation} style={{ flex: 1, padding: '8px 10px', borderRadius: '10px', fontSize: '0.74rem', cursor: 'pointer', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700 }}>
              ↺ Reset
            </button>
          </div>

          {isConnectingMode && (
            <button
              onClick={onCancelConnectingMode}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '10px',
                fontSize: '0.74rem',
                cursor: 'pointer',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#fecdd3',
                marginBottom: '10px',
                fontWeight: 600,
              }}
            >
              Cancel Connection
            </button>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: '#94a3b8' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '999px', background: simulationMode === 'realtime' ? '#22c55e' : '#64748b' }} />
            <span>
              {simulationMode === 'realtime' ? 'Live Monitoring Active' : 'Simulation Mode Paused'} - {simulationEvents.length} events
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
