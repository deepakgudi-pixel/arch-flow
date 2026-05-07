export function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required) {
        if (value === undefined || value === null || value === '') {
          errors.push(`${field} is required`);
          continue;
        }
      } else if (value === undefined || value === null) {
        continue;
      }

      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      } else if (rules.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
        errors.push(`${field} must be a number`);
      } else if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
      } else if (rules.type === 'object' && (typeof value !== 'object' || Array.isArray(value) || value === null)) {
        errors.push(`${field} must be an object`);
      }

      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }

      if (rules.maxLength !== undefined && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }

      if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }

      if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
  };
}
