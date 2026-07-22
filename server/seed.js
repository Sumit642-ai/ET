import { fakerEN_IN as faker } from '@faker-js/faker';

const CITIES = ['Kolkata', 'Howrah', 'Siliguri', 'Asansol', 'Durgapur', 'Bidhannagar', 'New Town'];
const WARDS = [
  'Ward 46 - Burrabazar / Esplanade',
  'Ward 58 - Park Circus / Sealdah',
  'Ward 12 - Salt Lake Sector V',
  'Ward 04 - New Town Action Area I',
  'Ward 14 - Howrah Railway',
  'Ward 69 - Alipore',
  'Ward 96 - Jadavpur Metro'
];

export function generateSeedCases() {
  const cases = [];

  // 1. Generate 36 standard synthetic fraud cases across West Bengal
  for (let i = 1; i <= 36; i++) {
    const city = faker.helpers.arrayElement(CITIES);
    const ward = faker.helpers.arrayElement(WARDS);
    const amount = faker.number.int({ min: 150000, max: 4500000 });
    const isDigitalArrest = i % 2 === 0;

    cases.push({
      case_id: `CASE-2026-WB${String(i).padStart(3, '0')}`,
      internal_customer_id: `CUST-${faker.number.int({ min: 100000, max: 999999 })}`,
      victim_name: faker.person.fullName(),
      account_number: `ACCT-${faker.number.int({ min: 1000000000, max: 9999999999 })}`,
      scammer_account_number: `ACCT-MULE-${faker.number.int({ min: 100000, max: 999999 })}`,
      ifsc_code: 'UTIB0000' + faker.number.int({ min: 100, max: 999 }),
      scammer_phone_number: '+91 9' + faker.number.int({ min: 800000000, max: 999999999 }),
      upi_vpa: isDigitalArrest ? 'clearance.supreme.court@okaxis' : `mule.escrow.${i}@paytm`,
      device_id: isDigitalArrest ? 'DEV-MULE-SHARED-99' : `DEV-WB-${faker.number.int({ min: 1000, max: 9999 })}`,
      ip_address: `103.211.${faker.number.int({ min: 10, max: 99 })}.${faker.number.int({ min: 1, max: 250 })}`,
      amount: amount,
      timestamp: new Date(Date.now() - faker.number.int({ min: 1, max: 10 }) * 24 * 3600 * 1000).toISOString(),
      incident_timestamp: new Date().toISOString(),
      city: city,
      lat: 22.5726 + (Math.random() * 0.08 - 0.04),
      lng: 88.3639 + (Math.random() * 0.08 - 0.04),
      ward_or_area: ward,
      pincode: '700' + faker.number.int({ min: 10, max: 99 }),
      transcript_text: isDigitalArrest 
        ? 'Received spoofed WhatsApp call claiming to be CBI Officer Officer Sharma. Threatening Digital Arrest under Supreme Court clearance warrant unless funds transferred to escrow account.'
        : 'Received call claiming illegal package seized at Customs. Demanded immediate transfer to clear courier seizure fine.',
      risk_score: faker.number.int({ min: 78, max: 98 }),
      scam_type: isDigitalArrest ? 'Digital Arrest (CBI/ED Impersonation)' : 'Customs Courier Seizure Scam',
      created_at: new Date().toISOString()
    });
  }

  // 2. Generate 4 "Script-Only" ring cases (Identical CBI script structure, but ZERO shared hard identifiers)
  for (let j = 1; j <= 4; j++) {
    const caseId = `CASE-2026-SCRIPT-0${j}`;
    cases.push({
      case_id: caseId,
      internal_customer_id: `CUST-SCRIPT-0${j}`,
      victim_name: faker.person.fullName(),
      account_number: `ACCT-PRIV-${j}000`,
      scammer_account_number: `ACCT-ROTATING-MULE-${j}99`,
      ifsc_code: 'SBIN000' + (100 + j),
      scammer_phone_number: `+91 9777${j} 8899${j}`, // UNIQUE PHONE
      upi_vpa: `isolated.rotator.${j}@icici`,         // UNIQUE UPI VPA (NO shared hard ID!)
      device_id: `DEV-ROTATOR-UNIQUE-${j}X`,         // UNIQUE DEVICE ID
      ip_address: `103.45.${j * 10}.99`,              // UNIQUE IP
      amount: 2400000 + (j * 150000),
      timestamp: new Date().toISOString(),
      incident_timestamp: new Date().toISOString(),
      city: 'Kolkata',
      lat: 22.5600 + (j * 0.01),
      lng: 88.3500 + (j * 0.01),
      ward_or_area: 'Ward 12 - Salt Lake Sector V',
      pincode: '700091',
      // IDENTICAL CBI DIGITAL ARREST SCRIPT TEXT FOR SCRIPT-ONLY RING DETECTOR!
      transcript_text: 'HIGH URGENCY: Received call claiming CBI Officer Digital Arrest warrant under Supreme Court clearance. Demand transfer to secure clearance escrow VPA immediately.',
      risk_score: 96,
      scam_type: 'Digital Arrest (CBI/ED Impersonation)',
      created_at: new Date().toISOString()
    });
  }

  return cases;
}
