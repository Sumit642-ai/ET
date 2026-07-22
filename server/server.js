import express from 'express';
import cors from 'cors';
import { generateSeedCases } from './seed.js';
import { detectRingsFromCases } from './scoring.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory data store for hackathon portability
let cases = generateSeedCases();
let { links, rings } = detectRingsFromCases(cases, 0.40);

console.log(`[Chakravyuh Backend] Initialized with ${cases.length} synthetic cases and ${rings.length} detected rings.`);

// GET /api/cases
app.get('/api/cases', (req, res) => {
  res.json({
    success: true,
    total: cases.length,
    cases: cases
  });
});

// GET /api/rings
app.get('/api/rings', (req, res) => {
  res.json({
    success: true,
    totalRings: rings.length,
    totalLinks: links.length,
    rings: rings,
    links: links
  });
});

// POST /api/cases (Ingest new complaint, trigger multi-signal engine, update clusters)
app.post('/api/cases', (req, res) => {
  const newCaseData = req.body;

  const newCase = {
    case_id: newCaseData.case_id || `CASE-2026-${Math.floor(100 + Math.random() * 900)}`,
    internal_customer_id: newCaseData.internal_customer_id || `CUST-${Math.floor(100000 + Math.random() * 900000)}`,
    victim_name: newCaseData.victim_name || 'Anonymous Citizen',
    account_number: newCaseData.account_number || `ACCT-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    scammer_account_number: newCaseData.scammer_account_number || 'ACCT-MULE-9988',
    ifsc_code: newCaseData.ifsc_code || 'UTIB0000123',
    scammer_phone_number: newCaseData.scammer_phone_number || '+91 98301 22998',
    upi_vpa: newCaseData.upi_vpa || 'clearance.supreme.court@okaxis',
    device_id: newCaseData.device_id || `DEV-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
    ip_address: newCaseData.ip_address || '103.45.12.99',
    amount: parseFloat(newCaseData.amount) || 1200000,
    timestamp: new Date().toISOString(),
    incident_timestamp: newCaseData.incident_timestamp || new Date().toISOString(),
    city: newCaseData.city || 'Kolkata',
    lat: newCaseData.lat || 22.5600 + (Math.random() * 0.04 - 0.02),
    lng: newCaseData.lng || 88.3500 + (Math.random() * 0.04 - 0.02),
    ward_or_area: newCaseData.ward_or_area || 'Ward 58 - Park Circus',
    pincode: newCaseData.pincode || '700017',
    transcript_text: newCaseData.transcript_text || 'Scanned complaint report submitted by citizen.',
    risk_score: 96,
    scam_type: newCaseData.scam_type || 'Digital Arrest (CBI/ED Impersonation)',
    created_at: new Date().toISOString()
  };

  // Add to in-memory store
  cases.unshift(newCase);

  // Recalculate rings & links using multi-signal scoring engine
  const detection = detectRingsFromCases(cases, 0.40);
  links = detection.links;
  rings = detection.rings;

  console.log(`[Chakravyuh Backend] Ingested ${newCase.case_id}. Updated rings: ${rings.length}`);

  res.status(201).json({
    success: true,
    message: 'Complaint ingested and scored successfully',
    case: newCase,
    rings: rings,
    links: links
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Chakravyuh Express Server running at http://localhost:${PORT}`);
});
