# 🌐 Bens-Net-Tracer

An interactive, high-fidelity web-based network topology designer and real-time protocol simulation engine built with **React**, **TypeScript**, and **Tailwind CSS**.

Bens-Net-Tracer lets you visually design network layouts (Routers, Switches, PCs, and Servers), configure addressing, and observe frame serialization and packet transmission mechanics in an animated, educational environment.

---

## 🚀 Live Demo

🔗 View the Live Deployment Hosted on Vercel: https://bens-net-tracer.vercel.app/

---

## ✨ Highlights

- Visual topology canvas with draggable network nodes and elastic packet animations
- Real-time 3-pane packet sniffer (Wireshark-style) with synchronized binary/hex explorer
- Protocol-aware, color-coded frame visualization and serialization tracing
- VLSM subnet calculator and logical/physical plane switching
- Type-safe architecture with clear separation between rendering, simulation, and protocol logic

---

## 🚧 Features

- Elastic "Jelly" packet animation using custom spring interpolation
- Protocol neon glow color-coding (ICMP, HTTP, DNS, etc.)
- Live wire-tap packet ledger with smart display filters and responsive layout
- Binary & hex viewer that highlights matching protocol header bytes
- Dual plane view (Logical / Physical) and VLSM subnetting tools

---

## 📦 Installation

Prerequisites:
- Node.js 18+ (or current LTS)
- pnpm or npm

1. Clone the repository

```bash
git clone https://github.com/benpy606/Bens-Net-Tracer.git
cd Bens-Net-Tracer
```

2. Install dependencies

Using pnpm:

```bash
pnpm install
```

Or using npm:

```bash
npm install
```

3. Run the dev server

```bash
pnpm dev
# or
npm run dev
```

Open http://localhost:5173 (or the terminal URL) to view the app.

---

## 🧭 Project Structure

```text
src/
├── components/
│   ├── Canvas/          # Layout design space, node elements, and link lines
│   └── PacketSniffer/   # Wireshark-style 3-pane ledger, hex viewer, and styles
├── types/
│   ├── network.ts       # Core node, connection, and topology declarations
│   └── packet.ts        # Protocol serialization structures
├── App.tsx              # Main state orchestration, packet capturing, and event wire-tap
├── main.tsx             # React DOM entry bootstrapping
└── index.css            # Global styling & Tailwind directives
```

---

## 🛠️ Development Notes

- The simulation engine is deterministic and event-driven. Packets are serialized into layered frames and routed across simulated links.
- The PacketSniffer component mirrors captured frames with synchronized header highlighting and hex dumps.
- Keep UI logic (components) separate from the simulation logic and protocol serialization helpers in `src/` for maintainability and testability.

---

## 🧪 Testing

Add tests as needed. Recommended tooling:
- vitest (unit tests)
- playwright (end-to-end UI tests)

---

## 🚀 Deployment

This project is optimized for static deployment (Vercel, Netlify). Typical build commands:

```bash
pnpm build
# or
npm run build
```

Then deploy the contents of the generated `dist/` (or `build/`) folder. Update the Live Demo link at the top of this README after deployment.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

- Fork the repo
- Create a feature branch: `git checkout -b feat/awesome-feature`
- Commit your changes and open a pull request

Please include clear reproduction steps for bugs and small, focused PRs for easier review.

---

## 🔐 License

This repository is unlicensed by default. Add a LICENSE file (MIT, Apache-2.0, etc.) to make your intended license explicit.

---

## 📫 Contact

Created by [benpy606](https://github.com/benpy606).

For questions, feedback, or to report issues:

- Open an issue on this repository: https://github.com/benpy606/Bens-Net-Tracer/issues
- Reach out via my GitHub profile: https://github.com/benpy606

If you'd like to publish an email or additional contact methods here, tell me what to add and I will update the README.
