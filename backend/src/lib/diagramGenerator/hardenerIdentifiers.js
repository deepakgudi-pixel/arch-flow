import { categorizeTech } from '../tech.js';
import {
  fixNodeCategory,
  VALID_CATEGORIES
} from './hardenerCatalog.js';

export function normalizeIdentifier(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w.+/-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

export function normalizeNodeCategory(category, name) {
  const normalized = String(category || '').trim().toLowerCase();
  if (VALID_CATEGORIES.has(normalized)) {
    const fixed = fixNodeCategory(name);
    if (fixed && fixed !== normalized) {
      return fixed;
    }
    return normalized;
  }

  const fixed = fixNodeCategory(name);
  if (fixed) {
    return fixed;
  }

  return categorizeTech(name || '');
}

export function normalizeEdgeLabel(label) {
  const normalized = normalizeIdentifier(label);
  if (!normalized || normalized === 'CONNECTION' || normalized === 'API' || normalized === 'INFERRING...' || normalized === '') {
    return 'HTTPS';
  }
  return normalized;
}
