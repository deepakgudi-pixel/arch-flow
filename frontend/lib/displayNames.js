const CATEGORY_SUFFIX_PATTERNS = {
  frontend: [
    ['frontend'],
    ['web', 'app'],
    ['webapp'],
    ['client'],
    ['ui']
  ],
  backend: [
    ['backend'],
    ['service'],
    ['api', 'service'],
    ['api']
  ],
  database: [
    ['database'],
    ['db'],
    ['datastore']
  ],
  mobile: [
    ['mobile'],
    ['app']
  ],
  auth: [
    ['auth'],
    ['identity', 'provider'],
    ['idp']
  ],
  queue: [
    ['queue'],
    ['broker'],
    ['event', 'bus'],
    ['stream']
  ],
  storage: [
    ['storage'],
    ['bucket'],
    ['blob', 'store'],
    ['blob']
  ],
  external: [
    ['external'],
    ['integration']
  ],
  devops: [
    ['devops'],
    ['ops']
  ]
};

function splitLabel(label) {
  return String(label || '')
    .trim()
    .split(/[_\-\s]+/)
    .filter(Boolean);
}

function endsWithPattern(tokens, pattern) {
  if (tokens.length < pattern.length) {
    return false;
  }

  return pattern.every((part, index) => (
    tokens[tokens.length - pattern.length + index].toLowerCase() === part
  ));
}

export function formatTechDisplayLabel(label, category) {
  const rawTokens = splitLabel(label);

  if (rawTokens.length === 0) {
    return '';
  }

  const suffixPatterns = CATEGORY_SUFFIX_PATTERNS[category] || [];
  const tokens = [...rawTokens];

  let changed = true;

  while (changed && tokens.length > 1) {
    changed = false;

    for (const pattern of suffixPatterns) {
      if (!endsWithPattern(tokens, pattern) || tokens.length === pattern.length) {
        continue;
      }

      tokens.splice(tokens.length - pattern.length, pattern.length);
      changed = true;
      break;
    }
  }

  return tokens.join(' ');
}

export default formatTechDisplayLabel;
