# Regulatory & Compliance (Phase 6)

Neuro-Recover’s long-term roadmap includes **FDA / MHRA clinical device** (spec §10). This document is a non-exhaustive placeholder for regulatory considerations.

## Disclaimer

This app is **not** currently a regulated medical device. It is for **research, development, and demonstration** only. Do not use it as the sole basis for clinical decisions. Consult regulatory and legal advisors before any commercial or clinical use.

## Possible regulatory paths

### FDA (US)

- **Class I / II medical device**: If the product is intended to diagnose, treat, or monitor a disease/condition (e.g. stroke rehabilitation), it may be subject to FDA device regulation.
- **Software as a Medical Device (SaMD)**: FDA has guidance on clinical decision support and SaMD; classification depends on intended use and risk.
- **Steps**: Determine device class; establish quality system (e.g. 21 CFR 820); prepare 510(k) or PMA if required; comply with labelling and post-market obligations.

### MHRA (UK)

- **UKCA / CE marking**: If placed on the UK (and/or EU) market as a medical device, conformity with UK and/or EU regulations is required.
- **MDR (EU)**: Software for rehabilitation may fall under Regulation (EU) 2017/745; classification under Rule 11 or similar.
- **Steps**: Classify device; implement QMS; prepare technical documentation; obtain conformity assessment; register and maintain vigilance.

## Good practices (development phase)

- **Documentation**: Keep design and risk documentation (e.g. intended use, user needs, risk analysis).
- **Validation**: Plan validation of performance (e.g. hand-tracking accuracy, correlation with clinical outcomes) when moving toward clinical use.
- **Data & privacy**: Comply with GDPR, HIPAA (if applicable), and local data protection law; document data flows and consent.
- **Labelling**: Clearly state intended use, limitations, and “for research/demo only” where appropriate.
- **Adverse events**: Define a process for collecting and reporting adverse events if the product is used in a clinical context.

## References

- FDA: [Device Classification](https://www.fda.gov/medical-devices/classify-your-medical-device/device-classification)
- FDA: [Clinical Decision Support Software](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software)
- MHRA: [Medical devices](https://www.gov.uk/guidance/medical-devices-regulation)
- EU MDR: [Regulation (EU) 2017/745](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32017R0745)
