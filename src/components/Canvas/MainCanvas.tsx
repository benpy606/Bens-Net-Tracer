import React, { useRef, useState, useEffect } from 'react';
import type { Device, Link, CanvasNote } from '../../types/network';
import { DeviceNode } from './DeviceNode';
import { ConnectorLine } from './ConnectorLine';

interface ViewBox { x: number; y: number; w: number; h: number }

interface MainCanvasProps {
  devices: Device[];
  links: Link[];
  notes?: CanvasNote[];
  selectedDeviceId: string | null;
  selectedLinkId: string | null;
  connectionSourceId: string | null;
  activeTool?: 'select' | 'delete' | 'note';
  zoom?: number;
  viewBox?: ViewBox;
  onViewBoxChange?: (vb: ViewBox) => void;
  activeSimulationPacket?: { fromDeviceId: string; toDeviceId: string; progress: number; protocol: string } | null;
  onUpdateDevicePosition: (id: string, x: number, y: number) => void;
  onSelectDevice: (id: string | null) => void;
  onSelectLink: (id: string | null) => void;
  onStartConnection: (id: string | null) => void;
  onCompleteConnection: (targetId: string) => void;
  onDeleteDevice: (id: string) => void;
  onDeleteLink: (id: string) => void;
  onDoubleClickDevice?: (id: string) => void;
  onAddNote?: (text: string, x: number, y: number) => void;
  onDeleteNote?: (id: string) => void;
}

export const MainCanvas: React.FC<MainCanvasProps> = ({
  devices,
  links,
  notes = [],
  selectedDeviceId,
  selectedLinkId,
  connectionSourceId,
  activeTool = 'select',
  zoom = 1.0,
  viewBox: externalViewBox,
  onViewBoxChange,
  activeSimulationPacket = null,
  onUpdateDevicePosition,
  onSelectDevice,
  onSelectLink,
  onStartConnection,
  onCompleteConnection,
  onDeleteDevice,
  onDeleteLink,
  onDoubleClickDevice,
  onAddNote,
  onDeleteNote,
}) => {
  const canvasRef = useRef<SVGSVGElement | null>(null);
  const [draggedDeviceId, setDraggedDeviceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [internalViewBox, setInternalViewBox] = useState<ViewBox>({ x: 0, y: 0, w: 1200, h: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const GRID_SIZE = 20;

  const viewBox = externalViewBox ?? internalViewBox;

  const applyViewBox = (next: ViewBox | ((prev: ViewBox) => ViewBox)) => {
    const v = typeof next === 'function' ? (next as (prev: ViewBox) => ViewBox)(viewBox) : next;
    if (onViewBoxChange) onViewBoxChange(v);
    else setInternalViewBox(v);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggedDeviceId(null);
      setIsPanning(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    applyViewBox({ x: 0, y: 0, w: rect.width * zoom, h: rect.height * zoom });
  }, [zoom]);

  const toWorldX = (clientX: number) => {
    if (!canvasRef.current) return clientX;
    const rect = canvasRef.current.getBoundingClientRect();
    return viewBox.x + (clientX - rect.left) / rect.width * viewBox.w;
  };
  const toWorldY = (clientY: number) => {
    if (!canvasRef.current) return clientY;
    const rect = canvasRef.current.getBoundingClientRect();
    return viewBox.y + (clientY - rect.top) / rect.height * viewBox.h;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const wx = toWorldX(e.clientX);
    const wy = toWorldY(e.clientY);
    setMousePos({ x: wx, y: wy });

    if (draggedDeviceId && activeTool === 'select') {
      onUpdateDevicePosition(draggedDeviceId, wx, wy);
    }

    if (isPanning && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const next = {
        x: viewBox.x - (e.clientX - panStart.x) / rect.width * viewBox.w,
        y: viewBox.y - (e.clientY - panStart.y) / rect.height * viewBox.h,
        w: viewBox.w,
        h: viewBox.h,
      };
      if (onViewBoxChange) onViewBoxChange(next);
      else setInternalViewBox(next);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (activeTool === 'delete') { onDeleteDevice(id); return; }
    onSelectLink(null);
    onSelectDevice(id);

    const device = devices.find((d) => d.id === id);
    if (!device) return;

    const wx = toWorldX(e.clientX);
    const wy = toWorldY(e.clientY);
    setDraggedDeviceId(id);
    onUpdateDevicePosition(id, wx - device.x, wy - device.y);
  };

  const handleMouseUp = () => {
    setDraggedDeviceId(null);
    setIsPanning(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const wx = toWorldX(e.clientX);
    const wy = toWorldY(e.clientY);

    if (activeTool === 'note') {
      const noteText = prompt('Enter your note label contents:');
      if (noteText?.trim() && onAddNote) onAddNote(noteText, wx, wy);
    } else {
      onSelectDevice(null);
      onSelectLink(null);
      onStartConnection(null);
    }
  };

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (activeTool !== 'select') return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!canvasRef.current) return;
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.25, Math.min(5.0, zoom * factor));
    applyViewBox({ x: viewBox.x, y: viewBox.y, w: rect.width * newZoom, h: rect.height * newZoom });
  };

  const sourceDevice = devices.find((d) => d.id === connectionSourceId);
  let envelopePos = { x: 0, y: 0 };
  if (activeSimulationPacket) {
    const src = devices.find((d) => d.id === activeSimulationPacket.fromDeviceId);
    const dst = devices.find((d) => d.id === activeSimulationPacket.toDeviceId);
    if (src && dst) envelopePos = {
      x: src.x + (dst.x - src.x) * activeSimulationPacket.progress,
      y: src.y + (dst.y - src.y) * activeSimulationPacket.progress,
    };
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'var(--bg-deep)',
        borderRadius: '12px',
        border: '1px solid var(--border-default)',
      }}
    >
      <svg
        ref={canvasRef}
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDownCanvas}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        style={{ display: 'block', cursor: isPanning ? 'grabbing' : 'default', userSelect: 'none' }}
      >
        <defs>
          <pattern id="dotGrid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.6" fill="var(--text-tertiary)" />
          </pattern>
          <pattern id="gridLines" width={GRID_SIZE * 5} height={GRID_SIZE * 5} patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2={GRID_SIZE * 5} y2="0" stroke="var(--border-subtle)" strokeWidth="0.5" />
            <line x1="0" y1="0" x2="0" y2={GRID_SIZE * 5} stroke="var(--border-subtle)" strokeWidth="0.5" />
          </pattern>
          <filter id="connectionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="activeConnectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.5" />
            <stop offset="50%" stopColor="var(--accent-secondary)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.5" />
          </linearGradient>
          <filter id="packetGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect x={viewBox.x - 5000} y={viewBox.y - 5000} width="10000" height="10000" fill="url(#gridLines)" />
        <rect x={viewBox.x - 5000} y={viewBox.y - 5000} width="10000" height="10000" fill="url(#dotGrid)" />

        {links.map((link) => {
          const from = devices.find((d) => d.id === link.fromDeviceId);
          const to = devices.find((d) => d.id === link.toDeviceId);
          if (!from || !to) return null;
          return (
            <ConnectorLine
              key={link.id}
              link={link}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              isSelected={selectedLinkId === link.id}
              onSelect={(id) => onSelectLink(activeTool === 'delete' ? link.id : id)}
              onDelete={onDeleteLink}
            />
          );
        })}

        {connectionSourceId && sourceDevice && (
          <line
            x1={sourceDevice.x} y1={sourceDevice.y} x2={mousePos.x} y2={mousePos.y}
            stroke="var(--accent-primary)" strokeWidth="2" strokeDasharray="6 4"
            style={{ pointerEvents: 'none', filter: 'url(#connectionGlow)' }}
          />
        )}

        {notes.map((note) => (
          <g key={note.id} transform={`translate(${note.x}, ${note.y})`} style={{ cursor: activeTool === 'delete' ? 'pointer' : 'default' }}
             onClick={(e) => { e.stopPropagation(); if (activeTool === 'delete' && onDeleteNote) onDeleteNote(note.id); }}>
            <rect x="-8" y="-18" width={note.text.length * 7 + 20} height="26" rx="6" fill="var(--border-active)" stroke="var(--border-hover)" strokeWidth="1" />
            <text x="2" y="0" fill="var(--accent-primary)" style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{note.text}</text>
          </g>
        ))}

        {devices.map((device) => (
          <DeviceNode
            key={device.id}
            device={device}
            isSelected={selectedDeviceId === device.id}
            isConnectionSource={connectionSourceId === device.id}
            onMouseDown={handleMouseDownNode}
            onSelect={(id) => {
              if (activeTool === 'delete') { onDeleteDevice(device.id); return; }
              if (connectionSourceId && connectionSourceId !== id) onCompleteConnection(id);
              else onSelectDevice(id);
            }}
            onDoubleClick={onDoubleClickDevice}
            onStartConnection={(e, id) => { e.stopPropagation(); onStartConnection(id); }}
            onDelete={onDeleteDevice}
          />
        ))}

        {activeSimulationPacket && envelopePos.x !== 0 && (
          <g transform={`translate(${envelopePos.x - 14}, ${envelopePos.y - 10})`} style={{ pointerEvents: 'none', filter: 'url(#packetGlow)' }}>
            <rect width="28" height="20" rx="6" fill="var(--accent-secondary)" stroke="var(--border-hover)" strokeWidth="1" />
            <path d="M0 0l14 10 14-10" stroke="var(--border-subtle)" strokeWidth="1" fill="none" />
            <text x="14" y="15" textAnchor="middle" fill="#fff" style={{ fontSize: '7px', fontWeight: 'bold', fontFamily: "'Inter', sans-serif" }}>
              {activeSimulationPacket.protocol}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
