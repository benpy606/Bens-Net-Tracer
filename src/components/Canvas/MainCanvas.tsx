import React, { useRef, useState, useEffect } from 'react';
import type { Device, Link, CanvasNote } from '../../types/network';
import { DeviceNode } from './DeviceNode';
import { ConnectorLine } from './ConnectorLine';

interface MainCanvasProps {
  devices: Device[];
  links: Link[];
  notes?: CanvasNote[];
  selectedDeviceId: string | null;
  selectedLinkId: string | null;
  connectionSourceId: string | null;
  activeTool?: 'select' | 'delete' | 'note';
  zoom?: number;
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
   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
   const [viewBox, setViewBox] = useState('0 0 1200 800');
   const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
   const [isPanning, setIsPanning] = useState(false);
   const [panStart, setPanStart] = useState({ x: 0, y: 0 });
   const GRID_SIZE = 20;

   useEffect(() => {
     const handleGlobalMouseUp = () => {
       setDraggedDeviceId(null);
       setIsPanning(false);
     };
     window.addEventListener('mouseup', handleGlobalMouseUp);
     return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
   }, []);

  useEffect(() => {
    if (devices.length === 0) {
      setViewBox('0 0 1200 800');
      return;
    }

    const minX = Math.min(...devices.map(d => d.x)) - 80;
    const maxX = Math.max(...devices.map(d => d.x)) + 80;
    const minY = Math.min(...devices.map(d => d.y)) - 120;
    const maxY = Math.max(...devices.map(d => d.y)) + 60;

    const width = (maxX - minX) * 1.2;
    const height = (maxY - minY) * 1.2;
    const newViewBox = `${minX - width * 0.1} ${minY - height * 0.1} ${width} ${height}`;
    setViewBox(newViewBox);
  }, [devices]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setMousePos({ x, y });

    if (draggedDeviceId && activeTool === 'select') {
      let newX = Math.round((x - dragOffset.x) / GRID_SIZE) * GRID_SIZE;
      let newY = Math.round((y - dragOffset.y) / GRID_SIZE) * GRID_SIZE;
      const canvasWidth = canvasRef.current.getBoundingClientRect().width / zoom;
      const canvasHeight = canvasRef.current.getBoundingClientRect().height / zoom;
      newX = Math.max(40, Math.min(canvasWidth - 40, newX));
      newY = Math.max(40, Math.min(canvasHeight - 40, newY));
      onUpdateDevicePosition(draggedDeviceId, newX, newY);
    }

    if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      setPanOffset((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (activeTool === 'delete') {
      onDeleteDevice(id);
      return;
    }
    onSelectLink(null);
    onSelectDevice(id);

    const device = devices.find((d) => d.id === id);
    if (!device || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / zoom;
    const mouseY = (e.clientY - rect.top) / zoom;

    setDragOffset({
      x: mouseX - device.x,
      y: mouseY - device.y,
    });
    setDraggedDeviceId(id);
  };

  const handleMouseUp = () => {
    setDraggedDeviceId(null);
    setIsPanning(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = Math.round(((e.clientX - rect.left) / zoom) / GRID_SIZE) * GRID_SIZE;
    const clickY = Math.round(((e.clientY - rect.top) / zoom) / GRID_SIZE) * GRID_SIZE;

    if (activeTool === 'note') {
      const noteText = prompt('Enter your note label contents:');
      if (noteText && noteText.trim() && onAddNote) {
        onAddNote(noteText, clickX, clickY);
      }
    } else {
      onSelectDevice(null);
      onSelectLink(null);
      onStartConnection(null);
    }
  };

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (activeTool !== 'select' || selectedDeviceId || selectedLinkId || connectionSourceId) return;

    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const sourceDevice = devices.find((d) => d.id === connectionSourceId);
  let envelopePos = { x: 0, y: 0 };
  if (activeSimulationPacket) {
    const src = devices.find((d) => d.id === activeSimulationPacket.fromDeviceId);
    const dst = devices.find((d) => d.id === activeSimulationPacket.toDeviceId);
    if (src && dst) {
      envelopePos = {
        x: src.x + (dst.x - src.x) * activeSimulationPacket.progress,
        y: src.y + (dst.y - src.y) * activeSimulationPacket.progress,
      };
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #08111f 0%, #0b1220 45%, #111a2e 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03), inset 0 0 60px rgba(0, 0, 0, 0.2)',
      }}
    >
      <svg
        ref={canvasRef}
        width="100%"
        height="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDownCanvas}
        onClick={handleCanvasClick}
        style={{ display: 'block', cursor: isPanning ? 'grabbing' : 'default' }}
      >
<defs>
           {/* Subtle dot grid pattern */}
           <pattern id="dotGrid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
             <circle cx="2" cy="2" r="0.7" fill="rgba(148, 163, 184, 0.45)" />
           </pattern>
           {/* Large grid lines */}
           <pattern id="gridLines" width={GRID_SIZE * 5} height={GRID_SIZE * 5} patternUnits="userSpaceOnUse">
             <line x1="0" y1="0" x2={GRID_SIZE * 5} y2="0" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="0.5" />
             <line x1="0" y1="0" x2="0" y2={GRID_SIZE * 5} stroke="rgba(148, 163, 184, 0.12)" strokeWidth="0.5" />
           </pattern>
          {/* Connection line glow */}
          <filter id="connectionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Animated gradient for active connections */}
          <linearGradient id="activeConnectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.6" />
          </linearGradient>
          {/* Envelope packet glow */}
          <filter id="packetGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background layers */}
        <g transform={`translate(${panOffset.x * 0.08}, ${panOffset.y * 0.08})`}>
          <rect width="100%" height="100%" fill="url(#gridLines)" />
          <rect width="100%" height="100%" fill="url(#dotGrid)" />
        </g>

         <g
           transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}
           style={{
             transformOrigin: '0 0',
             transition: draggedDeviceId || isPanning ? 'none' : 'transform var(--transition-fluid)',
           }}
         >
          {links.map((link) => {
            const from = devices.find((d) => d.id === link.fromDeviceId);
            const to = devices.find((d) => d.id === link.toDeviceId);
            if (!from || !to) return null;
            return (
              <ConnectorLine
                key={link.id}
                link={link}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                isSelected={selectedLinkId === link.id}
                onSelect={(id) => {
                  if (activeTool === 'delete') {
                    onDeleteLink(link.id);
                  } else {
                    onSelectLink(id);
                  }
                }}
                onDelete={onDeleteLink}
              />
            );
          })}

          {connectionSourceId && sourceDevice && (
            <line
              x1={sourceDevice.x}
              y1={sourceDevice.y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="#22d3ee"
              strokeWidth="2"
            strokeDasharray="6 4"
            style={{ pointerEvents: 'none', filter: 'url(#connectionGlow)' }}
          />
        )}

          {notes.map((note) => (
            <g
              key={note.id}
              transform={`translate(${note.x}, ${note.y})`}
              style={{ cursor: activeTool === 'delete' ? 'pointer' : 'default' }}
              onClick={(e) => {
                e.stopPropagation();
                if (activeTool === 'delete' && onDeleteNote) {
                  onDeleteNote(note.id);
                }
              }}
            >
              <rect
                x="-8"
                y="-18"
                width={note.text.length * 7 + 20}
                height="26"
                rx="6"
                fill="rgba(251, 191, 36, 0.12)"
                stroke="rgba(251, 191, 36, 0.4)"
                strokeWidth="1"
              />
              <text x="2" y="0" fill="#fbbf24" style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                {note.text}
              </text>
              {activeTool === 'delete' && (
                <circle cx="-8" cy="-18" r="6" fill="#ef4444" stroke="#fff" strokeWidth="0.5" />
              )}
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
                if (activeTool === 'delete') {
                  onDeleteDevice(device.id);
                  return;
                }
                if (connectionSourceId && connectionSourceId !== id) {
                  onCompleteConnection(id);
                } else {
                  onSelectDevice(id);
                }
              }}
              onDoubleClick={onDoubleClickDevice}
              onStartConnection={(e, id) => {
                e.stopPropagation();
                onStartConnection(id);
              }}
              onDelete={onDeleteDevice}
            />
          ))}

          {activeSimulationPacket && envelopePos.x !== 0 && (
            <g transform={`translate(${envelopePos.x - 14}, ${envelopePos.y - 10})`} style={{ pointerEvents: 'none', filter: 'url(#packetGlow)' }}>
              <rect width="28" height="20" rx="6" fill="#f59e0b" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
              <path d="M0 0l14 10 14-10" stroke="rgba(255,255,255,0.7)" strokeWidth="1" fill="none" />
              <text x="14" y="15" textAnchor="middle" fill="#fff" style={{ fontSize: '7px', fontWeight: 'bold', fontFamily: "'Inter', sans-serif" }}>
                {activeSimulationPacket.protocol}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
