# 📍 Repo Standing Statement

This repository is a **sovereign original** under **Elmahrosa International — TEOS Egypt**.  
Governance is anchored in [TEOS-FORGE](https://github.com/Elmahrosa/TEOS-FORGE).  
Commercial use requires written approval from Elmahrosa International.  

⚖️ Protected under dual license: PolyForm Noncommercial + TEOS Egypt Sovereign License (TESL).

# ?? Repo Standing Statement

This repository is a **sovereign original** under **Elmahrosa International � TEOS Egypt**.  
Governance is anchored in [TEOS-FORGE](https://github.com/Elmahrosa/TEOS-FORGE).  
Commercial use requires written approval from Elmahrosa International.  

?? Protected under dual license: PolyForm Noncommercial + TEOS Egypt Sovereign License (TESL).

# TEOS Travel OS — AI Trip Planner

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
https://travelai.teosegypt.com/
```

Backend API:  
```
https://api.teosegypt.com
```

---

**TEOS Egypt — Civic‑first blockchain travel operating system.**  
Anchored in Egypt, scaling globally.

## ?? Integration Summary
This repository is part of the **Elmahrosa Sovereign Stack**.  
Governance is anchored in **TEOS-FORGE**, with integrations across Bankchain, ERT-LAUNCH, FPBE, and other civic modules.  
See full details in [docs/integrations.md](https://github.com/Elmahrosa/TEOS-FORGE/blob/main/docs/integrations.md).


## 🔗 Integration Summary
This repository is part of the **Elmahrosa Sovereign Stack**.  
Governance is anchored in **TEOS-FORGE**, with integrations across Bankchain, ERT-LAUNCH, FPBE, and other civic modules.  
See full details in [docs/integrations.md](https://github.com/Elmahrosa/TEOS-FORGE/blob/main/docs/integrations.md).
