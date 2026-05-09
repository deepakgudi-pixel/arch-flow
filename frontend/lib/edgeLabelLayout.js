const MIN_LABEL_WIDTH = 156;
const MAX_LABEL_WIDTH = 220;
const MIN_LABEL_HEIGHT = 52;
const LABEL_GAP = 14;

const SLOT_OFFSETS = [
  { x: 0, y: 0 },
  { x: 0, y: 72 },
  { x: 0, y: -72 },
  { x: 88, y: 0 },
  { x: -88, y: 0 },
  { x: 88, y: 72 },
  { x: -88, y: 72 },
  { x: 88, y: -72 },
  { x: -88, y: -72 },
  { x: 0, y: 144 },
  { x: 0, y: -144 },
  { x: 176, y: 0 },
  { x: -176, y: 0 }
];

function getDirectionSeed(edgeId) {
  return edgeId
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getEdgeLabelBasePosition({
  edgeId,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected = false
}) {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.max(Math.hypot(dx, dy), 1);
  const normalX = -dy / length;
  const normalY = dx / length;
  const direction = getDirectionSeed(edgeId) % 2 === 0 ? 1 : -1;
  const distance = Math.max(selected ? 28 : 22, Math.min(34, length * 0.12));

  return {
    x: ((sourceX + targetX) / 2) + (normalX * distance * direction),
    y: ((sourceY + targetY) / 2) + (normalY * distance * direction)
  };
}

export function estimateEdgeLabelDimensions({ label, routeText }) {
  const routeLength = (routeText || '').length;
  const labelLength = (label || '').length;
  const estimatedWidth = Math.max(
    MIN_LABEL_WIDTH,
    Math.min(MAX_LABEL_WIDTH, Math.max(routeLength * 4.4, labelLength * 7.1) + 28)
  );
  const routeRows = Math.max(1, Math.ceil(routeLength / 24));
  const labelRows = Math.max(1, Math.ceil(labelLength / 20));
  const estimatedHeight = Math.max(
    MIN_LABEL_HEIGHT,
    18 + (routeRows * 13) + (labelRows * 16)
  );

  return {
    width: estimatedWidth,
    height: estimatedHeight
  };
}

function boxesOverlap(left, right) {
  return (
    Math.abs(left.x - right.x) < ((left.width + right.width) / 2) + LABEL_GAP &&
    Math.abs(left.y - right.y) < ((left.height + right.height) / 2) + LABEL_GAP
  );
}

export function resolveEdgeLabelCollisions(layouts) {
  const placed = [];

  return layouts.map(layout => {
    let resolved = {
      ...layout,
      x: layout.baseX,
      y: layout.baseY,
      shiftX: 0,
      shiftY: 0
    };

    for (const slot of SLOT_OFFSETS) {
      const candidate = {
        ...layout,
        x: layout.baseX + slot.x,
        y: layout.baseY + slot.y,
        shiftX: slot.x,
        shiftY: slot.y
      };

      if (!placed.some(existing => boxesOverlap(candidate, existing))) {
        resolved = candidate;
        break;
      }
    }

    placed.push(resolved);
    return resolved;
  });
}
