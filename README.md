# 🌐 Bens-Net-Tracer

An interactive, high-fidelity web-based network topology designer and real-time protocol simulation engine built with **React**, **TypeScript**, and **Tailwind CSS**. 

Bens-Net-Tracer allows users to visually architect network layouts (Routers, Switches, PCs, and Servers), configure addressing, and observe frame serialization and packet transmission mechanics through an advanced canvas simulation environment.

---

## 🚀 Live Demo
[🔗 View the Live Deployment Hosted on Vercel](https://your-project-name.vercel.app) *(Update this link once deployed!)*

---

## ✨ Features

### 🎨 Elastic "Jelly" Animation Canvas
* **Dynamic Physics Engine:** Packet envelopes don't just glide—they utilize custom spring-physics interpolation to stretch horizontally during acceleration and elastically squash/bounce on node impact.
* **Protocol Neon Glow:** Envelopes render with dynamic, high-visibility SVG neon drop-shadows color-coded by protocol layer (e.g., Magenta for ICMP/Ping, Cyan for HTTP, Sunburst Yellow for DNS).

### 🔍 3-Pane Real-Time Packet Sniffer (Wireshark Replica)
* **Live Wire-Tap:** Captures state-driven simulation traffic instantly with deterministic state mapping.
* **Smart Display Filters:** Instant input filtering with responsive query resets (clearing filters immediately repopulates the full packet ledger).
* **Responsive Layout:** Engineered with a robust, overflow-safe custom flex table (`ps-pkt-table-shell`) that prevents column clipping on tight layouts and supports smooth horizontal scrolling.
* **Binary & Hex Explorer:** Full cross-layer synchronization—hovering over protocol headers highlights the matching serialized byte structures in the hex dump panel below.

### 📐 Subnetting & Layout Architecture
* **VLSM Calculator:** Integrated Variable Length Subnet Mask toolset for calculating address blocks right alongside your logical view.
* **Dual Plane Views:** Toggle smoothly between Logical and Physical layout infrastructure planes.

---

## 📂 Architecture & Directory Structure

The project follows a strict, highly decoupled frontend architecture designed for optimal maintainability and clean type-safety boundaries:

```text
src/
├── components/
│   ├── Canvas/          # Layout design space, node elements, and link lines
│   └── PacketSniffer/   # Wireshark-replica 3-pane ledger, hex viewer, and styles
├── types/
│   ├── network.ts       # Core node, connection, and topology declarations
│   └── packet.ts        # Protocol serialization structures
├── App.tsx              # Main state orchestration, packet capturing, and event wire-tap
├── main.tsx             # React DOM entry bootstrapping
└── index.css            # Global styling framework & Tailwind directives
