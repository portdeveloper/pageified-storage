// Problem section: interactive failure modes
(function () {
  const root = document.getElementById('problem-root');
  root.innerHTML = `
    <section id="problem-root-sec" style="padding-top: 96px;">
      <div class="wrap reveal" id="prob-reveal">
        <h2 style="margin-bottom: 16px;">Why encrypted mempools are hard</h2>
        <p class="lede" style="margin-bottom: 32px;">
          Transactions sit in the mempool where anyone can read and front-run them. The fix: encrypt until block inclusion. Every prior scheme gives up something critical — pick an approach to see what breaks.
        </p>

        <div style="display: grid; grid-template-columns: minmax(260px, 340px) 1fr; gap: 24px;" class="prob-grid">
          <!-- list of schemes -->
          <div id="scheme-list" style="display: flex; flex-direction: column; gap: 6px;"></div>
          <!-- interactive canvas -->
          <div id="scheme-canvas" class="card" style="min-height: 360px; position: relative; overflow: hidden;"></div>
        </div>

        <div class="card solution" style="margin-top: 24px; display: flex; gap: 14px; align-items: flex-start;">
          <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--solution-accent); color: white; display:flex; align-items:center; justify-content:center; font-weight: 600; flex-shrink: 0;">✓</div>
          <div>
            <p class="tag" style="margin-bottom: 4px;">BTX fills the gap</p>
            <p style="color: var(--text-primary); line-height: 1.55;">First BTE scheme that is <strong>collision-free, epochless, compact</strong> (ciphertext as small as plain ElGamal), and <strong>fast</strong> (decryption scales with the actual batch, not the maximum).</p>
          </div>
        </div>
      </div>
    </section>
    <style>
      @media (max-width: 780px) { .prob-grid { grid-template-columns: 1fr !important; } }
      .scheme-btn { text-align: left; background: var(--surface-elevated); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; cursor: pointer; font-family: var(--sans); transition: all 0.15s; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
      .scheme-btn:hover { border-color: var(--text-tertiary); }
      .scheme-btn.active { border-color: var(--solution-accent); background: var(--solution-bg); box-shadow: 0 0 0 3px color-mix(in oklab, var(--solution-accent) 12%, transparent); }
      .scheme-btn .name { font-size: 13.5px; font-weight: 500; color: var(--text-primary); }
      .scheme-btn .fail { font-family: var(--mono); font-size: 10px; color: var(--problem-accent-strong); text-transform: uppercase; letter-spacing: 0.06em; }
      .scheme-btn.active .fail { color: var(--solution-accent); }
    </style>
  `;
  registerReveal(document.getElementById('prob-reveal'));

  const SCHEMES = [
    { id: 'naive', name: 'Naïve threshold encryption', fail: 'O(N·B) comms', kind: 'comms' },
    { id: 'ibe', name: 'Threshold IBE', fail: 'all-or-nothing', kind: 'allornothing' },
    { id: 'early', name: 'Early BTE (per-block MPC)', fail: 'too slow', kind: 'slow' },
    { id: 'indexed', name: 'Indexed BTE (BEAT-MEV, BEAT++)', fail: 'index collision', kind: 'collision' },
    { id: 'trx', name: 'TrX (Fernando et al.)', fail: 'CRS grows forever', kind: 'crs' },
    { id: 'pfe', name: 'PFE (Boneh et al.)', fail: 'expensive compute', kind: 'expensive' },
  ];

  const list = document.getElementById('scheme-list');
  SCHEMES.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'scheme-btn' + (i === 0 ? ' active' : '');
    b.dataset.id = s.id;
    b.innerHTML = `<span class="name">${s.name}</span><span class="fail">${s.fail}</span>`;
    b.addEventListener('click', () => {
      document.querySelectorAll('.scheme-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      render(s);
    });
    list.appendChild(b);
  });

  const canvas = document.getElementById('scheme-canvas');
  let stopCurrent = null;

  function render(s) {
    if (stopCurrent) stopCurrent();
    canvas.innerHTML = '';
    const header = document.createElement('div');
    header.style.cssText = 'margin-bottom: 18px;';
    header.innerHTML = `
      <p class="tag" style="color: var(--problem-accent-strong); margin-bottom: 4px;">${s.fail}</p>
      <p style="font-size: 15px; font-weight: 600; margin: 0;">${s.name}</p>
    `;
    canvas.appendChild(header);
    const body = document.createElement('div');
    canvas.appendChild(body);
    stopCurrent = RENDERERS[s.kind](body);
  }

  const RENDERERS = {
    comms(el) {
      el.innerHTML = `
        <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.55; margin-bottom: 16px;">Every validator sends a decryption share for every ciphertext. With N validators × B transactions per block, messages scale as O(N·B) — unmanageable at scale.</p>
        <div id="comms-canvas" style="height: 220px; display: flex; align-items: center; justify-content: center;"></div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-family: var(--mono); font-size: 11px; color: var(--text-tertiary);">
          <span>N = <span id="comms-N">5</span>, B = <span id="comms-B">16</span></span>
          <span>messages sent: <span id="comms-sent" style="color: var(--problem-accent-strong); font-weight: 600; font-variant-numeric: tabular-nums;">0</span> / <span id="comms-total" style="color: var(--problem-accent-strong); font-weight: 600;">80</span></span>
        </div>
      `;
      const c = el.querySelector('#comms-canvas');
      const SVG_NS = 'http://www.w3.org/2000/svg';
      let stopped = false;
      let svg, validators = [], cts = [], edges = [], sentEl, totalEl, N = 0, B = 0;
      let tickHandle = null;

      function layout() {
        N = Math.min(9, Math.max(2, window.__bte.N));
        B = Math.min(32, Math.max(4, window.__bte.B));
        el.querySelector('#comms-N').textContent = N;
        el.querySelector('#comms-B').textContent = B;
        el.querySelector('#comms-total').textContent = N * B;
        sentEl = el.querySelector('#comms-sent');
        totalEl = el.querySelector('#comms-total');

        c.innerHTML = '';
        svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', '0 0 400 220');
        svg.setAttribute('width', '100%');
        c.appendChild(svg);

        // labels
        const labelStyle = { 'font-family': 'IBM Plex Mono', 'font-size': 9, fill: '#8a7d6f', 'letter-spacing': 0.6 };
        [['VALIDATORS', 40], ['CIPHERTEXTS', 360]].forEach(([t, x]) => {
          const tx = document.createElementNS(SVG_NS, 'text');
          for (const k in labelStyle) tx.setAttribute(k, labelStyle[k]);
          tx.setAttribute('x', x); tx.setAttribute('y', 14); tx.setAttribute('text-anchor', 'middle');
          tx.textContent = t;
          svg.appendChild(tx);
        });

        validators = [];
        for (let i = 0; i < N; i++) {
          const y = 30 + (i / Math.max(1, N - 1)) * 170;
          const cEl = document.createElementNS(SVG_NS, 'circle');
          cEl.setAttribute('cx', 40); cEl.setAttribute('cy', y); cEl.setAttribute('r', 8);
          cEl.setAttribute('fill', '#c8e6df'); cEl.setAttribute('stroke', '#2a7d6a');
          cEl.setAttribute('stroke-width', 1.2);
          svg.appendChild(cEl);
          validators.push({ x: 40, y, el: cEl });
        }

        cts = [];
        for (let j = 0; j < B; j++) {
          const y = 24 + (j / Math.max(1, B - 1)) * 182;
          const rect = document.createElementNS(SVG_NS, 'rect');
          rect.setAttribute('x', 354); rect.setAttribute('y', y - 3);
          rect.setAttribute('width', 14); rect.setAttribute('height', 6);
          rect.setAttribute('fill', '#f0d9c8'); rect.setAttribute('rx', 1);
          svg.appendChild(rect);
          cts.push({ x: 360, y, el: rect });
        }

        // every edge is a faint line
        edges = [];
        for (let i = 0; i < N; i++) {
          for (let j = 0; j < B; j++) {
            const l = document.createElementNS(SVG_NS, 'line');
            l.setAttribute('x1', 48); l.setAttribute('y1', validators[i].y);
            l.setAttribute('x2', 353); l.setAttribute('y2', cts[j].y);
            l.setAttribute('stroke', '#c4653a'); l.setAttribute('stroke-width', 0.35);
            l.setAttribute('opacity', 0.18);
            svg.appendChild(l);
            edges.push({ i, j, el: l });
          }
        }
      }

      function sendDot(i, j) {
        const v = validators[i], t = cts[j];
        const dot = document.createElementNS(SVG_NS, 'circle');
        dot.setAttribute('r', 2.4);
        dot.setAttribute('fill', '#c4653a');
        dot.setAttribute('cx', v.x); dot.setAttribute('cy', v.y);
        svg.appendChild(dot);
        const dur = 700 + Math.random() * 300;
        dot.animate(
          [{ cx: v.x, cy: v.y, opacity: 1 }, { cx: t.x, cy: t.y, opacity: 0.9 }],
          { duration: dur, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }
        );
        // validator pulses, edge briefly lights
        v.el.animate([{ r: 8 }, { r: 10 }, { r: 8 }], { duration: 350 });
        const edge = edges[i * B + j];
        if (edge) {
          edge.el.animate(
            [{ opacity: 0.18, strokeWidth: 0.35 }, { opacity: 0.85, strokeWidth: 1.2 }, { opacity: 0.18, strokeWidth: 0.35 }],
            { duration: dur }
          );
        }
        setTimeout(() => {
          dot.remove();
          t.el.animate([{ fill: '#f0d9c8' }, { fill: '#c4653a' }, { fill: '#f0d9c8' }], { duration: 500 });
        }, dur);
      }

      let sent = 0;
      function tick() {
        if (stopped) return;
        const speed = window.__bte.speed || 1;
        const perTick = Math.max(1, Math.round((N * B) / 40));
        for (let k = 0; k < perTick; k++) {
          const idx = sent % (N * B);
          const i = Math.floor(idx / B);
          const j = idx % B;
          sendDot(i, j);
          sent++;
        }
        sentEl.textContent = ((sent - 1) % (N * B) + 1);
        if (sent % (N * B) === 0) {
          // round complete — brief pause then reset visual counter
          tickHandle = setTimeout(() => {
            sentEl.textContent = '0';
            tickHandle = setTimeout(tick, 900 / speed);
          }, 1200 / speed);
          return;
        }
        tickHandle = setTimeout(tick, (N * B > 100 ? 110 : 180) / speed);
      }

      layout();
      tickHandle = setTimeout(tick, 400);

      const unsub = window.__bte.subscribe(() => {
        if (tickHandle) clearTimeout(tickHandle);
        sent = 0;
        layout();
        tickHandle = setTimeout(tick, 300);
      });
      return () => { stopped = true; if (tickHandle) clearTimeout(tickHandle); unsub(); };
    },

    allornothing(el) {
      el.innerHTML = `
        <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.55; margin-bottom: 16px;">Releasing the epoch key decrypts <em>every</em> ciphertext in the epoch — including ones that weren't in any block. No selective privacy.</p>
        <div id="aon" style="display: flex; gap: 6px; padding: 12px; background: var(--surface); border-radius: 8px; flex-wrap: wrap;"></div>
        <div style="display: flex; justify-content: center; margin-top: 12px;">
          <button id="aon-release" style="background: var(--problem-accent); color: white; border: none; padding: 8px 14px; border-radius: 8px; font-family: var(--mono); font-size: 11px; cursor: pointer;">Release epoch key</button>
        </div>
      `;
      const grid = el.querySelector('#aon');
      const cells = [];
      for (let i = 0; i < 48; i++) {
        const d = document.createElement('div');
        d.style.cssText = 'width: 16px; height: 16px; border-radius: 2px; background: #e2ddd7; transition: background 0.3s;';
        grid.appendChild(d);
        cells.push(d);
      }
      const selected = new Set();
      while (selected.size < 12) selected.add(Math.floor(Math.random() * 48));
      selected.forEach(i => cells[i].style.background = '#f0d9c8');
      el.querySelector('#aon-release').addEventListener('click', () => {
        cells.forEach((c, i) => {
          setTimeout(() => c.style.background = '#c8e6df', i * 15);
        });
        setTimeout(() => {
          const note = document.createElement('p');
          note.style.cssText = 'font-family: var(--mono); font-size: 11px; color: var(--problem-accent-strong); margin-top: 10px; text-align: center;';
          note.textContent = '✗ all 48 revealed — privacy gone';
          el.appendChild(note);
        }, 800);
      });
      return () => {};
    },

    slow(el) {
      el.innerHTML = `
        <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.55; margin-bottom: 16px;">Running a fresh MPC setup every single block is far too slow to keep up with modern block times.</p>
        <div style="display: flex; gap: 16px; align-items: stretch;">
          <div style="flex: 1; background: var(--surface); border-radius: 8px; padding: 14px;">
            <p style="font-family: var(--mono); font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 8px;">Block time budget</p>
            <div style="height: 18px; background: var(--border); border-radius: 9px; overflow: hidden; position: relative;">
              <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 20%; background: var(--solution-accent);"></div>
            </div>
            <p style="font-family: var(--mono); font-size: 11px; margin-top: 6px; color: var(--text-secondary);">~400ms</p>
          </div>
          <div style="flex: 1; background: var(--problem-bg); border-radius: 8px; padding: 14px;">
            <p style="font-family: var(--mono); font-size: 10px; color: var(--problem-accent-strong); text-transform: uppercase; margin-bottom: 8px;">MPC setup ceremony</p>
            <div style="height: 18px; background: var(--border); border-radius: 9px; overflow: hidden; position: relative;">
              <div id="mpc-fill" style="position: absolute; left: 0; top: 0; bottom: 0; width: 0%; background: var(--problem-accent); transition: width 1.8s linear;"></div>
            </div>
            <p style="font-family: var(--mono); font-size: 11px; margin-top: 6px; color: var(--problem-accent-strong);">seconds → minutes</p>
          </div>
        </div>
        <p style="font-family: var(--mono); font-size: 11px; color: var(--problem-accent-strong); margin-top: 12px; text-align: center;">✗ ceremony overflows budget on every block</p>
      `;
      setTimeout(() => { el.querySelector('#mpc-fill').style.width = '420%'; }, 100);
      return () => {};
    },

    collision(el) {
      el.innerHTML = `
        <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.55; margin-bottom: 16px;">Two users can collide on the same index. Worse: an attacker can deliberately publish a ciphertext at index 7 to <em>censor</em> Alice's.</p>
        <div id="coll-viz"></div>
      `;
      const v = el.querySelector('#coll-viz');
      let t = 0, stopped = false;
      function frame() {
        if (stopped) return;
        t = (t + 1) % 240;
        v.innerHTML = `
          <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 8px 12px; align-items: center; font-family: var(--mono); font-size: 12px;">
            <span style="color: #3b7dd8; font-weight: 600; background: #edf3fc; padding: 3px 8px; border-radius: 999px;">Alice</span>
            <div style="position: relative; height: 28px; background: var(--surface); border-radius: 6px; overflow: hidden;">
              <div style="position: absolute; left: ${Math.min(100, t * 1.2)}%; top: 50%; transform: translate(-50%, -50%); padding: 3px 8px; background: #b8d4f0; color: #3b7dd8; border-radius: 4px; font-size: 10px; transition: opacity 0.3s; opacity: ${t > 80 && t < 120 ? 0.2 : 1};">ct_A</div>
            </div>
            <span style="color: var(--text-tertiary); font-size: 10px;">idx 7</span>

            <span style="color: #c4653a; font-weight: 600; background: #fdf6ef; padding: 3px 8px; border-radius: 999px;">Attacker</span>
            <div style="position: relative; height: 28px; background: var(--surface); border-radius: 6px; overflow: hidden;">
              <div style="position: absolute; left: ${Math.min(100, (t + 40) * 1.2)}%; top: 50%; transform: translate(-50%, -50%); padding: 3px 8px; background: ${t > 100 ? '#c4653a' : '#f0d9c8'}; color: ${t > 100 ? 'white' : '#c4653a'}; border-radius: 4px; font-size: 10px;">ct_X ${t > 100 ? '✓' : ''}</div>
            </div>
            <span style="color: var(--text-tertiary); font-size: 10px;">idx 7</span>
          </div>
          <div style="margin-top: 16px; padding: 10px 14px; background: ${t > 120 ? 'var(--problem-bg)' : 'var(--surface)'}; border-radius: 8px; border: 1px solid ${t > 120 ? 'var(--problem-accent-light)' : 'var(--border)'}; transition: all 0.3s;">
            <p style="font-family: var(--mono); font-size: 11px; color: ${t > 120 ? 'var(--problem-accent-strong)' : 'var(--text-tertiary)'}; margin: 0;">${t > 120 ? '✗ Collision on idx 7 — Alice censored' : '… both users send to same slot'}</p>
          </div>
        `;
        requestAnimationFrame(() => setTimeout(frame, 50));
      }
      frame();
      return () => { stopped = true; };
    },

    crs(el) {
      el.innerHTML = `
        <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.55; margin-bottom: 16px;">Common Reference String grows with the number of decryption sessions. On a long-lived chain, it grows without bound.</p>
        <div style="padding: 20px; background: var(--surface); border-radius: 10px;">
          <div id="crs-bar" style="height: 12px; background: var(--border); border-radius: 6px; overflow: hidden; margin-bottom: 8px;">
            <div id="crs-fill" style="height: 100%; background: var(--problem-accent); width: 10%; transition: width 0.3s;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-family: var(--mono); font-size: 11px; color: var(--text-secondary);">
            <span>Block <span id="crs-block">1</span></span>
            <span>CRS size: <span id="crs-size" style="color: var(--problem-accent-strong); font-weight: 600;">32 KB</span></span>
          </div>
        </div>
        <p style="font-family: var(--mono); font-size: 11px; color: var(--problem-accent-strong); margin-top: 14px; text-align: center;">✗ unbounded growth</p>
      `;
      let b = 1, stopped = false;
      function tick() {
        if (stopped) return;
        b += Math.ceil(Math.random() * 50);
        const pct = Math.min(100, b / 20);
        el.querySelector('#crs-fill').style.width = pct + '%';
        el.querySelector('#crs-block').textContent = b.toLocaleString();
        el.querySelector('#crs-size').textContent = (32 + b * 0.04).toFixed(1) + ' KB';
        if (pct >= 100) { b = 1; }
        setTimeout(tick, 120);
      }
      tick();
      return () => { stopped = true; };
    },

    expensive(el) {
      el.innerHTML = `
        <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.55; margin-bottom: 16px;">PFE is collision-free and epochless — but uses 3 group elements per ciphertext and performs 4 pairings during open. Heavy concretely.</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div id="pfe-card" style="background: var(--problem-bg); padding: 14px; border-radius: 10px; border: 1px solid var(--problem-accent-light);">
            <p class="tag" style="color: var(--problem-accent-strong); margin-bottom: 10px;">PFE open</p>
            <div style="display: flex; gap: 4px; margin-bottom: 10px;">
              <div class="pfe-seg" data-n="1" style="flex: 1; height: 26px; border-radius: 4px; background: var(--problem-accent-light); display:flex; align-items:center; justify-content:center; font-family: var(--mono); font-size: 10px; color: var(--problem-accent-strong); position: relative; overflow: hidden;">G₁</div>
              <div class="pfe-seg" data-n="2" style="flex: 1; height: 26px; border-radius: 4px; background: var(--problem-accent-light); display:flex; align-items:center; justify-content:center; font-family: var(--mono); font-size: 10px; color: var(--problem-accent-strong); position: relative; overflow: hidden;">G₁</div>
              <div class="pfe-seg" data-n="3 4" style="flex: 2; height: 26px; border-radius: 4px; background: var(--problem-accent); color: white; display:flex; align-items:center; justify-content:center; font-family: var(--mono); font-size: 10px; position: relative; overflow: hidden;">G_T</div>
            </div>
            <div style="display: flex; gap: 4px; margin-bottom: 6px;">
              ${[1,2,3,4].map(i => `<div class="pfe-pair" data-i="${i}" style="flex:1; height: 14px; border-radius: 3px; background: color-mix(in oklab, var(--problem-accent) 22%, transparent); display:flex; align-items:center; justify-content:center; font-family: var(--mono); font-size: 9px; color: var(--problem-accent-strong); transition: all 0.2s;">e${i}</div>`).join('')}
            </div>
            <p style="font-family: var(--mono); font-size: 10px; color: var(--problem-accent-strong); margin-top: 10px;">4 pairings per open · <span id="pfe-ms">0.723</span> ms/ct</p>
          </div>
          <div id="btx-card" style="background: var(--solution-bg); padding: 14px; border-radius: 10px; border: 1px solid color-mix(in oklab, var(--solution-accent) 30%, transparent);">
            <p class="tag" style="margin-bottom: 10px;">BTX open</p>
            <div style="display: flex; gap: 4px; margin-bottom: 10px;">
              <div class="btx-seg" data-n="1" style="flex: 1; height: 26px; border-radius: 4px; background: var(--solution-accent-light); display:flex; align-items:center; justify-content:center; font-family: var(--mono); font-size: 10px; color: var(--solution-accent); position: relative; overflow: hidden;">G₁</div>
              <div class="btx-seg" data-n="" style="flex: 2; height: 26px; border-radius: 4px; background: var(--solution-accent); color: white; display:flex; align-items:center; justify-content:center; font-family: var(--mono); font-size: 10px; position: relative; overflow: hidden;">G_T</div>
            </div>
            <div style="display: flex; gap: 4px; margin-bottom: 6px;">
              <div class="btx-pair" data-i="1" style="flex:1; height: 14px; border-radius: 3px; background: color-mix(in oklab, var(--solution-accent) 22%, transparent); display:flex; align-items:center; justify-content:center; font-family: var(--mono); font-size: 9px; color: var(--solution-accent); transition: all 0.2s;">e1</div>
              <div style="flex:3;"></div>
            </div>
            <p style="font-family: var(--mono); font-size: 10px; color: var(--solution-accent); margin-top: 10px;">1 pairing per open · <span id="btx-ms">0.171</span> ms/ct</p>
          </div>
        </div>
        <p id="pfe-caption" style="font-family: var(--mono); font-size: 11px; color: var(--text-tertiary); margin-top: 14px; text-align: center; min-height: 16px;"></p>
      `;
      let step = 0, stopped = false, to;
      const pfePairs = el.querySelectorAll('.pfe-pair');
      const btxPairs = el.querySelectorAll('.btx-pair');
      const pfeSegs = el.querySelectorAll('.pfe-seg');
      const btxSegs = el.querySelectorAll('.btx-seg');
      const caption = el.querySelector('#pfe-caption');

      function reset() {
        pfePairs.forEach(p => { p.style.background = 'color-mix(in oklab, var(--problem-accent) 22%, transparent)'; p.style.transform = ''; });
        btxPairs.forEach(p => { p.style.background = 'color-mix(in oklab, var(--solution-accent) 22%, transparent)'; p.style.transform = ''; });
        pfeSegs.forEach(s => s.style.boxShadow = '');
        btxSegs.forEach(s => s.style.boxShadow = '');
      }

      function tick() {
        if (stopped) return;
        const speed = window.__bte.speed || 1;
        step = (step + 1) % 6;
        reset();

        if (step >= 1 && step <= 4) {
          const p = pfePairs[step - 1];
          p.style.background = 'var(--problem-accent)';
          p.style.color = 'white';
          p.style.transform = 'scale(1.08)';
          pfeSegs.forEach(s => {
            if (s.dataset.n.split(' ').includes(String(step))) {
              s.style.boxShadow = '0 0 0 2px var(--problem-accent)';
            }
          });
          caption.innerHTML = `<span style="color: var(--problem-accent-strong);">PFE pairing ${step}/4</span>`;
        }

        if (step === 1) {
          // BTX fires its single pairing once, at the start
          const p = btxPairs[0];
          p.style.background = 'var(--solution-accent)';
          p.style.color = 'white';
          p.style.transform = 'scale(1.08)';
          btxSegs[0].style.boxShadow = '0 0 0 2px var(--solution-accent)';
          btxSegs[1].style.boxShadow = '0 0 0 2px var(--solution-accent)';
        }

        if (step === 5) {
          caption.innerHTML = `<span style="color: var(--solution-accent); font-weight: 600;">BTX finished at step 1 · 4.2× faster per ct</span>`;
        }

        to = setTimeout(tick, 700 / speed);
      }
      tick();
      return () => { stopped = true; if (to) clearTimeout(to); };
    },
  };

  render(SCHEMES[0]);
})();
