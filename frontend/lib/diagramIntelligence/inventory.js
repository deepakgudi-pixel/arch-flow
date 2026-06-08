import { normalizeTechLabel } from './utils';

export function getReplacementCandidates(inventory, category, currentLabel) {
  if (!category) {
    return [];
  }

  const currentName = normalizeTechLabel(currentLabel);
  const builtInItems = inventory?.builtIn?.[category] || [];
  const communityItems = (inventory?.community || []).filter(item => item.category === category);
  const deduped = new Map();

  [...builtInItems, ...communityItems].forEach(item => {
    const normalizedName = normalizeTechLabel(item.name);

    if (!normalizedName || normalizedName === currentName || deduped.has(normalizedName)) {
      return;
    }

    deduped.set(normalizedName, {
      ...item,
      source: builtInItems.includes(item) ? 'BUILT_IN' : 'COMMUNITY'
    });
  });

  return [...deduped.values()].slice(0, 8);
}
