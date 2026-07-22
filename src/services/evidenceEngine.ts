import { FraudCase, EvidenceLink, FraudRing, Recommendation, CaseReport, LinkageType, EvidenceType } from '../types/fraud';

// Calculate Cosine Similarity between 2 transcript texts (Keyword-based TF vector approach)
export function calculateTranscriptSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;

  const tokenize = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);
  };

  const wordsA = tokenize(textA);
  const wordsB = tokenize(textB);

  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const freqA: Record<string, number> = {};
  const freqB: Record<string, number> = {};

  wordsA.forEach(w => freqA[w] = (freqA[w] || 0) + 1);
  wordsB.forEach(w => freqB[w] = (freqB[w] || 0) + 1);

  const allWords = Array.from(new Set([...wordsA, ...wordsB]));

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  allWords.forEach(w => {
    const a = freqA[w] || 0;
    const b = freqB[w] || 0;
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  });

  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Calculate Haversine Distance (in km) between 2 lat/lng pairs
export function calculateGeoDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Multi-Signal Evidence Fusion Scorer (0.45 Exact + 0.35 Script + 0.20 Geo)
export function evaluatePairwiseEvidence(caseA: FraudCase, caseB: FraudCase): EvidenceLink | null {
  if (caseA.case_id === caseB.case_id) return null;

  // 1. Exact Match Sub-scorer (0.45 weight)
  let exactMatchScore = 0;
  let matchedValue = '';
  let linkageType: LinkageType = 'composite';

  if (caseA.upi_vpa && caseA.upi_vpa === caseB.upi_vpa) {
    exactMatchScore = 1.0;
    matchedValue = caseA.upi_vpa;
    linkageType = 'exact_upi';
  } else if (caseA.device_id && caseA.device_id === caseB.device_id) {
    exactMatchScore = 1.0;
    matchedValue = caseA.device_id;
    linkageType = 'exact_device';
  } else if (caseA.scammer_account_number && caseA.scammer_account_number === caseB.scammer_account_number) {
    exactMatchScore = 1.0;
    matchedValue = caseA.scammer_account_number;
    linkageType = 'exact_account';
  } else if (caseA.scammer_phone_number && caseA.scammer_phone_number === caseB.scammer_phone_number) {
    exactMatchScore = 1.0;
    matchedValue = caseA.scammer_phone_number;
    linkageType = 'exact_phone';
  } else if (caseA.ip_address && caseA.ip_address === caseB.ip_address) {
    exactMatchScore = 0.85;
    matchedValue = caseA.ip_address;
    linkageType = 'exact_ip';
  }

  // 2. Script Cosine Similarity Sub-scorer (0.35 weight)
  const scriptSim = calculateTranscriptSimilarity(caseA.transcript_text, caseB.transcript_text);
  if (scriptSim > 0.40 && exactMatchScore === 0) {
    linkageType = 'script_embedding';
  }

  // 3. Spatiotemporal & Behavioral Sub-scorer (0.20 weight)
  const geoDistKm = (caseA.lat && caseB.lat) ? calculateGeoDistance(caseA.lat, caseA.lng, caseB.lat, caseB.lng) : 50;
  const timeDeltaHours = Math.abs(new Date(caseA.timestamp).getTime() - new Date(caseB.timestamp).getTime()) / (1000 * 3600);

  let behavioralScore = 0;
  if (geoDistKm < 15) behavioralScore += 0.5;
  if (timeDeltaHours < 72) behavioralScore += 0.5;

  // Composite Fusion Formula
  const combinedScore = (0.45 * exactMatchScore) + (0.35 * scriptSim) + (0.20 * behavioralScore);

  if (combinedScore < 0.25) return null;

  return {
    source_case_id: caseA.case_id,
    target_case_id: caseB.case_id,
    case_id_a: caseA.case_id,
    case_id_b: caseB.case_id,
    linkage_type: linkageType,
    confidence_score: parseFloat(combinedScore.toFixed(3)),
    exact_match_score: exactMatchScore,
    script_similarity_score: parseFloat(scriptSim.toFixed(3)),
    behavioral_score: parseFloat(behavioralScore.toFixed(3)),
    combined_score: parseFloat(combinedScore.toFixed(3)),
    weight: parseFloat(combinedScore.toFixed(3)),
    details: {
      matched_value: matchedValue,
      script_similarity: parseFloat(scriptSim.toFixed(3)),
      spatial_km: parseFloat(geoDistKm.toFixed(1)),
      time_delta_hours: parseFloat(timeDeltaHours.toFixed(1))
    }
  };
}

// Detect Fraud Rings via Community Graph Detection
export function detectFraudRings(cases: FraudCase[], threshold: number = 0.30): { links: EvidenceLink[]; rings: FraudRing[] } {
  const links: EvidenceLink[] = [];

  for (let i = 0; i < cases.length; i++) {
    for (let j = i + 1; j < cases.length; j++) {
      const link = evaluatePairwiseEvidence(cases[i], cases[j]);
      if (link && (link.combined_score ?? 0) >= threshold) {
        links.push(link);
      }
    }
  }

  // Simple Graph Component Detector
  const adj: Record<string, string[]> = {};
  cases.forEach(c => adj[c.case_id] = []);

  links.forEach(l => {
    const idA = l.case_id_a || l.source_case_id;
    const idB = l.case_id_b || l.target_case_id;
    if (idA && idB) {
      if (!adj[idA]) adj[idA] = [];
      if (!adj[idB]) adj[idB] = [];
      adj[idA].push(idB);
      adj[idB].push(idA);
    }
  });

  const visited = new Set<string>();
  const rings: FraudRing[] = [];

  cases.forEach(c => {
    if (!visited.has(c.case_id) && adj[c.case_id] && adj[c.case_id].length > 0) {
      const component: string[] = [];
      const queue = [c.case_id];
      visited.add(c.case_id);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        component.push(curr);
        (adj[curr] || []).forEach(neighbor => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }

      if (component.length >= 2) {
        const memberCases = cases.filter(mc => component.includes(mc.case_id));
        const totalAmount = memberCases.reduce((acc, mc) => acc + mc.amount, 0);
        const cities = Array.from(new Set(memberCases.map(mc => mc.city)));
        const avgRisk = Math.round(memberCases.reduce((acc, mc) => acc + mc.risk_score, 0) / memberCases.length);

        const ringLinks = links.filter(l => component.includes(l.case_id_a || l.source_case_id) && component.includes(l.case_id_b || l.target_case_id));
        const hasExactMatch = ringLinks.some(l => (l.exact_match_score ?? 0) > 0);
        const hasScriptSim = ringLinks.some(l => (l.script_similarity_score ?? 0) > 0.45);

        let evidenceType: EvidenceType = 'hard-identifier-linked';
        if (!hasExactMatch && hasScriptSim) evidenceType = 'script-only-linked';
        else if (hasExactMatch && hasScriptSim) evidenceType = 'hybrid';

        const ringId = `RING-${Math.floor(100 + Math.random() * 900)}`;

        rings.push({
          ring_id: ringId,
          ring_name: evidenceType === 'script-only-linked'
            ? `Script-Only Linked Syndicate (${memberCases[0].scam_type})`
            : `Mule Network Ring #${ringId}`,
          primary_scam_pattern: memberCases[0].scam_type || 'Digital Arrest',
          member_case_ids: component,
          total_amount_at_risk: totalAmount,
          customers_affected: memberCases.length,
          risk_level: avgRisk >= 90 ? 'CRITICAL' : avgRisk >= 75 ? 'HIGH' : 'MEDIUM',
          avg_risk_score: avgRisk,
          cities: cities,
          evidence_type: evidenceType,
          created_at: new Date().toISOString()
        });
      }
    }
  });

  return { links, rings };
}

// Generate Ring Recommendation
export function generateRingRecommendation(
  ring: FraudRing,
  memberCases: FraudCase[],
  links: EvidenceLink[]
): Recommendation {
  const targetEntities: Array<{ type: 'UPI' | 'DEVICE' | 'BANK_AC' | 'PHONE'; value: string; role?: string }> = [];

  memberCases.forEach(c => {
    if (c.upi_vpa) targetEntities.push({ type: 'UPI', value: c.upi_vpa, role: 'Primary Mule VPA' });
    if (c.device_id) targetEntities.push({ type: 'DEVICE', value: c.device_id, role: 'Ingress Device' });
    if (c.scammer_account_number) targetEntities.push({ type: 'BANK_AC', value: c.scammer_account_number, role: 'Destination Mule Account' });
  });

  // Deduplicate
  const uniqueEntities = Array.from(new Map(targetEntities.map(item => [item.value, item])).values());

  return {
    ring_id: ring.ring_id,
    action: 'FREEZE_TARGET_VPAS',
    target_entities: uniqueEntities,
    justification_text: `Automated Multi-Signal Fusion Engine flagged ${ring.ring_name} across ${ring.cities.join(', ')} with total funds at risk ₹${(ring.total_amount_at_risk / 100000).toFixed(2)} Lakhs. Immediate emergency freeze enforced on destination mule accounts & VPAs.`,
    confidence: 0.94
  };
}

// Generate Investigator Case Report
export function generateCaseReport(
  ring: FraudRing,
  memberCases: FraudCase[],
  rec: Recommendation
): CaseReport {
  return {
    report_id: `REP-WB-${Math.floor(1000 + Math.random() * 9000)}`,
    generated_at: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    ring_id: ring.ring_id,
    ring_name: ring.ring_name,
    total_amount_at_risk: ring.total_amount_at_risk,
    customers_affected: ring.customers_affected,
    summary_text: `Investigator Intelligence Package for ${ring.ring_name}. System detected ${memberCases.length} linked complaints across ${ring.cities.join(', ')} totaling ₹${(ring.total_amount_at_risk / 100000).toFixed(2)} Lakhs. Pattern analysis indicates ${ring.primary_scam_pattern}.`,
    freeze_table: rec.target_entities.map(e => ({
      entity: e.value,
      type: e.type,
      risk_level: 'CRITICAL',
      rationale: `Flagged via multi-signal fusion engine as ${e.role || 'Primary Target Mule Entity'}`,
      suggested_action: 'ENFORCE_IMMEDIATE_DEBIT_FREEZE'
    })),
    escalation_note: 'Forwarded to West Bengal Police Cyber Crime Wing, Bank Fraud Operations, and CERT-In.'
  };
}
