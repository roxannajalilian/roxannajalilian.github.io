export function drawInsightsChart(canvas, metrics) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // background
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.fillRect(0, 0, w, h);

  const labels = Object.keys(metrics);
  const values = Object.values(metrics);

  const pad = 42;
  const chartW = w - pad * 2;
  const chartH = h - pad * 2;

  // grid
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = pad + (chartH * i) / 5;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(pad + chartW, y);
    ctx.stroke();
  }

  // bars
  const gap = 18;
  const barW = (chartW - gap * (labels.length - 1)) / labels.length;

  labels.forEach((label, i) => {
    const v = Math.max(0, Math.min(100, values[i]));
    const x = pad + i * (barW + gap);
    const barH = (chartH * v) / 100;
    const y = pad + chartH - barH;

    // bar
    ctx.fillStyle = "rgba(143,140,255,0.70)";
    roundRect(ctx, x, y, barW, barH, 14);
    ctx.fill();

    // value
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "18px system-ui";
    ctx.fillText(String(Math.round(v)), x + 8, y - 10);

    // label
    ctx.fillStyle = "rgba(255,255,255,0.70)";
    ctx.font = "16px system-ui";
    ctx.fillText(label, x, pad + chartH + 28);
  });

  // title
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "20px system-ui";
  ctx.fillText("Insights (0–100)", pad, 26);
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
