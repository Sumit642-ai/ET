import { INITIAL_CASES } from '../src/data/seedData.js';

let casesStore = [...INITIAL_CASES];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const newCase = req.body || {};
    const ingested = {
      case_id: newCase.case_id || `CASE-2026-${Math.floor(100 + Math.random() * 900)}`,
      internal_customer_id: newCase.internal_customer_id || `CUST-${Math.floor(100000 + Math.random() * 900000)}`,
      victim_name: newCase.victim_name || 'Anonymous Citizen',
      account_number: newCase.account_number || `ACCT-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      scammer_account_number: newCase.scammer_account_number || 'ACCT-MULE-9988',
      ifsc_code: newCase.ifsc_code || 'UTIB0000123',
      scammer_phone_number: newCase.scammer_phone_number || '+91 98301 22998',
      upi_vpa: newCase.upi_vpa || 'clearance.supreme.court@okaxis',
      device_id: newCase.device_id || `DEV-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      ip_address: newCase.ip_address || '103.45.12.99',
      amount: parseFloat(newCase.amount) || 1200000,
      timestamp: new Date().toISOString(),
      city: newCase.city || 'Kolkata',
      lat: newCase.lat || 22.5600 + (Math.random() * 0.04 - 0.02),
      lng: newCase.lng || 88.3500 + (Math.random() * 0.04 - 0.02),
      ward_or_area: newCase.ward_or_area || 'Ward 58 - Park Circus',
      transcript_text: newCase.transcript_text || 'Scanned complaint report.',
      risk_score: 96,
      scam_type: 'Digital Arrest (CBI/ED Impersonation)',
      created_at: new Date().toISOString()
    };

    casesStore.unshift(ingested);

    return res.status(201).json({
      success: true,
      case: ingested,
      cases: casesStore
    });
  }

  return res.status(200).json({
    success: true,
    total: casesStore.length,
    cases: casesStore
  });
}
