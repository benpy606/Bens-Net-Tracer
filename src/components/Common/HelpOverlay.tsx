import React from 'react';

interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpOverlay: React.FC<HelpOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1.5px solid var(--accent-cyan)',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)', margin: 0 }}>
            Student Quick Reference & Guide
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              color: '#fff',
              fontSize: '1.2rem',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Core Controls */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>🎮 Canvas Operations</h3>
          <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li><strong>Add Devices:</strong> Click any device card in the palette (left side) to add it to the canvas.</li>
            <li><strong>Move Nodes:</strong> Grab and drag any node. It will automatically snap to the alignment grid.</li>
            <li><strong>Connect Nodes:</strong> Click the small pin (bottom-right circle) on a device, then click another device to draw an active link line.</li>
            <li><strong>Delete Elements:</strong> Click a device or connection line to select it, then click the small red "×" button to delete it.</li>
          </ul>
        </div>

        {/* Subnetting Basics */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>💡 Subnetting Cheat Sheet</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            An IP address consists of 32 bits separated into 4 octets. The <strong>CIDR mask (e.g. /24)</strong> defines how many bits represent the network prefix, leaving the rest for host addresses.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '6px 12px' }}>CIDR Mask</th>
                <th style={{ padding: '6px 12px' }}>Dotted Decimal Mask</th>
                <th style={{ padding: '6px 12px' }}>Usable Host Capacity</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>/30</td>
                <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>255.255.255.252</td>
                <td style={{ padding: '6px 12px', color: 'var(--accent-cyan)' }}>2 usable hosts (WAN Links)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>/28</td>
                <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>255.255.255.240</td>
                <td style={{ padding: '6px 12px', color: 'var(--accent-cyan)' }}>14 usable hosts</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>/26</td>
                <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>255.255.255.192</td>
                <td style={{ padding: '6px 12px', color: 'var(--accent-cyan)' }}>62 usable hosts</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>/24</td>
                <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>255.255.255.0</td>
                <td style={{ padding: '6px 12px', color: 'var(--accent-cyan)' }}>254 usable hosts (Standard LAN)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <button
          onClick={onClose}
          className="glass-button primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
        >
          Got it, let's build!
        </button>
      </div>
    </div>
  );
};
