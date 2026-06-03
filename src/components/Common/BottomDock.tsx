import React from 'react';
import type { DeviceType } from '../../types/network';
import { DataLogTable } from './DataLogTable';

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
  simPanelWidth?: number;
  onSimPanelResize?: (width: number) => void;
  onFireEvent: (id: string) => void;
  onEditEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
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
  simPanelWidth = 260,
  onSimPanelResize,
  onFireEvent,
  onEditEvent,
  onDeleteEvent,
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

  const VerticalDivider = () => (
    <div style={{ width: '1px', flexShrink: 0, background: 'var(--border-default)', alignSelf: 'stretch' }} />
  );

  const HorizontalResizer = () => {
    const [dragging, setDragging] = React.useState(false);
    const startXRef = React.useRef(0);
    const startWidthRef = React.useRef(simPanelWidth);

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setDragging(true);
      startXRef.current = e.clientX;
      startWidthRef.current = simPanelWidth;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    };

    React.useEffect(() => {
      if (!dragging) return;
      const move = (ev: MouseEvent) => {
        const dx = startXRef.current - ev.clientX;
        const next = Math.max(180, Math.min(480, startWidthRef.current + dx));
        onSimPanelResize?.(next);
      };
      const up = () => {
        setDragging(false);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      return () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
    }, [dragging, onSimPanelResize]);

return (
    <div onMouseDown={handleMouseDown} style={{ width: '6px', cursor: 'col-resize', flexShrink: 0, position: 'relative', zIndex: 5 }}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 2,
          height: dragging ? 30 : 20,
          background: dragging ? 'var(--accent-primary)' : 'var(--border-default)',
          borderRadius: 999,
          boxShadow: dragging ? `0 0 10px var(--border-active)` : 'none',
          transition: 'all 0.15s ease',
        }}
      />
    </div>
  );
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
                    background: isActive ? 'var(--border-active)' : 'var(--border-secondary)',
                    border: isActive ? '1px solid var(--border-hover)' : '1px solid var(--border-default)',
                    color: isActive ? '#fff' : 'var(--text-primary)',
                    boxShadow: isActive ? `0 0 20px var(--border-active)` : 'none',
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
                      color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      background: isActive ? 'var(--border-active)' : 'var(--border-secondary)',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      border: '1px solid var(--border-default)',
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

      <VerticalDivider />

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
                  background: 'var(--border-secondary)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
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

      <VerticalDivider />

      <div className="cisco-dock-col" style={{ flex: '1 1 auto', minWidth: 0 }}>
        <div className="cisco-dock-col-header">
          <h3 className="cisco-dock-col-title">📝 Packet Streams</h3>
        </div>
        <div className="cisco-dock-scroll">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {simulationEvents.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', padding: '16px 6px', textAlign: 'center' }}>
                No packet streams tracked yet.
              </div>
            ) : (
              simulationEvents.slice().reverse().slice(0, 8).map((ev, idx) => (
                <div
                  key={`${ev.id}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    background: 'var(--border-secondary)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.4px', color: 'var(--accent-primary)', background: 'var(--border-active)', padding: '3px 8px', borderRadius: '999px', border: '1px solid var(--border-hover)' }}>
                    {ev.protocol}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.73rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ev.source}
                    <span style={{ color: 'var(--text-tertiary)', margin: '0 6px' }}>→</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ev.dest}</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <VerticalDivider />

      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', flexShrink: 0 }}>
        <div className="cisco-dock-col" style={{ width: simPanelWidth, minWidth: 180, maxWidth: 480 }}>
          <div className="cisco-dock-col-header">
            <h3 className="cisco-dock-col-title">🕓 Realtime / Simulation</h3>
          </div>
          <div className="cisco-dock-scroll">
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', borderRadius: '10px', padding: '4px', background: 'var(--border-secondary)', border: '1px solid var(--border-default)', width: 'fit-content' }}>
              <button
                onClick={() => setSimulationMode('realtime')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  border: 'none',
                  background: simulationMode === 'realtime' ? 'var(--accent-primary)' : 'transparent',
                  color: simulationMode === 'realtime' ? '#fff' : 'var(--text-primary)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s ease',
                }}
              >
                Realtime
              </button>
              <button
                onClick={() => setSimulationMode('simulation')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  border: 'none',
                  background: simulationMode === 'simulation' ? 'var(--accent-secondary)' : 'transparent',
                  color: simulationMode === 'simulation' ? '#fff' : 'var(--text-primary)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s ease',
                }}
              >
                Simulation
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              {[
                { label: '▶ Play', bg: 'var(--accent-primary)', color: '#fff', onClick: onPlaySimulation },
                { label: '⏭ Step', bg: 'var(--border-secondary)', color: '#fff', onClick: onStepSimulation },
                { label: '↺ Reset', bg: 'var(--border-active)', color: '#fff', onClick: onResetSimulation },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.onClick}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '10px',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    border: 'none',
                    background: btn.bg,
                    color: btn.color,
                    fontWeight: 700,
                  }}
                >
                  {btn.label}
                </button>
              ))}
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
                  border: '1px solid var(--border-hover)',
                  background: 'var(--border-active)',
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                  fontWeight: 600,
                }}
              >
                Cancel Connection
              </button>
            )}

            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '999px', background: simulationMode === 'realtime' ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
              <span>
                {simulationMode === 'realtime' ? 'Live Monitoring' : 'Simulation Paused'} - {simulationEvents.length} events
              </span>
            </div>
          </div>
        </div>

        <HorizontalResizer />

        <div style={{ flex: '1 1 auto', minWidth: 200, maxWidth: 600 }}>
          <DataLogTable
            events={simulationEvents}
            onFire={onFireEvent}
            onEdit={onEditEvent}
            onDelete={onDeleteEvent}
          />
        </div>
      </div>
    </div>
  );
};
