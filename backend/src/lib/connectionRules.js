export {
  canonicalConnectionRules,
  canonicalConnectionRuleObjects,
  connectionRuleTupleToObject
} from '../../../shared/connectionRules.js';

import { canonicalConnectionRules } from '../../../shared/connectionRules.js';

export async function syncCanonicalConnectionRules(pool) {
  for (const [sourceCategory, targetCategory, isValid, warningMessage] of canonicalConnectionRules) {
    await pool.query(
      `INSERT INTO connection_rules (source_category, target_category, is_valid, warning_message)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (source_category, target_category)
       DO UPDATE SET
         is_valid = EXCLUDED.is_valid,
         warning_message = EXCLUDED.warning_message`,
      [sourceCategory, targetCategory, isValid, warningMessage]
    );
  }
}
