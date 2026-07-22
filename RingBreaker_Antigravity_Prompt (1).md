# Antigravity Build Prompt — RingBreaker

Paste everything below as a single prompt into Antigravity.

---

Build a complete, working full-stack web application called **RingBreaker** — an AI-powered fraud-ring detection and case-resolution tool for fraud operations analysts at a bank/fintech. This is a hackathon prototype (ET AI Hackathon 2026, Problem Statement 6 — Digital Public Safety), so it must be **fully seeded and demoable immediately after generation** — no manual data entry required to see it working, though manual entry must also work live.

## Core concept

A fraud complaint comes in (a call transcript and/or transaction details). The system must determine whether this complaint is part of a larger coordinated fraud ring — **even when the ring deliberately uses a different phone number, UPI ID, and device for every victim.** Do not build simple exact-match lookup as the primary logic — that is commodity rule-engine behavior any bank already has. The actual point of this tool is catching rings that rotate their identifiers by matching on their **script and behavior pattern** instead.

## The pipeline (build all of it, end to end, wired together — not disconnected screens)

1. **Case Intake** — a form where an analyst enters any subset of: account number, UPI VPA, device ID, IP address, amount, timestamp, city, and/or pastes a call transcript. No field is required alone.

2. **Scam Classifier** — call an LLM (few-shot prompted, not trained) with the transcript. It must detect three patterns: authority impersonation (CBI/ED/Customs claims), urgency/fear language, and payment demand structure. Return a risk score (0–100) and extract any phone numbers / UPI IDs mentioned in the text.

3. **Multi-Signal Evidence Scoring** — for every pair of cases, compute a single combined linkage score (0–1) from three independent signals:
   - **Exact identifier overlap** (weight 0.45): boolean match on UPI VPA / device ID / IP / account number.
   - **Script similarity** (weight 0.35): cosine similarity between text embeddings of the two transcripts. Use a real embedding model/API for this — this is the most important signal, do not fake it with keyword overlap.
   - **Behavioral proximity** (weight 0.20): closeness of timestamp, amount range, and city sequence.
   
   This must be a continuous score, never a boolean "matched/not matched."

4. **Ring Detection** — build a graph where cases are nodes and pairwise scores above a floor (0.3) are weighted edges. Run community detection (Louvain or equivalent) to find clusters. Tag each ring as "hard-identifier-linked," "script-only-linked," or "mixed evidence" depending on which signal types contributed.

5. **Recommendation Engine** — for each detected ring, call an LLM with the ring's case details and evidence breakdown, and have it reason in plain language whether the evidence justifies **Freeze**, **Monitor**, or **No Action**, naming specific accounts/UPI IDs and explaining why (e.g. "these 4 cases share both script pattern and one device ID — strong compounding evidence"). Implement a deterministic fallback rule in code (freeze if combined score ≥0.6 across ≥2 cases; monitor otherwise) in case the LLM call fails.

6. **Case Report** — a one-click generated, downloadable structured report per ring: plain-language summary, case count, customers affected, total ₹ at risk, a freeze/monitor table with named entities, and an escalation note. Frame this explicitly as "a structured intelligence package formatted for investigator handoff" — never claim legal/court admissibility anywhere in the UI copy.

7. **Geospatial Map** — clicking a ring filters a map view to show that ring's case locations (use a free map library — Leaflet with OpenStreetMap tiles is fine). No independent logic — purely mirrors the graph's current selection.

## Data model

Implement these entities (Postgres or SQLite, your choice):
- **Case**: case_id, account_number, upi_vpa, device_id, ip_address, amount, timestamp, city, transcript_text, risk_score, created_at
- **Extracted Entity**: entity_id, case_id, type, value
- **Evidence Link**: case_id_a, case_id_b, exact_match_score, script_similarity_score, behavioral_score, combined_score, matched_fields
- **Ring**: ring_id, member_case_ids, evidence_type, total_amount_at_risk, customers_affected
- **Recommendation**: ring_id, action, target_entities, justification_text
- **Case Report**: report_id, ring_id, summary_text, freeze_table, escalation_note

## Synthetic seed data — generate this automatically on first run

Generate 30–50 synthetic fraud cases in India-relevant context (digital arrest scam framing: CBI/ED/Customs impersonation, UPI payments, Indian cities). Design the topology deliberately, not randomly:
- 2–3 rings linked by shared hard identifiers (device/UPI reuse) — the "easy" rings.
- **At least 1 ring where every case has a completely different phone number, UPI ID, and device, but the transcripts follow the same underlying scam script** — this is the ring that proves the tool's real value and should be the centerpiece of the live demo.
- 8–10 unrelated singleton cases (no ring) as negative examples, so clustering doesn't over-merge everything.
- Realistic staggered timestamps and city spread within each ring (mule fan-out pattern, not everything happening at once).
- Do not use any real names, real phone numbers, or real account numbers — everything must read as clearly synthetic/placeholder data.

## Visual design direction — read this carefully, it matters as much as the logic

Do **not** build a generic purple-gradient AI-dashboard/SaaS-landing-page look. This must read as an **investigator console** — closer to a case-management / SOC (security operations center) tool than a consumer app.
- Dark or near-dark base UI, high information density, monospace/tabular numerals for IDs and amounts.
- Muted, restrained accent colors reserved for status (risk score, freeze/monitor tags, ring evidence-type badges) — not decorative.
- The graph view is the centerpiece: nodes should be clearly labeled, edges should visually communicate evidence type (e.g. different line style/color for "hard-identifier" vs "script-only" links), and a new node snapping into a cluster should be visibly animated.
- Typography: clean, technical, no rounded playful fonts. This should look like something a bank's fraud team would actually deploy internally, not a hackathon toy.
- No stock photography, no illustrations of people, no generic "AI brain" or "shield" iconography clichés.

## Live demo requirement

Build a "Submit new complaint" flow on the intake screen that, when used with a specific pre-scripted transcript (matching the script-only ring's pattern but with new identifiers), causes the graph to visibly update and the new case to snap into the existing script-only-linked cluster in real time. This is the single most important interaction in the entire app — prioritize making this reliable over any other polish.

## Technical requirements

- Full working frontend + backend, not a static mockup.
- Real embedding-based similarity (call an actual embedding API or a local embedding model) — do not simulate this with string matching.
- Real unsupervised clustering (Louvain or equivalent) — do not hardcode ring membership.
- Real LLM calls for the classifier and recommendation reasoning steps, with the deterministic fallback logic also implemented and working.
- The app should run and be demoable with zero manual setup beyond providing API keys.

## What NOT to build (explicitly out of scope — do not add these)

- No citizen-facing chatbot or consumer app.
- No counterfeit-currency computer-vision feature.
- No multi-language/12-language support.
- No claims of real-time bank/telecom/NCRB integration — this is a standalone prototype.
- No claim anywhere in the UI of legal or court admissibility.

Build this end to end now, fully wired, fully seeded, and ready to demo.
