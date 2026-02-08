/* ════════════════════════════════════════════════════════
   Neural Network Canvas — Hi, AI!
   White neural structure + amber synaptic activity.
   ════════════════════════════════════════════════════════ */

class NeuralNet {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.nodes = [];
    this.pulses = [];
    this.mouse = { x: -1000, y: -1000 };
    this.time = 0;
    this.options = Object.assign(
      {
        count: 50,
        dist: 180,
        speed: 0.2,
        mouseRadius: 220,
        mouseEnabled: false,
        lineOpacity: 0.07,
        nodeOpacity: 0.25,
        pulseRate: 0.005,
        curvature: 0.12,
        hubRatio: 0.15,
        /* Accent color for pulses & hub glows (amber) */
        ar: 245, ag: 158, ab: 11,
      },
      options
    );

    this.resize();
    this.init();
    this.run();

    window.addEventListener('resize', () => this.resize());

    if (this.options.mouseEnabled) {
      canvas.parentElement.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });
      canvas.parentElement.addEventListener('mouseleave', () => {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
      });
    }
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parent = this.canvas.parentElement;
    this.width = parent.offsetWidth;
    this.height = parent.offsetHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  init() {
    this.nodes = [];
    const { count, speed, hubRatio } = this.options;

    for (let i = 0; i < count; i++) {
      const isHub = i < count * hubRatio;
      this.nodes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * speed * (isHub ? 0.4 : 1),
        vy: (Math.random() - 0.5) * speed * (isHub ? 0.4 : 1),
        size: isHub ? 2.2 + Math.random() * 1.3 : 0.6 + Math.random() * 1,
        isHub,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.4 + Math.random() * 0.6,
        flash: 0,
      });
    }
  }

  spawnPulse(a, b) {
    if (this.pulses.length > 30) return;
    a.flash = 1;
    this.pulses.push({
      ax: a.x, ay: a.y,
      bx: b.x, by: b.y,
      t: 0,
      speed: 0.008 + Math.random() * 0.008,
      size: 1.5 + Math.random() * 1,
      targetNode: b,
    });
  }

  run() {
    const { nodes, ctx, options, width, height, mouse, pulses } = this;
    const { ar, ag, ab } = options;
    const accent = `${ar},${ag},${ab}`;

    this.time += 0.016;
    ctx.clearRect(0, 0, width, height);

    /* ── Update nodes ── */
    for (const node of nodes) {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;
      node.x = Math.max(0, Math.min(width, node.x));
      node.y = Math.max(0, Math.min(height, node.y));

      if (options.mouseEnabled) {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const md = Math.sqrt(dx * dx + dy * dy);
        if (md < options.mouseRadius && md > 0) {
          const force = (1 - md / options.mouseRadius) * 0.4;
          node.vx += (dx / md) * force;
          node.vy += (dy / md) * force;
        }
      }

      const maxSpeed = options.speed * (node.isHub ? 1 : 2);
      const spd = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      if (spd > maxSpeed) {
        node.vx = (node.vx / spd) * maxSpeed;
        node.vy = (node.vy / spd) * maxSpeed;
      }

      node.pulse = 0.5 + 0.5 * Math.sin(this.time * node.pulseSpeed + node.pulsePhase);
      node.flash *= 0.9;
    }

    /* ── Draw curved dendrites (white) ── */
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const maxDist = (a.isHub || b.isHub) ? options.dist * 1.25 : options.dist;
        if (dist >= maxDist) continue;

        const proximity = 1 - dist / maxDist;
        const alpha = proximity * proximity * options.lineOpacity;

        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const nx = -(a.y - b.y) * options.curvature;
        const ny = (a.x - b.x) * options.curvature;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(mx + nx, my + ny, b.x, b.y);
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = proximity * (a.isHub && b.isHub ? 1 : 0.7);
        ctx.stroke();

        if (Math.random() < options.pulseRate * proximity && (a.isHub || b.isHub)) {
          this.spawnPulse(a, b);
        }
      }
    }

    /* ── Mouse glow (amber) ── */
    if (options.mouseEnabled && mouse.x > 0 && mouse.y > 0) {
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, options.mouseRadius * 0.7);
      grad.addColorStop(0, `rgba(${accent},0.04)`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, options.mouseRadius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    /* ── Draw synaptic pulses (amber glow + white core) ── */
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += p.speed;
      if (p.t > 1) {
        if (p.targetNode) p.targetNode.flash = 0.7;
        pulses.splice(i, 1);
        continue;
      }

      const mx = (p.ax + p.bx) / 2 + (-(p.ay - p.by)) * options.curvature;
      const my = (p.ay + p.by) / 2 + ((p.ax - p.bx)) * options.curvature;
      const t = p.t;
      const t1 = 1 - t;
      const x = t1 * t1 * p.ax + 2 * t1 * t * mx + t * t * p.bx;
      const y = t1 * t1 * p.ay + 2 * t1 * t * my + t * t * p.by;

      const intensity = Math.sin(t * Math.PI);

      /* Amber glow */
      const pg = ctx.createRadialGradient(x, y, 0, x, y, p.size * 8);
      pg.addColorStop(0, `rgba(${accent},${intensity * 0.15})`);
      pg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(x, y, p.size * 8, 0, Math.PI * 2);
      ctx.fill();

      /* White hot core */
      ctx.beginPath();
      ctx.arc(x, y, p.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${intensity * 0.5})`;
      ctx.fill();
    }

    /* ── Draw neurons ── */
    for (const node of nodes) {
      const md = Math.sqrt((node.x - mouse.x) ** 2 + (node.y - mouse.y) ** 2);
      const mouseBoost = md < options.mouseRadius
        ? (1 - md / options.mouseRadius) * 0.35
        : 0;

      const p = node.pulse;
      const f = node.flash;
      const baseAlpha = options.nodeOpacity * (0.4 + 0.6 * p) + mouseBoost;
      const coreSize = node.size * (0.85 + 0.15 * p + mouseBoost * 0.3);

      /* Hub glow (white, tinged amber on flash) */
      if (node.isHub || f > 0.1) {
        const glowR = (node.isHub ? 8 : 5) * (0.6 + 0.4 * p) + f * 6;
        const glowColor = f > 0.2 ? accent : '255,255,255';
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowR);
        grad.addColorStop(0, `rgba(${glowColor},${(baseAlpha + f * 0.3) * 0.2})`);
        grad.addColorStop(0.5, `rgba(${glowColor},${(baseAlpha + f * 0.15) * 0.05})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Neuron body (white normally, amber on flash) */
      const bodyColor = f > 0.2 ? accent : '255,255,255';
      ctx.beginPath();
      ctx.arc(node.x, node.y, coreSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${bodyColor},${Math.min(baseAlpha + f * 0.3, 0.7)})`;
      ctx.fill();

      /* Flash ring */
      if (f > 0.15) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, coreSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent},${f * 0.1})`;
        ctx.fill();
      }
    }

    requestAnimationFrame(() => this.run());
  }
}

/* ── Initialize ── */

(function () {
  const heroCanvas = document.getElementById('neuralHero');
  if (heroCanvas) {
    new NeuralNet(heroCanvas, {
      count: 55,
      dist: 180,
      speed: 0.18,
      mouseEnabled: true,
      mouseRadius: 240,
      lineOpacity: 0.06,
      nodeOpacity: 0.22,
      pulseRate: 0.005,
      curvature: 0.12,
      hubRatio: 0.15,
    });
  }

  const ecoCanvas = document.getElementById('neuralEco');
  if (ecoCanvas) {
    new NeuralNet(ecoCanvas, {
      count: 30,
      dist: 160,
      speed: 0.12,
      lineOpacity: 0.04,
      nodeOpacity: 0.15,
      pulseRate: 0.004,
      curvature: 0.15,
      hubRatio: 0.12,
    });
  }

  const ctaCanvas = document.getElementById('neuralCta');
  if (ctaCanvas) {
    new NeuralNet(ctaCanvas, {
      count: 25,
      dist: 150,
      speed: 0.12,
      lineOpacity: 0.05,
      nodeOpacity: 0.18,
      pulseRate: 0.005,
      curvature: 0.14,
      hubRatio: 0.15,
    });
  }
})();
