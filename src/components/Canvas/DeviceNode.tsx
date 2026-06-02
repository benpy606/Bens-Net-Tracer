import React from 'react';
import type { Device, DeviceType } from '../../types/network';

interface DeviceNodeProps {
  device: Device;
  isSelected: boolean;
  isConnectionSource: boolean;
  onMouseDown: (e: React.MouseEvent, deviceId: string) => void;
  onSelect: (deviceId: string) => void;
  onDoubleClick?: (deviceId: string) => void;
  onStartConnection: (e: React.MouseEvent, deviceId: string) => void;
  onDelete: (deviceId: string) => void;
}

const getDeviceColor = (type: DeviceType): string => {
  switch (type) {
    case 'router': return '#22d3ee';
    case 'switch': return '#60a5fa';
    case 'server': return '#34d399';
    case 'firewall': return '#fb7185';
    case 'pc': return '#a78bfa';
  }
};

const getDeviceGradient = (type: DeviceType): [string, string] => {
  switch (type) {
    case 'router': return ['#22d3ee', '#06b6d4'];
    case 'switch': return ['#60a5fa', '#3b82f6'];
    case 'server': return ['#34d399', '#10b981'];
    case 'firewall': return ['#fb7185', '#ef4444'];
    case 'pc': return ['#a78bfa', '#8b5cf6'];
  }
};

export const DeviceNode: React.FC<DeviceNodeProps> = ({
  device,
  isSelected,
  isConnectionSource,
  onMouseDown,
  onSelect,
  onDoubleClick,
  onStartConnection,
  onDelete
}) => {
  const color = getDeviceColor(device.type);
  const [gradStart, gradEnd] = getDeviceGradient(device.type);
  const size = 54;
  const radius = size / 2;

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(device.id);
  };

  const handleNodeDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDoubleClick) {
      onDoubleClick(device.id);
    }
  };

  const handlePortClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartConnection(e, device.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(device.id);
  };

  // Determine power state
  const isPowerOff = device.powerStatus === 'off';
  const gradId = `grad-${device.id}`;
  const glowId = `glow-${device.id}`;

  return (
    <g
      transform={`translate(${device.x - radius}, ${device.y - radius})`}
      onMouseDown={(e) => onMouseDown(e, device.id)}
      onClick={handleNodeClick}
      onDoubleClick={handleNodeDoubleClick}
      style={{ cursor: 'grab', userSelect: 'none' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradStart} stopOpacity="0.15" />
          <stop offset="100%" stopColor={gradEnd} stopOpacity="0.05" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
          <feFlood floodColor={color} floodOpacity="0.2" result="color" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow effect behind selected node */}
      {(isSelected || isConnectionSource) && (
        <rect
          x="-8"
          y="-8"
          width={size + 16}
          height={size + 16}
          rx="12"
          fill="none"
          stroke={isConnectionSource ? '#fbbf24' : color}
          strokeWidth="2"
          strokeDasharray={isConnectionSource ? '5 5' : '0'}
          style={{
            opacity: 0.7,
            filter: `drop-shadow(0 0 8px ${isConnectionSource ? 'rgba(251,191,36,0.4)' : color + '60'})`,
          }}
        />
      )}

      {/* Main Node Background */}
      <rect
        x="0"
        y="0"
        width={size}
        height={size}
        rx="10"
        fill={isPowerOff ? '#1e293b' : '#0f172a'}
        stroke={isSelected ? color : 'rgba(255,255,255,0.08)'}
        strokeWidth={isSelected ? '1.5' : '1'}
        style={{
          transition: 'stroke 0.25s ease, stroke-width 0.25s ease',
          opacity: isPowerOff ? 0.5 : 1,
        }}
      />

      {/* Gradient overlay */}
      <rect
        x="0"
        y="0"
        width={size}
        height={size}
        rx="10"
        fill={`url(#${gradId})`}
        style={{ opacity: isPowerOff ? 0.3 : 0.8 }}
      />

      {/* Top accent line */}
      <rect
        x="8"
        y="1"
        width={size - 16}
        height="2"
        rx="1"
        fill={color}
        style={{ opacity: isSelected ? 0.6 : 0.2 }}
      />

      {/* Custom Vector Icon Drawing */}
      <g transform="translate(11, 11)">
        {device.type === 'router' && (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 6v12" />
            <path d="M6 12h12" />
            <path d="M12 6l-2 2M12 6l2 2" />
            <path d="M12 18l-2-2M12 18l2-2" />
            <path d="M6 12l2-2M6 12l2 2" />
            <path d="M18 12l-2-2M18 12l2 2" />
          </svg>
        )}
        {device.type === 'switch' && (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M4 10h16" />
            <path d="M4 14h16" />
            <path d="M7 10l2-2M7 10l2 2" />
            <path d="M17 14l-2-2M17 14l-2 2" />
          </svg>
        )}
        {device.type === 'server' && (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <rect x="7" y="5" width="10" height="4" rx="1" />
            <circle cx="8" cy="15" r="1.5" fill={color} />
            <circle cx="16" cy="15" r="1.5" fill={color} />
          </svg>
        )}
        {device.type === 'firewall' && (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M3 15h18" />
            <path d="M9 3v18" />
            <path d="M15 3v18" />
          </svg>
        )}
        {device.type === 'pc' && (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="13" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="16" x2="12" y2="21" />
          </svg>
        )}
      </g>

      {/* Label underneath */}
      <text
        x={radius}
        y={size + 24}
        textAnchor="middle"
        fill="#e2e8f0"
        style={{ fontSize: '10px', fontWeight: 600, fontFamily: "'Inter', sans-serif", letterSpacing: '0.2px' }}
      >
        {device.name}
      </text>

      {/* IP Address Label under name */}
      {device.ipAddress && (
        <text
          x={radius}
          y={size + 38}
          textAnchor="middle"
          fill="#64748b"
          style={{ fontSize: '8px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}
        >
          {device.ipAddress}
          {device.subnetMask && `/${device.subnetMask}`}
        </text>
      )}

      {/* Power status indicator */}
      <circle
        cx={size - 7}
        cy={7}
        r="4"
        fill={isPowerOff ? '#ef4444' : '#22c55e'}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="0.5"
        style={{
          filter: isPowerOff
            ? 'drop-shadow(0 0 3px rgba(239,68,68,0.5))'
            : 'drop-shadow(0 0 3px rgba(34,197,94,0.5))',
        }}
      />

      {/* Connection Port Pin */}
      <g
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handlePortClick}
        style={{ cursor: 'pointer' }}
      >
        <circle
          cx={size - 6}
          cy={size - 6}
          r="5"
          fill={isConnectionSource ? '#fbbf24' : 'rgba(255, 255, 255, 0.08)'}
          stroke={isConnectionSource ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)'}
          strokeWidth="1"
          style={{
            transition: 'all 0.2s ease',
            filter: isConnectionSource ? 'drop-shadow(0 0 6px rgba(251,191,36,0.5))' : 'none',
          }}
        />
        {/* Port icon */}
        <circle
          cx={size - 6}
          cy={size - 6}
          r="2"
          fill={isConnectionSource ? '#fff' : 'rgba(255, 255, 255, 0.3)'}
          style={{ pointerEvents: 'none' }}
        />
      </g>
      <title>Click port to connect this device</title>

      {/* Delete Overlay Button */}
      {isSelected && (
        <g
          transform="translate(-6, -6)"
          onClick={handleDeleteClick}
          style={{ cursor: 'pointer' }}
        >
          <circle cx="8" cy="8" r="8" fill="#ef4444" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(239,68,68,0.4))' }} />
          <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};
