# Product Requirement Document (PRD) — Project ChakraView

**Product Name:** ChakraView (AI-Powered Multi-Signal Fraud Ring Detection Platform)  
**Hackathon:** ET AI Hackathon 2026 — Problem Statement 6 (Syndicated Cybercrime & Fraud Ring Detection)  
**Target Region:** West Bengal & Greater Kolkata Metro (Scaleable PAN-India)  
**Version:** 1.3.5 Enterprise  
**Status:** Production Ready  

---

## 1. Executive Summary

Digital arrest scams, courier seizure extortion, and automated mule account syndicates represent a multi-crore threat to Indian citizens and banking institutions. Cybercriminals exploit fragmented reporting systems by rapidly rotating destination UPI VPAs, disposable ingress devices, and VoIP script templates across state boundaries.

**ChakraView** is an enterprise-grade, multi-agent AI fraud ring detection platform designed for **Law Enforcement Agencies (LEA)** and **Enterprise Banks**. By combining hard identifier matching (UPI/Device/Account/IP) with NLP cosine script embeddings and geotemporal proximity algorithms, ChakraView auto-detects hidden crime rings in real time and empowers investigators to issue emergency debit freezes and legal subpoenas in seconds.

---

## 2. Problem Statement & User Personas

### 2.1 The Problem
- **Fragmented Incident Silos:** Complaints filed across different police stations or bank portals remain isolated, delaying syndicate detection.
- **Script Rotators & Mule Churn:** Scammers continuously switch UPI VPAs while retaining identical extortion scripts (e.g., CBI/ED impersonation).
- **DPDP Compliance & PII Exposure:** Handling victim names in legal files creates privacy risks under India's Digital Personal Data Protection (DPDP) Act.

### 2.2 User Personas

| Persona | Primary Role | Key Requirements & Goals | Access Scope |
| :--- | :--- | :--- | :--- |
| **Police Admin / Cyber Cell Officer** | State-wide crime investigation, LEA subpoena generation, syndicate bust | Unrestricted 100% state-wide visibility across all districts, dynamic force graph, subpoena markdown export | 100% Full State Scope |
| **Bank Fraud Risk Analyst** | Mule account freezing, NPCI/RBI debit hold requests, loss mitigation | Branch/Institution-level 30% scope, masked PII (Internal Customer ID), one-click emergency debit freeze | 30% Institution Scope |

---

## 3. Core Product Features & Architectural Modules

### 3.1 Dark Mode SOC Security Operations Console Aesthetic
- **Strict Dark Theme:** Base background `#0B101E`, elevated panels `#1A2235`, glowing crimson accent `#DC2626` for critical threats.
- **Header & Branding:** "Chakra" (white) + "View" (glowing crimson `#DC2626`). Features a header role dropdown to toggle between Police Admin and Bank Analyst.
- **Floating Action Capsule:** Bottom-center dark grey floating pill with "Scan QR & Report" button for instant complaint intake.

### 3.2 Role-Based Access Control (RBAC)
- **Police Admin Scope:** Displays 100% of state-wide data across Map, Network Graph, Accordion List, and Analytics Dashboard.
- **Bank Analyst Scope:** Automatically filters cases, map markers, and graph nodes to **30% scope**, safeguarding PII while focusing on actionable mule VPAs.

### 3.3 Multi-Signal Evidence Fusion Scoring Engine
The backend implements a multi-agent evidence fusion algorithm:

$$\text{FusionScore}(A, B) = (0.45 \cdot S_{\text{exact}}) + (0.35 \cdot S_{\text{script}}) + (0.20 \cdot S_{\text{geo}})$$

1. **Exact Match Sub-scorer ($S_{\text{exact}}$):** Checks for exact string matches on destination UPI VPAs, scammer bank accounts, ingress device IDs, or phone numbers.
2. **NLP Script Similarity Sub-scorer ($S_{\text{script}}$):** Compares unstructured call transcripts for shared extortion templates (CBI Digital Arrest, Supreme Court clearance warrants, Customs Courier Seizures). Returns $S_{\text{script}} = 0.90$ for matching templates even with zero shared hard IDs.
3. **GeoTemporal Proximity Sub-scorer ($S_{\text{geo}}$):** Measures spatial distance ($<5\text{ km}$) and time delta ($<48\text{ hours}$).

Cases are auto-clustered into a **Fraud Ring** object whenever $\text{FusionScore} > 0.60$.

### 3.4 Dynamic Real-Time Intake & Node Snapping (The "Wow" Demo Moment)
- **Scan QR / Complaint Intake Modal:** Features a **"Load Hackathon Demo Script"** button that autofills a synthetic CBI Digital Arrest complaint with unique UPI and Device ID but matching script pattern.
- **Real-Time Dynamic Refresh:** Submitting `POST /api/cases` updates state without a page reload.
- **Live Visual Snapping:** The newly ingested complaint appears live on the force-directed Network Graph and CartoDB Dark Matter Map, visually snapping into an existing syndicate cluster.

### 3.5 Expandable Accordion Complaints List View
- **Card Accordion:** Expandable grid cards displaying Internal Customer ID, Risk Score, Location, and Amount at Risk.
- **12 DPDP Fields:** Reveals Scammer Bank AC, IFSC Code, Destination VPA, Scammer Phone, Device ID, IP Address, Timestamp, Pin Code, and Call Transcript.
- **Actions:** Includes **"Emergency Freeze Mule VPA"** (issues NPCI/RBI debit hold) and **"View Report"** (opens subpoena modal).

### 3.6 Heavy Visualizations (Map & Graph)
- **CartoDB Dark Matter Map View:** CartoDB Dark Matter tiles (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`) centered on West Bengal (Kolkata, Howrah, Siliguri, Asansol). Rendered with interactive ward choropleth polygons and custom dark maroon circle cluster bubbles (`#7A1C1C` fill, white border) scaling with report density. Includes a Dark/Light mode switcher button.
- **Force-Directed Network Graph View:** HTML5 2D Canvas graph topology. Nodes color-coded:
  - 🔴 **Red (`#EF4444`)**: Mule Accounts & Destination VPAs
  - 🟡 **Amber (`#F59E0B`)**: NLP Script Rotators
  - 🔵 **Blue (`#38BDF8`)**: Victim Complaint Nodes

### 3.7 Exportable Investigator Subpoena & Excel Analytics
- **Export LEA Subpoena (.MD):** One-click Markdown subpoena report generator detailing Ring ID, Total Amount at Risk, Affected Citizens, Evidence Breakdown, Target Entities Table, and Cyber Cell Escalation Directives.
- **Export Analytics to Excel (.CSV):** Top-level button on the Reports page downloading district funds at risk, category breakdown, and syndicate data into a `.csv` spreadsheet.

---

## 4. Technical Architecture & Tech Stack

```
[React 18 + Vite] <---> [Vercel Serverless / Express REST API] <---> [In-Memory Seed DB / Scoring Engine]
       |                                      |
       +-- Leaflet CartoDB Dark Map           +-- Multi-Signal Fusion (0.45/0.35/0.20)
       +-- HTML5 Canvas 2D Force Graph        +-- Louvain Cluster Detection
       +-- Recharts Analytics                 +-- Faker en_IN 40 WB Cases
```

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, Leaflet, Canvas Confetti.
- **Backend:** Node.js, Express, CORS, `@faker-js/faker` (`en_IN` locale).
- **Deployment:** Monolithic Vercel deployment with native Serverless Function API rewrites (`api/cases.js`, `api/rings.js`).

---

## 5. Success Metrics & Verification

1. **Production Build Cleanliness:** Zero TypeScript errors (`npm run build` in 24.8s).
2. **Cluster Detection Speed:** Sub-50ms multi-signal scoring across 40+ cases.
3. **Demo Readiness:** 100% immediate portability without database configuration.
