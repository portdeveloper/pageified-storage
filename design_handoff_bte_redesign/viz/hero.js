// Hero: end-to-end pipeline — users → mempool → builder → committee → block
(function () {
  const root = document.getElementById('hero-root');
  root.innerHTML = `
    <section style="min-height: 92vh; display: flex; align-items: center; padding-top: 120px;">
      <div class="wrap reveal" id="hero-reveal" style="width: 100%;">
        <div style="display: grid; grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); gap: 64px; align-items: center;" class="hero-grid">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 8px; font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--solution-accent); background: var(--solution-accent-light); padding: 5px 10px; border-radius: 999px; margin-bottom: 20px; font-weight: 600;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--solution-accent); display:inline-block;"></span>
              Category Labs research
            </div>
            <h1 style="margin-bottom: 20px;">
              <span style="display:block; font-weight: 300; color: var(--text-secondary); margin-bottom: 6px;">BTX</span>
              <span style="display:block; font-weight: 600; color: var(--solution-accent);">Batched Threshold Encryption</span>
            </h1>
            <p class="lede" style="margin-bottom: 20px;">
              A committee of servers decrypts any chosen subset of ciphertexts while the rest stay private — the key primitive for encrypted mempools that stop MEV.
            </p>
            <p style="font-family: var(--mono); font-size: 13px; color: var(--solution-accent); line-height: 1.6; margin-bottom: 28px;">
              Shortest ciphertext. Collision-free. Epochless.<br/>Fast enough for real block times.
            </p>
            <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap;">
              <a class="btn" href="#">Read the paper (PDF)
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </a>
              <a href="#problem-root" style="font-family: var(--mono); font-size: 12px; color: var(--text-secondary); text-decoration: none;">Or read the explainer ↓</a>
            </div>
          </div>

          <!-- Animated pipeline -->
          <div id="pipeline" style="background: var(--surface-elevated); border: 1px solid var(--border); border-radius: 16px; padding: 22px; box-shadow: 0 30px 60px -40px rgba(26,23,20,0.18);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <p style="font-family: var(--mono); font-size: 10px; color: var(--text-tertiary); letter-spacing: 0.12em; text-transform: uppercase; margin: 0;">Encrypted mempool · end-to-end</p>
              <span id="phase-chip" style="font-family: var(--mono); font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 999px; transition: all 0.35s;"></span>
            </div>

            <svg id="pipeline-svg" viewBox="0 0 560 340" style="width:100%; height:auto; display:block;">
              <defs>
                <linearGradient id="flowGrad" x1="0" x2="1">
                  <stop offset="0" stop-color="#2a7d6a" stop-opacity="0"/>
                  <stop offset="0.5" stop-color="#2a7d6a" stop-opacity="0.6"/>
                  <stop offset="1" stop-color="#2a7d6a" stop-opacity="0"/>
                </linearGradient>
              </defs>

              <!-- lane labels -->
              <g font-family="var(--mono)" font-size="9" fill="#8a7d6f" letter-spacing="1.2">
                <text x="40" y="18" text-anchor="middle">USERS</text>
                <text x="220" y="18" text-anchor="middle">MEMPOOL</text>
                <text x="380" y="18" text-anchor="middle">COMMITTEE</text>
                <text x="520" y="18" text-anchor="middle">BLOCK</text>
              </g>

              <!-- user pool -->
              <g id="user-pool"></g>

              <!-- mempool box -->
              <g>
                <rect x="140" y="40" width="160" height="260" rx="10" fill="#f8f6f3" stroke="#e2ddd7"/>
                <text x="220" y="58" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="#8a7d6f" letter-spacing="0.8">ciphertexts</text>
                <g id="mempool-cells"></g>
                <!-- builder highlight bracket -->
                <g id="builder-bracket" opacity="0">
                  <rect x="145" y="66" width="150" height="3" fill="#c4653a"/>
                  <text x="220" y="80" text-anchor="middle" font-family="var(--mono)" font-size="9" font-weight="600" fill="#b05226">builder picks batch</text>
                </g>
              </g>

              <!-- flow arrow 1 -->
              <line x1="300" y1="170" x2="340" y2="170" stroke="#e2ddd7" stroke-width="1.5"/>
              <polygon points="340,170 334,166 334,174" fill="#e2ddd7"/>

              <!-- committee -->
              <g transform="translate(380 170)">
                <circle r="55" fill="#ffffff" stroke="#e2ddd7" stroke-dasharray="3 3"/>
                <text x="0" y="-65" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="#8a7d6f">threshold t+1 of N</text>
                <g id="committee-servers"></g>
                <text id="committee-count" x="0" y="4" text-anchor="middle" font-family="var(--mono)" font-size="13" font-weight="600" fill="#2a7d6a">5</text>
                <text x="0" y="18" text-anchor="middle" font-family="var(--mono)" font-size="8" fill="#8a7d6f">servers</text>
              </g>

              <!-- flow arrow 2 -->
              <line x1="440" y1="170" x2="480" y2="170" stroke="#e2ddd7" stroke-width="1.5"/>
              <polygon points="480,170 474,166 474,174" fill="#e2ddd7"/>

              <!-- block box -->
              <g>
                <rect x="480" y="70" width="80" height="200" rx="10" fill="#f0f7f5" stroke="#c8e6df"/>
                <text x="520" y="88" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="#2a7d6a" font-weight="600">BLOCK N</text>
                <g id="block-cells"></g>
              </g>

              <!-- flying particles -->
              <g id="particles"></g>
            </svg>

            <div style="display: flex; justify-content: space-between; margin-top: 14px; font-family: var(--mono); font-size: 10px; color: var(--text-tertiary);">
              <div>
                <span id="revealed-count" style="color: var(--solution-accent); font-weight: 600;">0</span> revealed
                <span style="margin: 0 6px;">·</span>
                <span id="private-count">0</span> stay private
              </div>
              <div style="display: flex; gap: 14px;">
                <span><span style="display:inline-block; width:8px; height:8px; background:#e2ddd7; border-radius:2px; margin-right:4px;"></span>encrypted</span>
                <span><span style="display:inline-block; width:8px; height:8px; background:#f0d9c8; border-radius:2px; margin-right:4px;"></span>selected</span>
                <span><span style="display:inline-block; width:8px; height:8px; background:#c8e6df; border-radius:2px; margin-right:4px;"></span>decrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <style>
      @media (max-width: 820px) { .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
    </style>
  `;

  registerReveal(document.getElementById('hero-reveal'));

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svg = (name, attrs = {}) => {
    const el = document.createElementNS(SVG_NS, name);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

  // build user pool (3 stacked figures on the left)
  const userPool = document.getElementById('user-pool');
  [60, 140, 220].forEach((y, i) => {
    const g = svg('g', { transform: `translate(40 ${y})`, id: 'user-' + i });
    const c = svg('circle', { r: 9, fill: '#edf3fc', stroke: '#3b7dd8', 'stroke-width': 1.2 });
    const t = svg('text', { x: 0, y: 3, 'text-anchor': 'middle', 'font-family': 'var(--mono)', 'font-size': 9, fill: '#3b7dd8', 'font-weight': 600 });
    t.textContent = ['A', 'B', 'C'][i];
    g.appendChild(c); g.appendChild(t);
    userPool.appendChild(g);
  });

  // build mempool cells (6 cols × 8 rows)
  const MP_COLS = 6, MP_ROWS = 8, CELL = 22, GAP = 2;
  const mempoolCells = document.getElementById('mempool-cells');
  const cells = [];
  for (let r = 0; r < MP_ROWS; r++) {
    for (let c = 0; c < MP_COLS; c++) {
      const x = 150 + c * (CELL + GAP);
      const y = 70 + r * (CELL + GAP);
      const rect = svg('rect', { x, y, width: CELL, height: CELL, rx: 3, fill: '#e2ddd7' });
      rect.style.transition = 'fill 0.35s, transform 0.35s';
      mempoolCells.appendChild(rect);
      cells.push({ rect, x, y });
    }
  }

  // committee servers
  const commG = document.getElementById('committee-servers');
  const committeeDots = [];
  function rebuildCommittee(N) {
    commG.innerHTML = '';
    committeeDots.length = 0;
    for (let i = 0; i < N; i++) {
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
      const cx = Math.cos(angle) * 40;
      const cy = Math.sin(angle) * 40;
      const c = svg('circle', { cx, cy, r: 5, fill: '#c8e6df', stroke: '#2a7d6a', 'stroke-width': 1.2 });
      c.style.transition = 'fill 0.3s, r 0.3s';
      commG.appendChild(c);
      committeeDots.push(c);
    }
    document.getElementById('committee-count').textContent = N;
  }
  rebuildCommittee(5);

  // block cells
  const blockG = document.getElementById('block-cells');
  const blockSlots = [];
  function rebuildBlock(count) {
    blockG.innerHTML = '';
    blockSlots.length = 0;
    const rows = Math.min(count, 10);
    for (let i = 0; i < rows; i++) {
      const r = svg('rect', { x: 490, y: 96 + i * 16, width: 60, height: 12, rx: 2, fill: '#c8e6df', opacity: 0 });
      r.style.transition = 'opacity 0.4s';
      blockG.appendChild(r);
      blockSlots.push(r);
    }
  }

  // phase chip
  const phaseChip = document.getElementById('phase-chip');
  const revealedEl = document.getElementById('revealed-count');
  const privateEl = document.getElementById('private-count');
  const builderBracket = document.getElementById('builder-bracket');
  const particles = document.getElementById('particles');

  const PHASES = [
    { key: 'encrypt', label: 'users encrypt', color: '#3b7dd8' },
    { key: 'select', label: 'builder picks batch', color: '#c4653a' },
    { key: 'decrypt', label: 'committee opens', color: '#2a7d6a' },
    { key: 'done', label: 'block executes', color: '#2a7d6a' },
  ];

  function setPhase(p) {
    phaseChip.textContent = p.label;
    phaseChip.style.color = p.color;
    phaseChip.style.background = p.color + '18';
  }

  let selected = new Set();
  function selectBatch() {
    selected = new Set();
    const target = Math.floor(MP_COLS * MP_ROWS * 0.4);
    while (selected.size < target) selected.add(Math.floor(Math.random() * MP_COLS * MP_ROWS));
  }

  function resetMempool() {
    cells.forEach(c => { c.rect.setAttribute('fill', '#e2ddd7'); c.rect.setAttribute('transform', ''); });
    blockSlots.forEach(s => s.setAttribute('opacity', 0));
    committeeDots.forEach(d => { d.setAttribute('fill', '#c8e6df'); d.setAttribute('r', 5); });
    builderBracket.setAttribute('opacity', 0);
    particles.innerHTML = '';
    revealedEl.textContent = '0';
    privateEl.textContent = '0';
  }

  function fireParticle(fromX, fromY, toX, toY, color, duration) {
    const dot = svg('circle', { cx: fromX, cy: fromY, r: 2.5, fill: color, opacity: 0.9 });
    particles.appendChild(dot);
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      dot.setAttribute('cx', fromX + (toX - fromX) * e);
      dot.setAttribute('cy', fromY + (toY - fromY) * e);
      dot.setAttribute('opacity', 0.9 * (1 - t));
      if (t < 1) requestAnimationFrame(step);
      else dot.remove();
    }
    requestAnimationFrame(step);
  }

  async function cycle() {
    const speed = window.__bte.speed;
    const d = (ms) => new Promise(r => setTimeout(r, ms / speed));
    resetMempool();
    selectBatch();
    rebuildBlock(selected.size);

    // phase 1: users encrypt → ciphertexts arrive
    setPhase(PHASES[0]);
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const user = i % 3;
      const userX = 40, userY = 60 + user * 80;
      fireParticle(userX, userY, cell.x + CELL / 2, cell.y + CELL / 2, '#3b7dd8', 500);
      setTimeout(() => {
        cell.rect.setAttribute('fill', '#d6cfc5');
      }, 500 / speed);
      if (i % 4 === 0) await d(40);
    }
    await d(800);

    // phase 2: builder selects
    setPhase(PHASES[1]);
    builderBracket.setAttribute('opacity', 1);
    cells.forEach((cell, i) => {
      if (selected.has(i)) {
        setTimeout(() => {
          cell.rect.setAttribute('fill', '#f0d9c8');
        }, (i % 8) * 20 / speed);
      }
    });
    await d(1100);

    // phase 3: committee emits shares
    setPhase(PHASES[2]);
    const cx = 380, cy = 170;
    committeeDots.forEach((dot, i) => {
      setTimeout(() => {
        dot.setAttribute('fill', '#2a7d6a');
        dot.setAttribute('r', 6);
        const dx = Number(dot.getAttribute('cx')) + cx;
        const dy = Number(dot.getAttribute('cy')) + cy;
        fireParticle(dx, dy, cx, cy, '#2a7d6a', 400);
      }, i * 80 / speed);
    });
    await d(700);

    // decryptions ripple
    let revealedN = 0;
    const selArr = [...selected];
    for (const idx of selArr) {
      const cell = cells[idx];
      fireParticle(cx, cy, cell.x + CELL / 2, cell.y + CELL / 2, '#2a7d6a', 300);
      setTimeout(() => {
        cell.rect.setAttribute('fill', '#c8e6df');
        revealedN++;
        revealedEl.textContent = revealedN;
        privateEl.textContent = cells.length - revealedN;
      }, 300 / speed);
      await d(30);
    }
    await d(400);

    // phase 4: block fills
    setPhase(PHASES[3]);
    blockSlots.forEach((slot, i) => {
      setTimeout(() => {
        const idx = selArr[i];
        if (idx !== undefined) {
          const cell = cells[idx];
          fireParticle(cell.x + CELL / 2, cell.y + CELL / 2, 520, 102 + i * 16, '#2a7d6a', 400);
          setTimeout(() => slot.setAttribute('opacity', 1), 400 / speed);
        }
      }, i * 50 / speed);
    });
    await d(2200);
  }

  async function loop() {
    while (true) {
      await cycle();
      await new Promise(r => setTimeout(r, 800));
    }
  }
  loop();

  // react to tweaks
  window.__bte.subscribe((s) => { rebuildCommittee(s.N); });
})();
