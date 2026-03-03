# StellarFund — Decentralized Crowdfunding DApp

A production-ready crowdfunding decentralized application (dApp) built on the **Stellar testnet** using React, TypeScript, and Vite. Users can connect their Freighter wallet, create funding campaigns, donate XLM, and watch live activity — all in a sleek glassmorphism dark UI.

---

## ✨ Features

- 🔗 **Freighter Wallet Integration** — Connect/disconnect, network detection, truncated public key
- 🚀 **Create Campaigns** — Title, description, goal (XLM), and deadline; full form validation
- 💸 **Donate XLM** — Quick-amount presets, 3-step confirmation flow (Input → Confirm → Success)
- 📊 **Real-Time Progress Bars** — Animated fills with milestone markers at 25/50/75/100%
- ⏱️ **Live Activity Feed** — Scrollable donation history with time-ago and TX hash
- ⚡ **TTL Caching** — In-memory 30-second cache to avoid redundant reads
- 🌟 **Loading States** — Per-card overlays and modal spinners during async operations
- 🔔 **Toast Notifications** — Auto-dismissing success/error feedback

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Styling | Vanilla CSS (Glassmorphism, Inter font) |
| Wallet | Freighter (browser extension) |
| Blockchain | Stellar Testnet |
| Testing | Vitest + Testing Library |
| Storage | localStorage (mock ledger) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- [Freighter Wallet](https://www.freighter.app/) browser extension

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Tests

```bash
npm test
```

**Expected output:** 42 tests passing across 4 test suites.

| Suite | Tests |
|---|---|
| `cache.test.ts` | 10 |
| `stellar.test.ts` | 15 |
| `ProgressBar.test.tsx` | 7 |
| `CampaignCard.test.tsx` | 10 |

<!-- Add test output screenshot here -->
> 📸 *Screenshot of test output goes here*

---

## 🏗 Build

```bash
npm run build
```

Output is placed in `dist/`.

---

## 📁 Project Structure

```
src/
├── components/       # UI components (Header, CampaignCard, modals…)
├── hooks/            # useWallet, useCampaigns
├── types/            # TypeScript interfaces
├── utils/            # cache.ts, stellar.ts
└── tests/            # Vitest test suites
```

---

## 🌐 Deployment

```bash
npm run build
# Deploy dist/ to Vercel, Netlify, or GitHub Pages
```

---

## 🎥 Demo

> 🔗 *Live Demo link goes here*

> 📹 *Demo video link goes here*

---

## 📄 License

MIT
