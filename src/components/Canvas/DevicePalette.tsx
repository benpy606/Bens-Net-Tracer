import React from 'react';
import type { DeviceType } from '../../types/network';

interface DevicePaletteProps {
  onAddDevice: (type: DeviceType) => void;
}

export const getDeviceIcon = (type: DeviceType, color = 'currentColor', size = 32) => {
  switch (type) {
    case 'router':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
          <path d="M12 8l4 4-4 4" />
          <path d="M12 8l-4 4 4 4" />
        </svg>
      );
    case 'switch':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
          <path d="M6 12h12" />
          <path d="M6 9l-3 3 3 3" />
          <path d="M18 9l3 3-3 3" />
        </svg>
      );
    case 'server':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
          <line x1="10" y1="6" x2="18" y2="6" />
          <line x1="10" y1="18" x2="18" y2="18" />
        </svg>
      );
    case 'firewall':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M8 11h8" />
          <path d="M8 15h8" />
          <path d="M12 7v8" />
        </svg>
      );
    case 'pc':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
  }
};

const PALETTE_ITEMS: { type: DeviceType; name: string; description: string; color: string }[] = [
  { type: 'router', name: 'Router', description: 'Layer 3 device - forwards packets between subnets.', color: '#06b6d4' },
  { type: 'switch', name: 'Switch', description: 'Layer 2 device - connects nodes in the same network.', color: '#3b82f6' },
  { type: 'server', name: 'Server', description: 'Provides services (DHCP, DNS, Web) to clients.', color: '#10b981' },
  { type: 'firewall', name: 'Firewall', description: 'Monitors and filters incoming/outgoing traffic.', color: '#f43f5e' },
  { type: 'pc', name: 'PC Host', description: 'End-user client machine needing an IP assignment.', color: '#a78bfa' }
];

export const DevicePalette: React.FC<DevicePaletteProps> = ({ onAddDevice }) => {
  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: '#fff' }}>
        Device Palette
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        Click a device card below to instantly add it to your network layout.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {PALETTE_ITEMS.map((item) => (
          <button
            key={item.type}
            onClick={() => onAddDevice(item.type)}
            className="glass-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              textAlign: 'left',
              gap: '12px',
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              borderLeft: `4px solid ${item.color}`
            }}
          >
            <div style={{ color: item.color, background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '6px' }}>
              {getDeviceIcon(item.type, item.color, 24)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>{item.name}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.2' }}>{item.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
