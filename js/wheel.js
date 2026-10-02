class PrizeWheel {
  constructor(canvas, prizes) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.prizes = prizes;
    this.rotation = 0;
    this.size = 0;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement);
    this.resize();
  }

  resize() {
    const parent = this.canvas.parentElement;
    const width = Math.min(parent.clientWidth, 460);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.size = Math.max(280, width);
    this.canvas.style.width = `${this.size}px`;
    this.canvas.style.height = `${this.size}px`;
    this.canvas.width = Math.round(this.size * dpr);
    this.canvas.height = Math.round(this.size * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    const size = this.size;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 8;
    const slice = (Math.PI * 2) / this.prizes.length;

    ctx.clearRect(0, 0, size, size);

    // Outer shadow ring
    ctx.save();
    ctx.shadowColor = "rgba(51,40,33,0.18)";
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(51,40,33,0.06)";
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    this.prizes.forEach((prize, i) => {
      const start = -Math.PI / 2 + i * slice;
      const end = start + slice;

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();

      // Crochet dashed thread border
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(start) * radius, Math.sin(start) * radius);
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(255,250,243,0.85)";
      ctx.stroke();
      ctx.restore();

      // Text rendering
      ctx.save();
      ctx.rotate(start + slice / 2);

      // Adaptive text position: move closer to center for better segment coverage
      ctx.translate(radius * 0.58, 0);
      ctx.rotate(Math.PI / 2);

      // Base font size from wheel size; reduce further for labels with 3+ words
      const wordCount = prize.name.split(" ").length;
      const baseSize = Math.max(8, Math.min(13, size / 32));
      const baseFontSize = wordCount >= 3 ? Math.max(7, baseSize - 2) : baseSize;

      ctx.font = `800 ${baseFontSize}px 'Inter', system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Subtle text shadow for readability against any segment color
      ctx.shadowColor = "rgba(255,250,243,0.65)";
      ctx.shadowBlur = 2;

      // Auto text color — dark on light segments, light on dark segments
      const isDark = this.isColorDark(prize.color);
      ctx.fillStyle = isDark ? "#fffaf3" : "#332821";

      // Wider maxWidth gives more room for long labels
      const maxWidth = radius * 0.38;
      const lineH = baseFontSize * 1.22;
      this.drawWrappedText(prize.name, 0, 0, maxWidth, lineH);
      ctx.restore();
    });

    // Outer rim solid border
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.lineWidth = 7;
    ctx.strokeStyle = "#fffaf3";
    ctx.shadowColor = "rgba(51,40,33,0.14)";
    ctx.shadowBlur = 8;
    ctx.stroke();

    // Scalloped crochet lace rim
    const scallops = 42;
    const scallopRadius = (Math.PI * 2 * radius) / scallops / 2.2;
    ctx.save();
    ctx.fillStyle = "#fffaf3";
    ctx.shadowColor = "rgba(51,40,33,0.12)";
    ctx.shadowBlur = 4;
    for (let s = 0; s < scallops; s++) {
      const angle = (s / scallops) * Math.PI * 2;
      const sx = Math.cos(angle) * (radius - 2);
      const sy = Math.sin(angle) * (radius - 2);
      ctx.beginPath();
      ctx.arc(sx, sy, scallopRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();



    ctx.restore();
  }

  // Determine if a hex color is perceptually dark
  isColorDark(hex) {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    // Perceived luminance
    return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
  }

  drawWrappedText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (this.ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((item, i) => this.ctx.fillText(item, x, startY + i * lineHeight));
  }

  getTargetRotation(index) {
    const slice = (Math.PI * 2) / this.prizes.length;
    // Pointer is at the top. Center selected segment under it.
    const targetAngle = -(index * slice + slice / 2);
    const current = this.rotation;
    let delta = targetAngle - current;
    delta = ((delta + Math.PI) % (Math.PI * 2)) - Math.PI;
    return current + GAME_SETTINGS.spinsBeforeStop * Math.PI * 2 + delta;
  }

  spinTo(index) {
    return new Promise(resolve => {
      const start = this.rotation;
      const target = this.getTargetRotation(index);
      const duration = GAME_SETTINGS.animationDurationMs;
      const startTime = performance.now();

      const ease = t => 1 - Math.pow(1 - t, 4);

      const frame = now => {
        const progress = Math.min(1, (now - startTime) / duration);
        this.rotation = start + (target - start) * ease(progress);
        this.draw();
        if (progress < 1) requestAnimationFrame(frame);
        else {
          this.rotation = target;
          this.draw();
          resolve();
        }
      };
      requestAnimationFrame(frame);
    });
  }
}
