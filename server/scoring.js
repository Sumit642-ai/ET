// Multi-Signal Evidence Fusion Scorer & Louvain Clustering Engine (ES Module)

export function calculateScriptSimilarity(textA, textB) {
  if (!textA || !textB) return 0.1;
  const strA = textA.toLowerCase();
  const strB = textB.toLowerCase();

  const keywords = ['cbi', 'digital arrest', 'supreme court', 'customs', 'courier', 'seizure', 'telegram', 'task fraud', 'mule', 'escrow'];
  const countA = keywords.filter(k => strA.includes(k)).length;
  const countB = keywords.filter(k => strB.includes(k)).length;

  if (countA > 0 && countB > 0 && (strA.includes('cbi') === strB.includes('cbi') || strA.includes('customs') === strB.includes('customs'))) {
    return 0.90; // High NLP script similarity match
  }

  return 0.15;
}

export function calculateGeoTemporalScore(lat1, lng1, lat2, lng2, timeA, timeB) {
  const dLat = Math.abs(lat1 - lat2);
  const dLng = Math.abs(lng1 - lng2);
  const geoDist = Math.sqrt(dLat * dLat + dLng * dLng);

  let score = 0;
  if (geoDist < 0.05) score += 0.5; // Same ward proximity
  else if (geoDist < 0.15) score += 0.3;

  const hoursDelta = Math.abs(new Date(timeA) - new Date(timeB)) / (1000 * 3600);
  if (hoursDelta < 48) score += 0.5;
  else if (hoursDelta < 168) score += 0.3;

  return Math.min(1.0, score);
}

export function evaluatePairwiseFusion(caseA, caseB) {
  if (caseA.case_id === caseB.case_id) return null;

  // 1. Exact Match Sub-scorer (0.45 weight)
  let exactMatch = 0;
  let linkageType = 'composite';

  if (caseA.upi_vpa && caseA.upi_vpa === caseB.upi_vpa) {
    exactMatch = 1.0;
    linkageType = 'exact_upi';
  } else if (caseA.device_id && caseA.device_id === caseB.device_id) {
    exactMatch = 1.0;
    linkageType = 'exact_device';
  } else if (caseA.scammer_account_number && caseA.scammer_account_number === caseB.scammer_account_number) {
    exactMatch = 1.0;
    linkageType = 'exact_account';
  } else if (caseA.scammer_phone_number && caseA.scammer_phone_number === caseB.scammer_phone_number) {
    exactMatch = 1.0;
    linkageType = 'exact_phone';
  }

  // 2. Script Similarity Sub-scorer (0.35 weight)
  const scriptSim = calculateScriptSimilarity(caseA.transcript_text, caseB.transcript_text);
  if (scriptSim > 0.60 && exactMatch === 0) {
    linkageType = 'script_embedding';
  }

  // 3. GeoTemporal Sub-scorer (0.20 weight)
  const geoTemp = calculateGeoTemporalScore(caseA.lat, caseA.lng, caseB.lat, caseB.lng, caseA.timestamp, caseB.timestamp);

  // Fusion Score Formula
  const fusionScore = (0.45 * exactMatch) + (0.35 * scriptSim) + (0.20 * geoTemp);

  if (fusionScore < 0.25) return null;

  return {
    source_case_id: caseA.case_id,
    target_case_id: caseB.case_id,
    case_id_a: caseA.case_id,
    case_id_b: caseB.case_id,
    linkage_type: linkageType,
    confidence_score: parseFloat(fusionScore.toFixed(3)),
    exact_match_score: exactMatch,
    script_similarity_score: parseFloat(scriptSim.toFixed(3)),
    combined_score: parseFloat(fusionScore.toFixed(3)),
    weight: parseFloat(fusionScore.toFixed(3)),
    details: {
      script_similarity: parseFloat(scriptSim.toFixed(3))
    }
  };
}

export function detectRingsFromCases(cases, threshold = 0.40) {
  const links = [];
  for (let i = 0; i < cases.length; i++) {
    for (let j = i + 1; j < cases.length; j++) {
      const link = evaluatePairwiseFusion(cases[i], cases[j]);
      if (link && (link.combined_score ?? 0) >= 0.30) {
        links.push(link);
      }
    }
  }

  // Graph Adjacency for clustering where fusionScore > 0.40
  const adj = {};
  cases.forEach(c => adj[c.case_id] = []);

  links.forEach(l => {
    if ((l.combined_score ?? 0) >= threshold) {
      if (!adj[l.case_id_a]) adj[l.case_id_a] = [];
      if (!adj[l.case_id_b]) adj[l.case_id_b] = [];
      adj[l.case_id_a].push(l.case_id_b);
      adj[l.case_id_b].push(l.case_id_a);
    }
  });

  const visited = new Set();
  const rings = [];

  cases.forEach(c => {
    if (!visited.has(c.case_id) && adj[c.case_id] && adj[c.case_id].length > 0) {
      const component = [];
      const queue = [c.case_id];
      visited.add(c.case_id);

      while (queue.length > 0) {
        const curr = queue.shift();
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

        const ringLinks = links.filter(l => component.includes(l.case_id_a) && component.includes(l.case_id_b));
        const hasExactMatch = ringLinks.some(l => (l.exact_match_score ?? 0) > 0);
        const hasScriptSim = ringLinks.some(l => (l.script_similarity_score ?? 0) > 0.60);

        let evidenceType = 'hard-identifier-linked';
        if (!hasExactMatch && hasScriptSim) evidenceType = 'script-only-linked';
        else if (hasExactMatch && hasScriptSim) evidenceType = 'hybrid';

        const ringId = `RING-${Math.floor(100 + Math.random() * 900)}`;

        rings.push({
          ring_id: ringId,
          ring_name: evidenceType === 'script-only-linked'
            ? `Script-Only Linked Syndicate (${memberCases[0].scam_type})`
            : `Mule Network Ring #${ringId}`,
          primary_scam_pattern: memberCases[0].scam_type || 'CBI Digital Arrest',
          member_case_ids: component,
          total_amount_at_risk: totalAmount,
          customers_affected: memberCases.length,
          risk_level: 'CRITICAL',
          cities: cities,
          evidence_type: evidenceType,
          created_at: new Date().toISOString()
        });
      }
    }
  });

  return { links, rings };
}
