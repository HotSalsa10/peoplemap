import type { ClusterData } from '../../db/types';

interface NodePos {
  id: number;
  x: number;
  y: number;
}

function cross(o: NodePos, a: NodePos, b: NodePos): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function convexHull(points: NodePos[]): NodePos[] {
  if (points.length < 3) return points;
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const lower: NodePos[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: NodePos[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

function expandHull(hull: NodePos[], padding: number): NodePos[] {
  if (hull.length === 0) return hull;
  const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
  return hull.map(p => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return { id: p.id, x: p.x + (dx / dist) * padding, y: p.y + (dy / dist) * padding };
  });
}

export function paintClusters(
  clusters: ClusterData[],
  nodes: any[], // react-force-graph nodes with x, y resolved
  ctx: CanvasRenderingContext2D
): void {
  const nodeMap = new Map<number, { x: number; y: number }>();
  for (const n of nodes) {
    if (n.x !== undefined && n.y !== undefined) {
      nodeMap.set(n.id as number, { x: n.x as number, y: n.y as number });
    }
  }

  // Draw parent clusters first (larger, more transparent), then subclusters
  const parents = clusters.filter(c => c.parentTag === null);
  const children = clusters.filter(c => c.parentTag !== null);

  for (const cluster of [...parents, ...children]) {
    const isChild = cluster.parentTag !== null;
    const padding = isChild ? 22 : 40;
    const fillOpacity = isChild ? 0.12 : 0.07;
    const strokeOpacity = isChild ? 0.3 : 0.2;
    const color = isChild ? cluster.lighterColor : cluster.color;

    const points: NodePos[] = cluster.nodeIds
      .map(id => {
        const pos = nodeMap.get(id);
        return pos ? { id, x: pos.x, y: pos.y } : null;
      })
      .filter((p): p is NodePos => p !== null);

    if (points.length === 0) continue;

    let hull = convexHull(points);
    if (hull.length < 3 && points.length >= 1) {
      // Fewer than 3 points — draw a circle instead
      const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
      const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
      ctx.beginPath();
      ctx.arc(cx, cy, padding + 20, 0, 2 * Math.PI);
      ctx.fillStyle = color + Math.round(fillOpacity * 255).toString(16).padStart(2, '0');
      ctx.fill();
      ctx.strokeStyle = color + Math.round(strokeOpacity * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      hull = expandHull(hull, padding);
      ctx.beginPath();
      ctx.moveTo(hull[0].x, hull[0].y);
      for (let i = 1; i < hull.length; i++) ctx.lineTo(hull[i].x, hull[i].y);
      ctx.closePath();
      ctx.fillStyle = color + Math.round(fillOpacity * 255).toString(16).padStart(2, '0');
      ctx.fill();
      ctx.strokeStyle = color + Math.round(strokeOpacity * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Cluster label
    const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
    const cy = Math.min(...points.map(p => p.y)) - padding - 6;
    ctx.font = `bold ${isChild ? 9 : 11}px Inter, Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = color + 'cc';
    ctx.fillText(cluster.tag, cx, cy);
  }
}
