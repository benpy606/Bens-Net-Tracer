import React from 'react';

interface CiscoToolbarProps {
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  onExportJSON: () => void;
  onToggleHelp: () => void;
  activeTool: 'select' | 'delete' | 'note';
  setActiveTool: (tool: 'select' | 'delete' | 'note') => void;
  zoom: number;
  setZoom: (z: number) => void;
}

export const CiscoToolbar: React.FC<CiscoToolbarProps> = ({
  onSave,
  onLoad,
  onClear,
  onExportJSON,
  onToggleHelp,
  activeTool,
  setActiveTool,
  zoom,
  setZoom,
}) => {
  const handleZoomOut = () => setZoom(Math.max(0.25, +(zoom - 0.1).toFixed(2)));
  const handleZoomIn = () => setZoom(Math.min(5.0, +(zoom + 0.1).toFixed(2)));
  const handleZoomReset = () => setZoom(1.0);

  return (
    <div className="cisco-toolbar">
      {/* File Actions */}
      <div className="cisco-toolbar-group">
        <button onClick={onClear} className="cisco-tool-btn" title="New Topology (Ctrl+N)">
          <span>📄</span>
        </button>
        <button onClick={onLoad} className="cisco-tool-btn" title="Open Layout (Ctrl+O)">
          <span>📂</span>
        </button>
        <button onClick={onSave} className="cisco-tool-btn" title="Save Layout (Ctrl+S)">
          <span>💾</span>
        </button>
        <button onClick={onExportJSON} className="cisco-tool-btn" title="Export Topology Schema (JSON)">
          <span>📥</span>
        </button>
      </div>

      {/* Edit */}
      <div className="cisco-toolbar-group">
        <button onClick={() => alert('Print feature not implemented')} className="cisco-tool-btn" title="Print Canvas">
          <span>🖨️</span>
        </button>
        <button onClick={() => alert('Undo action')} className="cisco-tool-btn" title="Undo">
          <span>↩️</span>
        </button>
        <button onClick={() => alert('Redo action')} className="cisco-tool-btn" title="Redo">
          <span>↪️</span>
        </button>
      </div>

      {/* Zoom */}
      <div className="cisco-toolbar-group">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={handleZoomOut} className="cisco-tool-btn" title="Zoom Out">
            <span>➖</span>
          </button>
          <span className="cisco-zoom-value">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="cisco-tool-btn" title="Zoom In">
            <span>➕</span>
          </button>
          <button onClick={handleZoomReset} className="cisco-tool-btn" title="Reset Zoom">
            <span>🔍</span>
          </button>
        </div>
      </div>

      {/* Action Tools */}
      <div className="cisco-toolbar-group">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setActiveTool('select')}
            className={`cisco-tool-btn ${activeTool === 'select' ? 'active' : ''}`}
            title="Select Device"
          >
            <span>🖱️</span>
            <span>Select</span>
          </button>
          <button
            onClick={() => setActiveTool('delete')}
            className={`cisco-tool-btn ${activeTool === 'delete' ? 'danger' : ''}`}
            title="Delete"
          >
            <span>❌</span>
            <span>Delete</span>
          </button>
          <button
            onClick={() => setActiveTool('note')}
            className={`cisco-tool-btn ${activeTool === 'note' ? 'active' : ''}`}
            title="Note Tool"
          >
            <span>📝</span>
            <span>Note</span>
          </button>
        </div>
      </div>

      {/* Right-aligned actions */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={onToggleHelp} className="cisco-tool-btn">
          <span>❓</span>
          <span>Help</span>
        </button>
      </div>
    </div>
  );
};
