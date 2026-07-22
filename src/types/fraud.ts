export type ScamType = 
  | 'Digital Arrest (CBI/ED Impersonation)'
  | 'Customs Courier Seizure Scam'
  | 'Part-Time Job / Telegram Fraud'
  | 'Electricity Bill Auto-Debit Scam'
  | 'Investment / Crypto Doubling Fraud';

export type EvidenceType = 'hard-identifier-linked' | 'script-only-linked' | 'mixed-evidence';

export type RecommendationAction = 'Freeze' | 'Monitor' | 'No Action';

export interface FraudCase {
  case_id: string;
  account_number: string;
  upi_vpa: string;
  device_id: string;
  ip_address: string;
  amount: number;
  timestamp: string;
  city: string;
  lat: number;
  lng: number;
  ward_or_area: string;
  transcript_text: string;
  risk_score: number; // 0 to 100
  scam_type: ScamType;
  created_at: string;
  victim_name?: string;
}

export interface ExtractedEntity {
  entity_id: string;
  case_id: string;
  type: 'phone' | 'upi' | 'account' | 'officer_name' | 'department' | 'device' | 'ip';
  value: string;
}

export interface EvidenceLink {
  case_id_a: string;
  case_id_b: string;
  exact_match_score: number; // 0.0 - 1.0 (weight 0.45)
  script_similarity_score: number; // 0.0 - 1.0 (weight 0.35)
  behavioral_score: number; // 0.0 - 1.0 (weight 0.20)
  combined_score: number; // continuous 0.0 - 1.0
  matched_fields: string[];
}

export interface FraudRing {
  ring_id: string;
  ring_name: string;
  member_case_ids: string[];
  evidence_type: EvidenceType;
  total_amount_at_risk: number;
  customers_affected: number;
  primary_scam_pattern: string;
  cities: string[];
  avg_risk_score: number;
  created_at: string;
}

export interface Recommendation {
  ring_id: string;
  action: RecommendationAction;
  target_entities: Array<{ value: string; type: string; role: string }>;
  justification_text: string;
  confidence: number; // 0 to 100
}

export interface CaseReport {
  report_id: string;
  ring_id: string;
  generated_at: string;
  summary_text: string;
  customers_affected: number;
  total_amount_at_risk: number;
  freeze_table: Array<{
    entity: string;
    type: string;
    risk_level: string;
    rationale: string;
    suggested_action: string;
  }>;
  escalation_note: string;
}

export type ViewMode = 'map' | 'graph' | 'list' | 'reports';

export interface FilterState {
  severity: 'all' | 'critical' | 'high' | 'medium' | 'low';
  status: 'all' | 'active' | 'in_progress' | 'resolved';
  linkageType: 'all' | 'hard-identifier-linked' | 'script-only-linked' | 'mixed-evidence';
  searchQuery: string;
  selectedCity: string;
}
