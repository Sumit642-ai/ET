import { INITIAL_CASES } from '../src/data/seedData.js';
import { detectFraudRings } from '../src/services/evidenceEngine.js';

const { links, rings } = detectFraudRings(INITIAL_CASES, 0.30);

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return res.status(200).json({
    success: true,
    totalRings: rings.length,
    totalLinks: links.length,
    rings: rings,
    links: links
  });
}
