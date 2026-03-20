export default function paintLink(link: any, ctx: CanvasRenderingContext2D, globalScale: number): void {
  const src = typeof link.source === 'object' ? link.source : { x: 0, y: 0 };
  const tgt = typeof link.target === 'object' ? link.target : { x: 0, y: 0 };

  if (!src.x && !src.y && !tgt.x && !tgt.y) return; // skip unresolved links

  ctx.beginPath();
  ctx.moveTo(src.x, src.y);
  ctx.lineTo(tgt.x, tgt.y);
  ctx.strokeStyle = 'rgba(129, 140, 248, 0.65)'; // indigo-400 at 65% opacity
  ctx.lineWidth = Math.max(1.5, (link.strength || 1) * 0.8);
  ctx.stroke();

  // Link label at zoom >= 1.0
  if (globalScale >= 1.0 && link.label) {
    const midX = (src.x + tgt.x) / 2;
    const midY = (src.y + tgt.y) / 2;
    const fontSize = Math.max(8, 10 / globalScale);
    ctx.font = `${fontSize}px Inter, Sans-Serif`;
    ctx.fillStyle = 'rgba(199, 210, 254, 0.85)'; // indigo-200
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(link.label, midX, midY);
  }
}