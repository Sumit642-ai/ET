# Project Information & Technical Documentation — ChakraView

**Project Title:** ChakraView — AI Multi-Signal Fraud Ring Detection Platform  
**Target Platform:** Law Enforcement Agencies (LEA) & Enterprise Banking SOC Consoles  
**Repository:** [https://github.com/Sumit642-ai/ET.git](https://github.com/Sumit642-ai/ET.git)  
**Live Vercel Deployment:** [https://et-neon.vercel.app](https://et-neon.vercel.app)  

---

## 1. System Overview

**ChakraView** solves the problem of syndicated cybercrime in India by fusing disparate fraud complaint signals into real-time actionable crime ring clusters. It is customized for West Bengal and Greater Kolkata Metro with synthetic data seeded using real locations (Kolkata Central, Salt Lake Sector V, New Town, Howrah, Siliguri, Asansol).

---

## 2. Component & Workspace Directory Structure

```
e:\ET_fraud project\
├── api/                       # Vercel Native Serverless Functions
│   ├── cases.js              # GET /api/cases & POST /api/cases serverless handler
│   └── rings.js              # GET /api/rings serverless handler
├── server/                    # Standalone Node.js Express Backend
│   ├── scoring.js            # Multi-signal fusion scorer & clustering algorithm
│   ├── seed.js               # Faker en_IN 40 synthetic WB case generator
│   └── server.js             # Express API listening on port 5000
├── src/
│   ├── components/
│   │   ├── Header.tsx        # Brand logo ChakraView + Role Switcher Dropdown
│   │   ├── LoginScreen.tsx   # Glassmorphism login + 1-second zoom transition
│   │   ├── FilterBar.tsx     # Severity, Status, Linkage, City filters & View Switcher
│   │   ├── NammakasaMapView.tsx # CartoDB Dark Matter map, polygons & cluster bubbles
│   │   ├── NetworkGraphView.tsx # HTML5 Canvas 2D force-directed graph console
│   │   ├── ListView.tsx      # Expandable complaint cards, freeze action & CSV export
│   │   ├── DashboardView.tsx # Recharts executive graphs & Excel CSV export
│   │   ├── CaseIntakeModal.tsx # Complaint intake, webcam QR scanner & demo script
│   │   ├── RingDetailDrawer.tsx # Slide-out syndicate intelligence panel
│   │   ├── CaseReportModal.tsx # One-click LEA Subpoena Markdown report modal
│   │   └── BottomNav.tsx     # Floating bottom navigation capsule
│   ├── data/
│   │   └── seedData.ts       # Frontend high-density seed fallback cases
│   ├── services/
│   │   └── evidenceEngine.ts # Client-side fallback evidence engine
│   ├── types/
│   │   └── fraud.ts          # TypeScript interfaces (FraudCase, FraudRing, etc.)
│   ├── App.tsx               # Main app router, state management & RBAC logic
│   └── main.tsx              # Entry point with Leaflet CDN asset fix & ErrorBoundary
├── vercel.json                # Vercel deployment rewrites config
├── PRD.md                     # Product Requirement Document
└── information.md             # Technical & Architectural Detail Document
```

---

## 3. Data Schema Reference

### 3.1 `FraudCase`
```ts
export interface FraudCase {
  case_id: string;                // e.g. "CASE-2026-WB001"
  internal_customer_id?: string;  // DPDP PII replacement (e.g. "CUST-883921")
  victim_name?: string;
  account_number?: string;
  scammer_account_number?: string; // Destination Mule Bank AC
  ifsc_code?: string;             // Bank IFSC Code
  scammer_phone_number?: string;
  upi_vpa: string;                // Destination UPI VPA
  device_id: string;              // Ingress Device ID
  ip_address: string;             // IP Address
  amount: number;                 // Amount at risk in INR (₹)
  timestamp: string;              // Date & Time
  city: string;                   // West Bengal City / District
  lat: number;
  lng: number;
  ward_or_area: string;
  pincode?: string;
  transcript_text: string;        // Unstructured victim statement / call transcript
  risk_score: number;             // 0 to 100
  scam_type: string;              // e.g. "Digital Arrest (CBI/ED Impersonation)"
}
```

### 3.2 `FraudRing`
```ts
export interface FraudRing {
  ring_id: string;                // e.g. "RING-104"
  ring_name: string;              // e.g. "Script-Only Linked Syndicate"
  primary_scam_pattern: string;
  member_case_ids: string[];
  total_amount_at_risk: number;
  customers_affected: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  cities: string[];
  evidence_type: 'hard-identifier-linked' | 'script-only-linked' | 'hybrid';
}
```

---

## 4. REST API Endpoint Specifications

### `GET /api/cases`
Returns all ingested fraud cases in the database.

### `GET /api/rings`
Returns all multi-signal detected fraud rings and pairwise evidence links.

### `POST /api/cases`
Ingests a new complaint, triggers the scoring engine, updates clusters, and returns the newly added case and refreshed rings.

---

## 5. Deployment Instructions

- **Local Server**:
  ```bash
  node server/server.js   # Express running on port 5000
  npm run dev            # Vite running on port 3000
  ```
- **Vercel Monolithic Serverless Deployment**:
  Pushing to `main` branch on GitHub automatically deploys both Vite static output and Vercel serverless functions in `api/` to `et-neon.vercel.app`.
