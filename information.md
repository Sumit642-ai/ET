# RingBreaker West Bengal: AI Fraud Ring Detection Platform
> **ET AI Hackathon 2026 — Problem Statement 6**  
> *1:1 NammaKasa Pixel-Perfect Interactive Map & Multi-Signal Fraud Syndicate Intelligence Engine*

---

## 📌 Executive Overview

**RingBreaker West Bengal** is an advanced AI-powered fraud ring detection and civic complaint mapping platform designed to uncover sophisticated digital arrest, customs seizure, and task-fraud syndicates. Inspired by the **Namma Kasa** interactive map design, the application combines high-density civic visualization with a multi-signal graph intelligence engine capable of identifying crime rings—even when scammers rotate phone numbers, UPI VPAs, and bank accounts to avoid simple exact-match detection.

---

## 🚀 Key Features & Capabilities

### 1. 1:1 NammaKasa Visual Design System
- **Pixel-Perfect Header Bar**: Features the dual-color brand logo (`Namma` in black, `ಕಸ` in red), version badge (`v1.3.5`), top pink digest notification bar (`✉ Join 593 Bengalureans...`), and language selector button (`বাংলা` / `English`) with a floating caret tooltip (*"বাংলায় ব্যবহার করুন"*).
- **Interactive Light Map View**: Light CartoDB Positron map canvas pre-seeded with West Bengal ward & district administrative boundaries.
- **Choropleth Polygon Mesh & Hover Highlights**: Light pastel pink ward polygons (`#FCA5A5`) that dynamically highlight with a thick deep crimson border (`#DC2626`, `3.5px` stroke, `0.65 fill opacity`) upon mouse hover or selection.
- **NammaKasa Dark Maroon Circle Bubbles**: Distinctive maroon circles (`#7A1C1C` fill, `2px` crisp white border) displaying active report counts (`452`, `690`, `767`, `409`, `351`, `182`, `274`, `320`, `435`, `794`, `280`, `205`, `58`). Circle sizes dynamically scale based on report volume, with synchronized hover scaling (`scale(1.18)` + red glow).
- **Top-Left Stats Badge**: Floating white card showing active high-urgency threats (`6893 Active | 7160 Reports`).
- **Bottom-Left Active Ward Inspector**: Real-time inspector card displaying the hovered/selected ward, sub-division, and active report tally.
- **Floating Bottom Capsule Bar**: Floating dark navy capsule (`#0D1527`, centered `📱 Scan QR to Report` button) alongside a standalone white stat badge (`6893`).

---

## 🔍 Page-by-Page & Component Breakdown

### 1. Header Navigation (`src/components/Header.tsx`)
- **Brand Identity**: Dual-language typography matching the original NammaKasa reference.
- **Language Switcher**: Toggle between English and Bengali (`বাংলা`). Includes a sleek dark tooltip pointing to the language button.
- **Top Pink Digest Bar**: Displays live community updates and active scam advisories across West Bengal.

### 2. Filter Toolbar (`src/components/FilterBar.tsx`)
- **Dropdown Filters**:
  - `Severity Filter`: Filter complaints by Risk Score (`All`, `Critical >90`, `High 75-90`, `Medium 50-75`, `Low <50`).
  - `Status Filter`: Filter by case status (`All`, `Active Under Investigation`, `Frozen`, `Resolved`).
  - `Linkage Type`: Filter by connection signal (`Hard Identifier Linked` vs `Script-Only Linked`).
  - `City / District Filter`: Filter specifically by West Bengal cities (`Kolkata`, `Howrah`, `Siliguri`, `Asansol`, `Durgapur`, `Malda`, `Kharagpur`).
  - `Search Bar`: Real-time text search across victim names, UPI VPAs, device IDs, and call transcript text.
- **View Switcher Pill**: Toggle seamlessly between `Map`, `List`, `Graph`, and `Reports` views.

### 3. Interactive Map Workspace (`src/components/NammakasaMapView.tsx`)
- **Base Map**: Light greyscale CartoDB tiles.
- **District Boundary Mesh**: Multi-polygon overlay representing Kolkata Municipal Corporation wards (Burrabazar, Park Circus, Salt Lake, New Town, Alipore, Jadavpur, Shyambazar) and West Bengal districts (Howrah, Siliguri, Asansol, Malda, Kharagpur).
- **Interactive Hover & Sync**: Moving the cursor over a polygon or maroon bubble highlights the district border, enlarges the circle, and updates the bottom-left ward card instantly.
- **Map Controls**: Stacked white controls (`Locate Me`, `Zoom In (+)`, `Zoom Out (-)`).

### 4. Network Graph View (`src/components/NetworkGraphView.tsx`)
- **Force-Directed Graph**: 2D HTML5 Canvas engine visualising nodes (Victims, Mule VPAs, Devices, Script Signatures) and weighted links.
- **Node Classification**:
  - 🔴 **Red Nodes**: High-risk crime syndicates / Mule VPAs.
  - 🟡 **Amber Nodes**: Script-only linked rotators (zero shared identifiers).
  - 🔵 **Blue Nodes**: Individual victim complaints.
- **Interactive Controls**: Drag nodes, pan canvas, zoom, and click any node to open investigator drawer.

### 5. List & Reports Workspace (`src/components/ListView.tsx`)
- **Clean Light UI Card Grid**: White background cards (`#FFFFFF`) with subtle borders (`#E2E8F0`) and soft shadows (`shadow-sm`).
- **Tab Switcher**: Toggle between **All Fraud Complaints** (14 seeded cases + user additions) and **Detected Fraud Rings** (3 active syndicates).
- **Card Metrics**: Displays Case ID badge (`CASE-2026-xxx`), Risk Score, Victim Name, Ward/Location, Amount at Risk (in ₹ Lakhs), Destination UPI VPA, and Transcript excerpt.

### 6. Scan QR & Report Complaint Modal (`src/components/CaseIntakeModal.tsx`)
- 📷 **Camera QR Scanner Tab**:
  - **Live Webcam Integration**: Streams actual webcam feed via `navigator.mediaDevices.getUserMedia`.
  - **Interactive QR Simulation**: Clicking **"Scan QR Code Now"** triggers a scanning animation, auto-verifies the QR code, auto-detects Kolkata Ward 46 (Burrabazar Escrow Scam), adds the complaint live to the map, fires celebratory confetti, and increments the report counter (`6893` ➔ `6894`).
- 📝 **Complaint Intake Form Tab**:
  - Manual entry for Victim Name, Amount (₹), Destination UPI VPA, Ingress Device ID, City, Ward, and Call Transcript.
- ⚡ **Hackathon Judge Demo Script Button**:
  - One-click auto-fill pre-loaded with a CBI Digital Arrest scam transcript for rapid hackathon evaluation.

### 7. Ring Intelligence Drawer (`src/components/RingDetailDrawer.tsx`)
- **Slide-out Panel**: Opens when clicking any cluster on the map or graph.
- **Financial Risk Metrics**: Total funds at risk (e.g. ₹85.00 Lakhs) and total affected victims.
- **System Action Recommendations**: Enforces automated freeze protocols (`FREEZE_TARGET_VPAS`, `BLOCK_INGRESS_DEVICES`).
- **Target Entity List**: Itemized list of mule VPAs and bank accounts flagged for emergency bank freeze.

### 8. Investigator Intelligence Report Modal (`src/components/CaseReportModal.tsx`)
- **Formal Case Package**: Structured report formatted for bank fraud ops, police cyber cell submission, and CERT-In notifications.
- **Components**: Executive summary, actionable account freeze matrix table, law enforcement escalation protocol, and a **"Print / Export PDF"** button.

---

## ⚙️ Core AI & Multi-Signal Fusion Engine (`src/services/evidenceEngine.ts`)

RingBreaker uses a 3-tier multi-signal fusion scoring algorithm:

$$\text{FusionScore}(A, B) = 0.45 \cdot S_{\text{exact}} + 0.35 \cdot S_{\text{script}} + 0.20 \cdot S_{\text{geo}}$$

1. **Exact Match Score ($S_{\text{exact}}$)**:
   - Matches hard identifiers: Shared UPI VPA, Bank AC, Device ID, or IP subnet.
2. **Script Similarity Score ($S_{\text{script}}$)**:
   - Evaluates call transcript text using TF-IDF / Cosine Similarity across key scam phrases (*"Supreme Court clearance"*, *"CBI Digital Arrest"*, *"Courier seizure fine"*).
3. **Spatiotemporal Score ($S_{\text{geo}}$)**:
   - Measures ward geographic proximity and timestamp velocity.

### Community Detection
Applies the **Louvain Community Detection** algorithm to partition the weighted evidence graph into distinct, tightly-knit fraud rings (e.g. *Mixed Multi-Signal Scam Syndicate #1*, *Mule Device #2 Hard-Linked Ring*, *Ring-BRAVO-SCRIPT*).

---

## 💻 Tech Stack

- **Frontend Core**: React 18, TypeScript, Vite
- **Mapping & Geospatial**: Leaflet, React-Leaflet, CartoDB Positron Tiles
- **Styling & UI**: TailwindCSS, Vanilla CSS, Lucide Icons
- **FX & Animations**: Canvas-Confetti, CSS3 Transitions
- **Version Control**: Git, GitHub (`https://github.com/Sumit642-ai/ET.git`)

---

## 🛠️ How to Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sumit642-ai/ET.git
   cd ET
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build production bundle**:
   ```bash
   npm run build
   ```
