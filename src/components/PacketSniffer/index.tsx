// src/components/PacketSniffer/index.tsx

import React, { useMemo, useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Packet, HighlightRange } from '../../types/packet';
import { PROTOCOL_COLORS } from '../../utils/packetMockData';
import './PacketSniffer.css';

export interface PacketSnifferProps {
  packets?: Packet[];
  isCapturing?: boolean;
  onFilterChange?: (filter: string) => void;
}

const HEX_WINDOW = 16;
const toHex = (n: number) => n.toString(16).toUpperCase().padStart(2, '0');

const LAYER_COLORS = ['#f43f5e', '#0ea5e9', '#f59e0b', '#a855f7', '#10b981', '#fb923c', '#ec4899', '#eab308'] as const;
const HIGHLIGHT_COLOR = '#34d3eb';
const ETH_LAYER_COLOR = '#f43f5e';

const layerSpan = (packet: Packet, layerIndex: number): { start: number; end: number; layer: number } => {
  let offset = 0;
  for (let i = 0; i < Math.min(layerIndex, packet.layers.length); i++) {
    offset += packet.layers[i].fields.reduce((sum, f) => sum + f.rawBytes.length, 0);
  }
  const next = packet.layers[layerIndex];
  const span = next.fields.reduce((sum, f) => sum + f.rawBytes.length, 0);
  return { start: offset, end: offset + span, layer: layerIndex };
};

const buildLayerHighlight = (packet: Packet, layerIndex: number, color = HIGHLIGHT_COLOR): HighlightRange => {
  const span = layerSpan(packet, layerIndex);
  return { layerIndex, fieldName: '', startByte: span.start, endByte: span.end, color };
};

const PacketViewer: React.FC<{ packet: Packet; highlight: HighlightRange | null }> = ({ packet, highlight }) => {
  const byteCount = packet.hexBytes.length;
  const totalRows = Math.ceil(byteCount / HEX_WINDOW);

  const usageMap: Array<{ start: number; end: number; color: string } | null> = useMemo(() => {
    const map: Array<{ start: number; end: number; color: string } | null> = Array.from({ length: byteCount }, () => null);
    for (let i = 0; i < packet.layers.length; i++) {
      const span = layerSpan(packet, i);
      const color = LAYER_COLORS[i % LAYER_COLORS.length];
      for (let j = span.start; j < span.end; j++) {
        if (j < byteCount) {
          map[j] = { start: span.start, end: span.end, color };
        }
      }
    }
    return map;
  }, [packet]);

  return (
    <div className="ps-hex-dump">
      <div className="ps-hex-head">
        <span className="ps-offset-head">Offset</span>
        <span className="ps-bytes-head">00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F</span>
        <span className="ps-ascii-head">ASCII</span>
      </div>
      <div className="ps-hex-scroll">
        {Array.from({ length: totalRows }, (_, row) => {
          const rowOffset = row * HEX_WINDOW;
          return (
            <div className="ps-hex-row" key={row}>
              <span className="ps-offset">{rowOffset.toString(16).padStart(6, '0').toUpperCase()}</span>
              <span className="ps-bytes">
                {Array.from({ length: HEX_WINDOW }, (__, col) => {
                  const idx = rowOffset + col;
                  const inHighlight = highlight !== null && idx >= highlight.startByte && idx < highlight.endByte;
                  const usage = usageMap[idx];
                  const color = !inHighlight ? usage?.color ?? null : null;
                  return (
                    <span
                      key={col}
                      className={`ps-byte ${inHighlight ? 'ps-hl' : ''} ${color ? 'ps-tinted' : ''}`}
                      style={color ? { color } : undefined}
                    >
                      {idx < packet.hexBytes.length ? toHex(packet.hexBytes[idx]) : '  '}
                    </span>
                  );
                })}
              </span>
              <span className="ps-ascii">
                {Array.from({ length: HEX_WINDOW }, (__, col) => {
                  const idx = rowOffset + col;
                  const inHighlight = highlight !== null && idx >= highlight.startByte && idx < highlight.endByte;
                  const usage = usageMap[idx];
                  const color = !inHighlight ? usage?.color ?? null : null;
                  if (idx >= packet.asciiBytes.length) {
                    return <span key={col} className="ps-ascii-ch" />;
                  }
                  return (
                    <span
                      key={col}
                      className={`ps-ascii-ch ${inHighlight ? 'ps-hl' : ''}`}
                      style={color ? { color } : undefined}
                    >
                      {packet.asciiBytes[idx]}
                    </span>
                  );
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PacketSniffer: React.FC<PacketSnifferProps> = ({
  packets: externalPackets,
  isCapturing: externalCapturing = false,
  onFilterChange,
}) => {
  const [packets, setPackets] = useState<Packet[]>(externalPackets ?? []);
  const [activeId, setActiveId] = useState<string | null>(externalPackets?.[0]?.id ?? null);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    if (!externalPackets || externalPackets.length === 0) return new Set();
    return new Set(externalPackets[0]!.layers.map((l) => `${externalPackets[0]!.id}-${l.name}`));
  });
  const [highlight, setHighlight] = useState<HighlightRange | null>(null);
  const [filter, setFilter] = useState('');
  const [running, setRunning] = useState(false);

  const effectivePackets = externalPackets ?? packets;
  const canCapture = !externalPackets || externalCapturing;
  const activePacket = useMemo(() => effectivePackets.find((p) => p.id === activeId) ?? effectivePackets[0] ?? null, [effectivePackets, activeId]);

  const view = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return effectivePackets;
    return effectivePackets.filter(
      (p) =>
        p.protocol.toLowerCase().includes(q) ||
        p.source.toLowerCase().includes(q) ||
        p.destination.toLowerCase().includes(q) ||
        String(p.number).includes(q)
    );
  }, [effectivePackets, filter]);

  const toggleExpand = useCallback((packet: Packet, layerIndex: number) => {
    const id = `${packet.id}-${packet.layers[layerIndex].name}`;
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setHighlight(null);
      } else {
        next.add(id);
        setHighlight(buildLayerHighlight(packet, layerIndex));
      }
      return next;
    });
  }, []);

  const onHoverLayer = useCallback((packet: Packet | null, layerIndex: number, inside: boolean) => {
    if (!inside || !packet) {
      setHighlight(null);
      return;
    }
    setHighlight(buildLayerHighlight(packet, layerIndex));
  }, []);

  const startCapture = useCallback(() => {
    if (running || !canCapture) return;
    setRunning(true);
    onFilterChange?.(filter);
  }, [running, canCapture, filter, onFilterChange]);

  const stopCapture = useCallback(() => {
    setRunning(false);
  }, []);

  const clearPackets = useCallback(() => {
    if (canCapture) {
      setPackets([]);
      setActiveId(null);
      setExpanded(new Set<string>());
      setHighlight(null);
      setFilter('');
    }
  }, [canCapture]);

  const handleFilter = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  }, []);

  return (
    <div className="ps-shell">
      <div className="ps-toolbar">
        <button className={`ps-btn ps-start ${running ? 'ps-active' : ''}`} onClick={startCapture} disabled={running}>
          <span className="ps-led" aria-hidden />
          Start
        </button>
        <button className="ps-btn ps-stop" onClick={stopCapture} disabled={!running}>
          Stop
        </button>
        <button className="ps-btn ps-clear" onClick={clearPackets}>
          Clear
        </button>

        <input
          className="ps-filter"
          placeholder="Display filter\u2026"
          value={filter}
          onChange={handleFilter}
        />

        <div className="ps-capture-status">
          <span className={`ps-status-dot ${running ? 'ps-status-dot-active' : ''}`} aria-hidden />
          <span>{running ? `${effectivePackets.length.toLocaleString()} captured` : 'Idle'}</span>
        </div>
      </div>

      <div className="ps-panes">
        <div className="ps-pane ps-pane-pkts">
          <div className="ps-pkt-table-shell">
            <div className="ps-pkt-header-row">
              <span className="ps-c-no">No.</span>
              <span className="ps-c-time">Time</span>
              <span className="ps-c-src">Source</span>
              <span className="ps-c-dst">Destination</span>
              <span className="ps-c-pro">Protocol</span>
              <span className="ps-c-len">Length</span>
              <span className="ps-c-info">Info</span>
            </div>
            <div className="ps-pkt-scroll">
              <div className="ps-pkt-list">
                {view.map((pkt) => {
                  const active = pkt.id === activeId;
                  const color = PROTOCOL_COLORS[pkt.protocol] ?? '#94a3b8';
                  return (
                    <div
                      key={pkt.id}
                      className={`ps-pkt-list-row ${active ? 'ps-pkt-active' : ''}`}
                      onMouseEnter={() => {
                        if (activePacket) {
                          setHighlight({ layerIndex: 0, fieldName: '', startByte: 0, endByte: 14, color: ETH_LAYER_COLOR });
                        }
                      }}
                      onMouseLeave={() => setHighlight(null)}
                      onClick={() => {
                        setActiveId(pkt.id);
                        setExpanded(new Set(pkt.layers.map((l) => `${pkt.id}-${l.name}`)));
                        setHighlight({ layerIndex: 0, fieldName: '', startByte: 0, endByte: 14, color: ETH_LAYER_COLOR });
                      }}
                    >
                      <span className="ps-c-no">{pkt.number}</span>
                      <span className="ps-c-time">{pkt.time}</span>
                      <span className="ps-c-src">{pkt.source}</span>
                      <span className="ps-c-dst">{pkt.destination}</span>
                      <span className="ps-c-pro">
                        <span className="ps-chip" style={{ color, borderColor: color }}>{pkt.protocol}</span>
                      </span>
                      <span className="ps-c-len">{pkt.length}</span>
                      <span className="ps-c-info">{pkt.info}</span>
                    </div>
                  );
                })}
                {view.length === 0 && <div className="ps-empty">No packets match this filter.</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="ps-split-h" />

        <div className="ps-pane ps-pane-layer">
          <div className="ps-pane-title">Protocol Layers</div>
          <div className="ps-layer-list">
            {activePacket &&
              activePacket.layers.map((layer, i) => {
                const key = `${activePacket!.id}-${layer.name}`;
                const open = expanded.has(key);
                const chip = LAYER_COLORS[i % LAYER_COLORS.length];
                return (
                  <div key={key} className="ps-layer">
                    <button
                      className={`ps-layer-ctrl ${open ? 'ps-open' : ''}`}
                      onClick={() => toggleExpand(activePacket!, i)}
                      onMouseEnter={() => onHoverLayer(activePacket, i, true)}
                      onMouseLeave={() => onHoverLayer(activePacket, i, false)}
                    >
                      <span className="ps-layer-chev">{open ? '▼' : '▶'}</span>
                      <span className="ps-layer-dot" style={{ background: chip }} />
                      <span className="ps-layer-title">{layer.name}</span>
                    </button>
                    {open && (
                      <div className="ps-field-wrap">
                        {layer.fields.map((f) => (
                          <div className="ps-field" key={`${key}-${f.name}`}>
                            <span className="ps-fname">{f.name}:</span>
                            <span className="ps-fval">{f.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        <div className="ps-split-h" />

        <div className="ps-pane ps-pane-hex">
          <div className="ps-pane-title">Hex &amp; ASCII</div>
          {activePacket && <PacketViewer packet={activePacket!} highlight={highlight} />}
          {!activePacket && <div className="ps-empty">Select a packet to inspect bytes.</div>}
        </div>
      </div>
    </div>
  );
};

export default PacketSniffer;