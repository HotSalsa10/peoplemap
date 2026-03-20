// src/components/graph/LinkRenderer.ts

export default function paintLink(link: any, ctx: CanvasRenderingContext2D, globalScale: number): void {
  // Get source and target positions
  const src = typeof link.source === 'object' ? link.source : { x: 0, y: 0 };
  const tgt = typeof link.target === 'object' ? link.target : { x: 0, y: 0 };

  // Draw the line
  ctx.beginPath();
  ctx.moveTo(src.x, src.y);
  ctx.lineTo(tgt.x, tgt.y);
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
  ctx.lineWidth = Math.max(0.5, link.strength * 0.8);
  ctx.stroke();

  // Draw link label only if globalScale >= 1.5
  if (globalScale >= 1.5) {
    const midX = (src.x + tgt.x) / 2;
    const midY = (src.y + tgt.y) / 2;
    ctx.font = `${10 / globalScale}px Sans-Serif`;
    ctx.fillStyle = 'rgba(156, 163, 175, 0.8)';
    ctx.textAlign = 'center';
    ctx.fillText(link.label, midX, midY);
  }
}