export default function paintNode(node: any, ctx: CanvasRenderingContext2D, globalScale: number): void {
  const x: number = node.x;
  const y: number = node.y;
  const radius = Math.sqrt(Math.max(0, node.val)) * 4 * (node.isMe ? 1.5 : 1);

  // Glow halo (tighter to reduce bleed between nearby nodes)
  const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 1.8);
  gradient.addColorStop(0, node.color + '99');
  gradient.addColorStop(1, node.color + '00');
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.8, 0, 2 * Math.PI);
  ctx.fillStyle = gradient;
  ctx.fill();

  // "Me" outer ring
  if (node.isMe) {
    ctx.beginPath();
    ctx.arc(x, y, radius + 3, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Node circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = node.color;
  ctx.fill();

  // Labels: always visible but hidden at very low zoom to avoid screen-space overlap
  if (globalScale < 0.25) return;
  const label = node.nickname || node.name;
  const fontSize = Math.max(10, 13 / globalScale);
  ctx.font = `${fontSize}px Inter, Sans-Serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Label shadow for readability
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillText(label, x + 0.5, y + radius + 3.5);
  ctx.fillStyle = '#f3f4f6';
  ctx.fillText(label, x, y + radius + 3);
}