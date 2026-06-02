import React from 'react';

interface HeaderProps {
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  onExportJSON: () => void;
  onToggleHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSave,
  onLoad,
  onClear,
  onExportJSON,
  onToggleHelp
}) => {
  return (
    <header
      className="glass-panel"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(15, 23, 42, 0.9)'
      }}
    >
      {/* Brand & Subtext */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 700,
            margin: 0,
            background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}
        >
          NetTopology-Sim
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Interactive Network Topology Designer & Subnet Calculator
        </p>
      </div>

      {/* Global Actions */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={onSave} className="glass-button" title="Save layout to browser localStorage">
          💾 Save Layout
        </button>
        <button onClick={onLoad} className="glass-button" title="Load layout from localStorage">
          📂 Load Layout
        </button>
        <button onClick={onExportJSON} className="glass-button" title="Download network topology schema as JSON file">
          📥 Export JSON
        </button>
        <button onClick={onClear} className="glass-button" style={{ borderColor: 'rgba(244, 63, 94, 0.3)', color: '#fda4af' }} title="Reset canvas and delete all device nodes">
          🗑️ Clear All
        </button>
        <button
          onClick={onToggleHelp}
          className="glass-button"
          style={{
            background: 'rgba(6, 182, 212, 0.1)',
            borderColor: 'var(--accent-cyan)',
            color: '#fff',
            fontWeight: 600
          }}
        >
          ❓ Help
        </button>
      </div>
    </header>
  );
};
