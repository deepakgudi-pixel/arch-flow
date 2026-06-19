const STRONG_DIGITAL_BANKING_MATCHER = /\b(digital bank|digital banking|banking platform|financial institution|double-entry ledger|multi-currency wallet|card authorization|regulatory reporting|pci-dss)\b/i;
const STRONG_HEALTHCARE_MATCHER = /\b(healthcare operations|hospital networks?|electronic health records?|ehr access|lab order workflows?|prior authorization|claims processing|hipaa|offline clinic workflows?)\b/i;
const DIGITAL_BANKING_SIGNALS = [
  /\bwallets?\b/i,
  /\bledger\b/i,
  /\bbank transfers?\b/i,
  /\bcard authorization\b/i,
  /\bcompliance screening\b/i,
  /\breconciliation\b/i,
  /\bregulatory reporting\b/i,
  /\bdata residency\b/i,
  /\bpci(?:-dss)?\b/i
];
const HEALTHCARE_SIGNALS = [
  /\bpatient\b/i,
  /\b(clinician|doctor)\b/i,
  /\b(electronic health records?|ehr)\b/i,
  /\b(lab orders?|lab results?)\b/i,
  /\b(prescriptions?|e-prescriptions?)\b/i,
  /\bclaims?\b/i,
  /\bprior authorization\b/i,
  /\bhipaa\b/i,
  /\b(pharmacies?|insurers?)\b/i,
  /\boffline clinic workflows?\b/i
];

const DIGITAL_BANKING_REQUIREMENTS = [
  ['IDENTITY_AND_MFA', 'identity verification and MFA', /\b(identity|kyc|mfa|keycloak|oauth)\b/i],
  ['CUSTOMER_PROFILES', 'customer profiles', /\bcustomer profile\b/i],
  ['MULTI_CURRENCY_WALLETS', 'multi-currency wallets', /\b(multi-currency|wallet)\b/i],
  ['DOUBLE_ENTRY_LEDGER', 'a double-entry ledger', /\b(double-entry|ledger service|ledger database)\b/i],
  ['CARD_AUTHORIZATION', 'card authorization', /\bcard authorization\b/i],
  ['BANK_TRANSFERS', 'bank transfers', /\b(bank transfer|ach|sepa|bank rails)\b/i],
  ['PAYMENT_PROCESSING', 'payment processing', /\b(payment orchestration|payment processor)\b/i],
  ['FRAUD_DETECTION', 'realtime fraud detection', /\b(realtime fraud|fraud engine|risk scoring)\b/i],
  ['COMPLIANCE_SCREENING', 'compliance screening', /\b(compliance screening|aml|sanctions)\b/i],
  ['DISPUTE_HANDLING', 'dispute handling', /\b(dispute|chargeback)\b/i],
  ['RECONCILIATION', 'reconciliation', /\breconciliation\b/i],
  ['SCHEDULED_PAYMENTS', 'scheduled payments', /\bscheduled payments?\b/i],
  ['NOTIFICATIONS', 'customer notifications', /\b(notification|transactional delivery)\b/i],
  ['IMMUTABLE_AUDIT', 'immutable audit logging', /\b(immutable audit|tamper-evident|worm retention)\b/i],
  ['REGULATORY_REPORTING', 'regulatory reporting', /\b(regulatory reporting|jurisdiction reports)\b/i],
  ['CUSTOMER_SUPPORT', 'customer support workflows', /\b(customer support|support case|operations console)\b/i],
  ['IDEMPOTENT_WRITES', 'idempotent writes', /\bidempotenc(y|t)\b/i],
  ['RATE_LIMITING', 'rate limiting', /\brate[- ]limit\b/i],
  ['DEAD_LETTER_RECOVERY', 'dead-letter recovery', /\b(dead-letter|failed event replay)\b/i],
  ['ACTIVE_ACTIVE_REGIONS', 'active-active regional deployment', /\bactive-active\b/i],
  ['DATA_RESIDENCY', 'data residency controls', /\bdata residency\b/i],
  ['DISASTER_RECOVERY', 'regional failover and disaster recovery', /\b(failover|disaster recovery)\b/i],
  ['ENCRYPTION_CONTROLS', 'encryption and secrets controls', /\b(encryption|secrets control|vault)\b/i],
  ['PCI_GDPR_CONTROLS', 'PCI-DSS and GDPR controls', /\b(pci|gdpr)\b/i],
  ['ZERO_DOWNTIME_DELIVERY', 'zero-downtime delivery', /\bzero-downtime\b/i],
  ['OBSERVABILITY', 'metrics, alerting, and dashboards', /\b(metrics and alerting|operations dashboards|observability)\b/i]
];

function buildHealthcareRequirements({ description, template } = {}) {
  const context = `${description || ''} ${template || ''}`;
  const requirements = [];
  const addRequirement = (id, label, matcher, coverage) => {
    if (matcher.test(context)) {
      requirements.push([id, label, coverage]);
    }
  };

  addRequirement(
    'PATIENT_AND_CLINICIAN_SURFACES',
    'patient and clinician application surfaces',
    /\b(patient|clinician|doctor)\b/i,
    /\b(patient mobile app|clinician mobile app|care operations portal|patient portal|clinician workflows)\b/i
  );
  addRequirement(
    'APPOINTMENTS',
    'appointment scheduling',
    /\b(appointment scheduling|appointments?)\b/i,
    /\b(appointment scheduling|appointments?)\b/i
  );
  addRequirement(
    'EHR_ACCESS',
    'EHR access workflows',
    /\b(electronic health records?|ehr access|ehr)\b/i,
    /\b(ehr access|fhir|hospital ehr)\b/i
  );
  addRequirement(
    'LAB_WORKFLOWS',
    'lab order workflows',
    /\b(lab order workflows?|lab orders?|lab results?)\b/i,
    /\b(lab order workflow|lab network|lab orders?|lab results?)\b/i
  );
  addRequirement(
    'PRESCRIPTION_ROUTING',
    'prescription routing',
    /\b(prescription routing|e-prescriptions?|prescriptions?)\b/i,
    /\b(prescription routing|pharmacy fulfillment|e-prescriptions?)\b/i
  );
  addRequirement(
    'CLAIMS_PROCESSING',
    'claims processing',
    /\b(claims processing|claims?)\b/i,
    /\b(claims processing|payer claims|claim creation)\b/i
  );
  addRequirement(
    'PRIOR_AUTHORIZATION',
    'prior authorization',
    /\bprior authorization\b/i,
    /\bprior authorization|payer approvals?\b/i
  );
  addRequirement(
    'CONSENT_AND_HIPAA',
    'HIPAA-style consent and audit boundaries',
    /\b(consent|hipaa|phi|audit logs?|audit trail)\b/i,
    /\b(consent management|clinical identity and mfa|immutable audit log|phi encryption|tamper-evident phi access history)\b/i
  );
  addRequirement(
    'OFFLINE_CLINIC_SYNC',
    'offline clinic workflows',
    /\b(offline clinic workflows?|offline workflows?)\b/i,
    /\b(offline clinic sync|store and forward)\b/i
  );
  addRequirement(
    'HEALTHCARE_PARTNERS',
    'lab, insurer, pharmacy, and hospital integrations',
    /\b(hospital networks?|labs?|insurers?|pharmacies?)\b/i,
    /\b(hospital ehr network|lab network|insurance exchange|pharmacy network)\b/i
  );
  addRequirement(
    'ASYNC_RECOVERY',
    'asynchronous workflow recovery',
    /\b(async|asynchronous|retries|dead-letter|dlq)\b/i,
    /\b(clinical workflow stream|dead-letter|retry and recovery)\b/i
  );
  addRequirement(
    'ENCRYPTED_STORAGE',
    'encrypted PHI storage',
    /\b(encrypted|image storage|document storage|documents?|phi)\b/i,
    /\b(encrypted phi storage|immutable audit archive|vault)\b/i
  );
  addRequirement(
    'OBSERVABILITY',
    'operational monitoring',
    /\b(observability|operations monitoring|monitoring|alerting)\b/i,
    /\b(metrics and alerting|clinical ops dashboards|prometheus|grafana)\b/i
  );

  return requirements;
}

export function detectRequirementProfile({ description, template } = {}) {
  const context = `${description || ''} ${template || ''}`;
  const bankingSignalCount = DIGITAL_BANKING_SIGNALS
    .filter(matcher => matcher.test(context))
    .length;
  const healthcareSignalCount = HEALTHCARE_SIGNALS
    .filter(matcher => matcher.test(context))
    .length;

  if (STRONG_DIGITAL_BANKING_MATCHER.test(context) || bankingSignalCount >= 3) {
    return 'digital_banking';
  }

  if (STRONG_HEALTHCARE_MATCHER.test(context) || healthcareSignalCount >= 4) {
    return 'healthcare_operations';
  }

  return null;
}

export function reviewRequirementCoverage(diagram, context = {}) {
  const diagramText = buildDiagramRequirementText(diagram);
  const genericRequirements = extractPromptRequirements(context)
    .filter(requirement => !isRequirementCovered(diagramText, requirement))
    .map(requirement => ({
      severity: 'warning',
      title: `MISSING_REQUIRED_${requirement.id}`,
      detail: `The generated architecture does not explicitly model ${requirement.label} requested by the prompt.`
    }));
  const bankingRequirements = detectRequirementProfile(context) === 'digital_banking'
    ? DIGITAL_BANKING_REQUIREMENTS
        .filter(([, , matcher]) => !matcher.test(diagramText))
        .map(([id, label]) => ({
          severity: 'warning',
          title: `MISSING_REQUIRED_${id}`,
          detail: `The generated architecture does not explicitly model ${label} requested by the prompt.`
        }))
    : [];
  const healthcareRequirements = detectRequirementProfile(context) === 'healthcare_operations'
    ? buildHealthcareRequirements(context)
        .filter(([, , matcher]) => !matcher.test(diagramText))
        .map(([id, label]) => ({
          severity: 'warning',
          title: `MISSING_REQUIRED_${id}`,
          detail: `The generated architecture does not explicitly model ${label} requested by the prompt.`
        }))
    : [];

  return [...genericRequirements, ...bankingRequirements, ...healthcareRequirements]
    .filter((finding, index, findings) => (
      findings.findIndex(candidate => candidate.title === finding.title) === index
    ));
}
import {
  buildDiagramRequirementText,
  extractPromptRequirements,
  isRequirementCovered
} from './capabilityRequirements.js';
