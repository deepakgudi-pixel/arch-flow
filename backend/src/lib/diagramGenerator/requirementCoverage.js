const STRONG_DIGITAL_BANKING_MATCHER = /\b(digital bank|digital banking|banking platform|financial institution|double-entry ledger|multi-currency wallet|card authorization|regulatory reporting|pci-dss)\b/i;
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

export function detectRequirementProfile({ description, template } = {}) {
  const context = `${description || ''} ${template || ''}`;
  const bankingSignalCount = DIGITAL_BANKING_SIGNALS
    .filter(matcher => matcher.test(context))
    .length;

  return STRONG_DIGITAL_BANKING_MATCHER.test(context) || bankingSignalCount >= 3
    ? 'digital_banking'
    : null;
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

  return [...genericRequirements, ...bankingRequirements]
    .filter((finding, index, findings) => (
      findings.findIndex(candidate => candidate.title === finding.title) === index
    ));
}
import {
  buildDiagramRequirementText,
  extractPromptRequirements,
  isRequirementCovered
} from './capabilityRequirements.js';
