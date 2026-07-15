# 🛡️ RED TEAM vs BLUE TEAM - Security Simulation Lab

A premium, full-stack cybersecurity simulation sandbox designed to demonstrate the dynamic relationship between application-layer exploits (Red Team) and code-level mitigations (Blue Team) in real-time.

---

## 💎 Core Features

### ⚔️ Red Team (Attacking Console)
* **Reconnaissance Engine**: Run DNS query lookups, port scans, and domain information queries.
* **Exploit Laboratory**: Execute simulated SQL Injection (SQLi) and Cross-Site Scripting (XSS) payloads to observe system compromises.

### 🛡️ Blue Team (Defensive Mitigations)
* **Active Controls**: Switch defensive rules (e.g. Parameterized Queries, Input Sanitization, and Rate Limiting) on or off.
* **Feedback Loop**: Toggling a defense immediately changes the outcome of the attack payloads, adjusting the dynamic safety score on the dashboard.

### 📊 Security Header Analyzer
* **Endpoint Diagnostics**: Audit and grade the security headers (e.g., CSP, HSTS, X-Frame-Options) of any external domain or local address with automated letter grades (A+ to F).

### 📝 PDF Report Compiler
* **Compliance Reports**: Input your credentials and export structured, multi-page security report sheets compiling current vulnerabilities and active defenses.

### 🔌 Dual-DB Gateway Fallback
* **Seamless Offline Capability**: Built with a smart connection manager. If a live MongoDB server is not detected, the backend transparently falls back to an asynchronous local JSON database file, allowing full CRUD operations.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Recharts (Analytical Graphs), Lucide React (Vector Icons)
* **Backend**: Node.js, Express, JWT (Session Authentication), Helmet (HTTP Headers Protection), Cookie Parser, Multer, PDFKit (Vector PDF Compilation)
* **Database**: MongoDB (Mongoose) + Local File-Based JSON Database Fallback

---

## 📁 Repository Directory Structure

```text
├── backend/
│   ├── config/             # Connection configurations (db.js)
│   ├── controllers/        # Business logic handlers (auth, simulation, reports, admin)
│   ├── data/               # Fallback JSON database storage (history.json, users.json)
│   ├── middleware/         # Session validation & security gateways
│   ├── routes/             # API routing sockets
│   ├── services/           # PDF compiler engine (pdfService.js)
│   ├── utils/              # File database CRUD managers (jsonDb.js)
│   └── index.js            # Express application root
├── frontend/
│   ├── public/             # Static favicon assets (logo.svg)
│   ├── src/
│   │   ├── assets/         # Cyberpunk and modern light mode background wallpapers
│   │   ├── components/     # Reusable layout tools, toasts, sidebars, and logo SVGs
│   │   ├── context/        # Session tokens and Light/Dark state machines
│   │   ├── pages/          # Navigation views (Dashboard, RedTeam, BlueTeam, Reports)
│   │   ├── App.jsx         # App router and layout bindings
│   │   └── main.jsx        # Client entrypoint
│   ├── index.html          # HTML frame
│   ├── postcss.config.js   # Style processor rules
│   └── tailwind.config.js  # Theme variables configuration
├── package.json            # Unified execution scripts
└── verify.js               # Pipeline verification script
```

---

## 🏁 Quick Start Guide

### Prerequisites
* Node.js v22.12.0+ (already pre-bundled in your App Data folder)

### 1. Installation
In the root directory, install all required dependencies for both directories:
```bash
npm run install-all
```

### 2. Configure Environment variables
Configure your `.env` file in the `backend` folder:
```env
PORT=5000
JWT_SECRET=your_production_secret_key
JWT_EXPIRES_IN=7d
MONGO_URI=mongodb://localhost:27017/simulation_lab
```

### 3. Running the App locally
Run both frontend and backend development servers simultaneously:
```bash
npm run dev
```
* **Frontend client**: `http://localhost:5173/`
* **Backend API**: `http://localhost:5000/`

---

## 🧪 Verification & Audit Pipeline
To verify database CRUD handlers, fallbacks, and PDF compilations, run the automated verification script:
```bash
node verify.js
```