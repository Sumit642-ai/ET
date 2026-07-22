export type LinkageType = 
  | 'exact_phone'
  | 'exact_upi'
  | 'exact_account'
  | 'exact_device'
  | 'exact_ip'
  | 'script_embedding'
  | 'spatiotemporal'
  | 'composite';

export type EvidenceType = 'hard-identifier-linked' | 'script-only-linked' | 'hybrid' | 'mixed-evidence';

export interface FraudCase {
  case_id: string;
  internal_customer_id?: string;
  victim_name?: string;
  account_number?: string;
  scammer_account_number?: string;
  ifsc_code?: string;
  scammer_phone_number?: string;
  upi_vpa: string;
  device_id: string;
  ip_address: string;
  amount: number;
  timestamp: string;
  incident_timestamp?: string;
  city: string;
  lat: number;
  lng: number;
  ward_or_area: string;
  pincode?: string;
  transcript_text: string;
  risk_score: number;
  scam_type: string;
  created_at: string;
}

export interface EvidenceLink {
  source_case_id: string;
  target_case_id: string;
  case_id_a?: string;
  case_id_b?: string;
  linkage_type: LinkageType;
  confidence_score: number;
  exact_match_score?: number;
  script_similarity_score?: number;
  behavioral_score?: number;
  combined_score?: number;
  weight: number;
  details: {
    matched_value?: string;
    script_similarity?: number;
    spatial_km?: number;
    time_delta_hours?: number;
  };
}

export interface FraudRing {
  ring_id: string;
  ring_name: string;
  primary_scam_pattern: string;
  member_case_ids: string[];
  total_amount_at_risk: number;
  customers_affected: number;
  risk_level?: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  avg_risk_score?: number;
  cities: string[];
  evidence_type: EvidenceType;
  central_node_type?: 'UPI' | 'DEVICE' | 'SCRIPT' | 'IP';
  created_at?: string;
}

export interface Recommendation {
  ring_id: string;
  action: 'FREEZE_TARGET_VPAS' | 'BLOCK_INGRESS_DEVICES' | 'MONITOR_HIGH_RISK_SUBORDINATES' | 'ESCALATE_CYBER_CELL' | 'Freeze' | 'Monitor' | 'No Action';
  target_entities: Array<{
    type: 'UPI' | 'DEVICE' | 'BANK_AC' | 'PHONE' | string;
    value: string;
    role?: string;
  }>;
  justification_text: string;
  confidence: number;
}

export interface CaseReport {
  report_id: string;
  generated_at: string;
  ring_id: string;
  ring_name?: string;
  total_amount_at_risk: number;
  customers_affected: number;
  summary_text: string;
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
  status: 'all' | 'active' | 'in_progress' | 'frozen' | 'resolved';
  linkageType: 'all' | 'script-only-linked' | 'hard-identifier-linked' | 'mixed-evidence' | 'hard' | 'script';
  searchQuery: string;
  selectedCity: string;
}
