import { normalizeTechLabel } from './utils';

export function getReplacementCandidates(inventory, category, currentLabel) {
  if (!category) {
    return [];
  }

  const currentName = normalizeTechLabel(currentLabel);
  const builtInItems = inventory?.builtIn?.[category] || [];
  const generatedItems = (inventory?.custom || []).filter(item => item.category === category);
  const deduped = new Map();

  [...builtInItems, ...generatedItems].forEach(item => {
    const normalizedName = normalizeTechLabel(item.name);

    if (!normalizedName || normalizedName === currentName || deduped.has(normalizedName)) {
      return;
    }

    deduped.set(normalizedName, {
      ...item,
      source: builtInItems.includes(item) ? 'BUILT-IN' : 'AI-GENERATED'
    });
  });

  return [...deduped.values()].slice(0, 8);
}
