# TEOS Travel OS — AI Trip Planner
# TeosEgypt‑AI‑Travel‑OS

[![Built & Owned by Elmahrosa International](https://img.shields.io/badge/Built%20%26%20Owned-Elmahrosa%20International-darkred?style=for-the-badge)](https://github.com/Elmahrosa/TeosEgypt-AI-Travel-OS)
[![TESL Protected](https://img.shields.io/badge/License-TESL%20Protected-blue?style=for-the-badge)](https://github.com/Elmahrosa/Teos-Pharaoh-Portal/blob/main/TESL.md)

**Your personal travel operating system.**  
Experience Egypt like never before. From hidden gems to seamless logistics, TEOS handles the details so you can handle the adventure.

---

## 🌍 Hero Features
- AI Trip Planner: Tell us your preferences, TEOS crafts the perfect journey.
- City Anchors: Cairo, Alexandria, Luxor, Aswan, Sharm El‑Sheikh, Hurghada, Siwa Oasis.
- Hotel Integration: Google Maps hotels ranked by rating, price, and proximity.
- Seamless Checkout: Pay with fiat today, TEOS token soon.

---

# TEOS Checkout & Connect Wallet (MVP)

## Overview
Production-structured MVP for TEOS Checkout with Connect Wallet simulation and TEOS quote display. Architected for future wallet providers and multi-token payments.

## Frontend (React + Vite)
- Payment section shows:
  - **Token Price (USD)**
  - **Estimated gas fee (USD)**
  - **Total Crypto required**
- **Connect Wallet** button (MVP sim) with visible state:
  - Connected / Not Connected, demo address, provider label
  - **Auto-Switching Simulation:** Switches address format based on token chain (EVM vs Solana).
- **Accepted Tokens:** TEOS, USDT, SOL, ERT, USD1 (Active in MVP).

## Backend (FastAPI)
- `GET /api/payments/teos/quote?order_usd={amount}`
- Returns:
  ```json
  {
    "teos_price_usd": 0.42,
    "gas_usd": 0.12,
    "teos_needed": 238.3810
  }
  ```
- Deterministic placeholders:
  - `fetch_teos_price_usd()` — swap with real oracle/pool later
  - `estimate_teos_gas_usd()` — rule-based fee, predictable

## Architecture principles
- Replaceable MVP logic (no hard-coupling)
- Wallet logic abstracted via adapter (MetaMask/Phantom/Pi-ready)
- Clean UI, clean API, clean state
- No fake chain calls — simulation only

## Expansion roadmap
- **Phase 1 (MVP):** Simulated wallet connect + TEOS quote
- **Phase 2:** Real wallet providers (MetaMask, Phantom, Pi)
- **Phase 3:** Multi-token payments (USDT, PI, SOL, TEOS, ERT, USD1) - **ACTIVE**
- **Phase 4:** Fiat payments via TapCollect API
- **Phase 5:** Liquidity pools & swaps (TEOS/SOL/ERT)

---

## 🚀 Launch Domain
Live at:  
```
https://TEOS.EG.TEOSEGYPT.COM
```

Backend API:  
```
https://api.teosegypt.com
```

---

**TEOS Egypt — Civic‑first blockchain travel operating system.**  
Anchored in Egypt, scaling globally.
