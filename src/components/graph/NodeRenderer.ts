export default function paintNode(node: any, ctx: CanvasRenderingContext2D, globalScale: number): void {
  // Draw filled circle
  const radius = Math.sqrt(Math.max(0, node.val)) * 4;
  ctx.beginPath();
  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = node.color;
  ctx.fill();

  // Level-of-detail label rendering
  let shouldDrawLabel = false;
  if (globalScale >= 1.5) {
    shouldDrawLabel = true;
  } else if (globalScale >= 0.5 && node.val >= 3) {
    shouldDrawLabel = true;
  }

  if (shouldDrawLabel) {
    // Label rendering
    const label = node.nickname || node.name;
    const fontSize = Math.max(8, 12 / globalScale);
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f3f4f6';
    ctx.fillText(label, node.x, node.y + radius + fontSize * 0.8);
  }
}