# GCORE Dashboard — Tokenized Green REIT

A fintech dashboard for managing a tokenized ESG investment product (GRN.SI wrapper) on the Ethereum Sepolia testnet. Built with Next.js, TypeScript, ethers.js, and Tailwind CSS.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MetaMask](https://metamask.io/download/) browser extension installed
- MetaMask wallet switched to the **Sepolia** testnet

---

## Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> Environment variables are pre-configured in `.env` — no additional setup required.

---

## Connecting Your Wallet

1. Open the dashboard in Chrome or Firefox with MetaMask installed
2. Click **Connect Wallet** in the top-right corner
3. Approve the connection in the MetaMask popup
4. If prompted, switch to the **Sepolia** network — or click **Switch to Sepolia** in the header

Once connected, the dashboard detects your on-chain roles and unlocks the relevant controls automatically.

---

## Wallet Roles & Access

| Role | Access |
|------|--------|
| `DEFAULT_ADMIN_ROLE` | Full access — mint, burn, transfer, whitelist management, role management |
| `OPERATOR_ROLE` | Mint, burn, transfer tokens |
| `COMPLIANCE_ROLE` | Whitelist management |
| `ORACLE_ROLE` | Oracle data updates |
| Investor / no role | Read-only — view balances, whitelist status, transaction history |

---

## Dashboard Pages

| Page | Description |
|------|-------------|
| **Overview** | Total supply, balances, whitelist status, wallet distribution |
| **Token Actions** | Mint, burn, transfer tokens (role-gated) |
| **Transactions** | Full on-chain activity log |
| **Whitelist** | Add/remove wallet addresses from the whitelist |
| **Role Management** | Grant/revoke on-chain roles, inspect wallet profiles |
| **Product & Compliance** | Product details, custody model, NAV info |
| **Risk & Governance** | Risk framework and governance overview |
| **ESG Insights** | Environmental, Social, Governance metrics |
| **AI Insights** | AI-generated portfolio analysis and recommendations |

---

## Contract

- **Network:** Sepolia Testnet
- **Contract:** `0x9cb3db793e61eaec0d35119c216b5a812c5e07f6`
- **Explorer:** [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x9cb3db793e61eaec0d35119c216b5a812c5e07f6)

---

## Build for Production

```bash
npm run build
npm run start
```
