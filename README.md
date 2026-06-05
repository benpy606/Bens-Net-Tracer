# NetTopology - Cisco Packet Tracer Replica

A web-based network topology simulator built with React, TypeScript, and SVG that replicates core Cisco Packet Tracer functionality for educational network design and simulation. Also branded as "Ben's Net Tracer."

## Current Status

- **Project Stage:** Stage 8 - Packet Sniffing & Network Analysis (IN PROGRESS)
- **Overall Status:** All 7 core stages completed. Application is a fully functional minimum viable product.
- **Generated:** 2026-06-05

## Technical Stack

- **Framework:** React 19.2.6 + TypeScript
- **Build Tool:** Vite 8.0.12
- **UI:** SVG Canvas with CSS glassmorphism design
- **State Management:** React hooks (useState, useEffect, useRef)
- **Storage:** Browser localStorage for persistence

## Project Metrics

- Total Source Files: 27+
- Total Lines of Code: ~3,800+
- Device Types Supported: 5 (router, switch, PC, server, firewall)
- Theme Variants: 4 (Default Slate, Carbon Mint, Amethyst Void, Cyber Rose)
- Protocols Supported: ICMP, DNS, HTTP (simulation + packet sniffing)

## Core Features

1. Drag-and-drop device positioning on SVG canvas
2. Zoom and pan canvas navigation (mouse wheel + grab)
3. Port-to-port device connections (with duplicate validation)
4. Device configuration forms (IP, subnet, gateway, status)
5. Interactive Cisco IOS CLI simulator (user/privileged/config/interface modes)
6. Realtime/Simulation mode toggle
7. Visual packet animation (envelope travels between devices)
8. Topology persistence (localStorage auto-load/save)
9. JSON export/import
10. Educational subnet tools (Binary Explorer, VLSM Calculator)
11. Network packet sniffing and analysis (IN PROGRESS)

## Project Architecture

### Stage 1: Foundation & Architecture (COMPLETED)
- Vite + React + TypeScript project scaffolded
- Professional design system with CSS custom properties
- 4-theme architecture (Default Slate, Carbon Mint, Amethyst Void, Cyber Rose)
- TypeScript interfaces: Device, DeviceType, DeviceInterface, Link, SubnetInfo, VLSMInput, VLSMResult, SimEvent, CanvasNote, Packet, PacketLayer, PacketField, HighlightRange

### Stage 2: UI Components (COMPLETED)
- `CiscoMenuBar` — top navigation with File/Edit/View/Tools/Ext/Window/Help menus
- `CiscoToolbar` — secondary icon toolbar (select, delete, note, save, load, clear, zoom)
- `LogicalPhysicalBar` — logical/physical view toggle
- `BottomDock` — device panel, simulation controls, packet stream logs, event table
- `DataLogTable` — simulation event table component
- `HelpOverlay` — context-sensitive help dialog

### Stage 3: Canvas System (COMPLETED)
- SVG-based interactive canvas with dot-grid and grid-lines patterns
- Mouse-based panning and scroll-wheel zoom
- Device rendering with custom SVG icons
- Connection line visualization with active-state glow
- Simulated packet envelope animation on active links

### Stage 4: Device Configuration (COMPLETED)
- Draggable/floating `DeviceConfigModal` (resizable edges/corner)
- Physical tab: power toggle, module slots, port visualization
- Config tab: hostname, interface IP/subnet editing
- CLI tab: interactive Cisco IOS command simulator with enable/configure terminal/interface modes

### Stage 5: Educational Tools (COMPLETED)
- `BinaryExplorer` — clickable 32-bit grid for IP binary decomposition
- `VLSMCalculator` — multi-subnet requirement input with visual allocation timeline

### Stage 6: Simulation Engine (COMPLETED)
- Ping command triggered from CLI
- Realtime mode: immediate ping result events
- Simulation mode: animated packet envelope from source → destination
- Event logging with status (Success/Failed/Sent)

### Stage 7: Persistence & Export (COMPLETED)
- Auto-load topology from localStorage on startup
- Save/Load/Clear topology controls
- JSON export (download as file)

### Stage 8: Packet Sniffing & Network Analysis (IN PROGRESS)
- `PacketSniffer.tsx` — 3-pane Wireshark-style UI (packet list, protocol layers, hex/ASCII view)
- Mock hex dump generation per protocol (ICMP=98B, DNS=76B, HTTP=523B, generic=60B)
- Layer highlighting with per-protocol color coding
- Display filter (search by protocol, source, destination, number)
- Start/Stop/Clear capture controls
- Layer-by-layer field expansion with byte highlighting

## File Structure

```
src/
├── App.tsx                        - Main application component
├── App.css                        - Application-specific styles
├── main.tsx                       - React entry point
├── index.css                      - Global styles and design tokens
├── types/
│   ├── network.ts                 - Device, Link, DeviceInterface, VLSM, Subnet types
│   └── packet.ts                  - Packet, PacketLayer, PacketField, HighlightRange (Stage 8)
├── components/
│   ├── Common/
│   │   ├── CiscoMenuBar.tsx       - Top navigation menu + theme switcher
│   │   ├── CiscoToolbar.tsx       - Secondary icon toolbar
│   │   ├── LogicalPhysicalBar.tsx - Logical/Physical view toggle
│   │   ├── BottomDock.tsx         - Device panel + simulation controls + packet stream
│   │   ├── DataLogTable.tsx       - Simulation event table
│   │   └── HelpOverlay.tsx        - Context help dialog
│   ├── Canvas/
│   │   ├── MainCanvas.tsx         - SVG workspace + zoom/pan + packet envelope
│   │   ├── DeviceNode.tsx         - Device SVG node component
│   │   ├── ConnectorLine.tsx      - Link visualization with glow effects
│   │   └── DevicePalette.tsx      - Device selection panel
│   ├── Sidebar/
│   │   ├── DeviceConfigModal.tsx  - Device config modal (Physical / Config / CLI tabs)
│   │   ├── PropertiesEditor.tsx   - Interface/IP editing form
│   │   ├── VLSMCalculator.tsx     - VLSM subnet calculator
│   │   ├── BinaryExplorer.tsx     - Binary IP explorer
│   │   └── PacketSniffer.tsx      - Network packet sniffer (Stage 8)
│   └── PacketSniffer.css          - Packet sniffer styles
└── utils/
    ├── subnetCalc.ts              - Subnet calculation utilities
    ├── vlsm.ts                    - VLSM algorithm utilities
    └── packetMockData.ts          - Protocol colors + mock packet data (Stage 8)
```

## Running the Application

```bash
npm run dev      # Development server (Vite HMR)
npm run build    # Production build (tsc + vite build)
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## License

This is an educational project and is not affiliated with Cisco Systems.
