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
        <div id="comms-canvas" style="height: 200px; display: flex; align-items: center; justify-content: center;"></div>
        <p style="font-family: var(--mono); font-size: 11px; color: var(--text-tertiary); margin-top: 8px;">N = <span id="comms-N">5</span>, B = <span id="comms-B">16</span> → <span id="comms-total" style="color: var(--problem-accent-strong); font-weight: 600;">80</span> messages</p>
      `;
      const c = el.querySelector('#comms-canvas');
      let raf, stopped = false;
      function draw() {
        if (stopped) return;
        const N = Math.min(9, window.__bte.N);
        const B = Math.min(32, window.__bte.B);
        const messages = N * B;
        el.querySelector('#comms-N').textContent = N;
        el.querySelector('#comms-B').textContent = B;
        el.querySelector('#comms-total').textContent = messages;
        c.innerHTML = '';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 400 200');
        svg.setAttribute('width', '100%');
        // validators on left
        for (let i = 0; i < N; i++) {
          const y = 20 + (i / Math.max(1, N - 1)) * 160;
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', 40); circle.setAttribute('cy', y); circle.setAttribute('r', 7);
          circle.setAttribute('fill', '#c8e6df'); circle.setAttribute('stroke', '#2a7d6a');
          svg.appendChild(circle);
        }
        // ciphertexts on right
        for (let j = 0; j < B; j++) {
          const y = 15 + (j / Math.max(1, B - 1)) * 170;
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', 355); rect.setAttribute('y', y - 3);
          rect.setAttribute('width', 12); rect.setAttribute('height', 6);
          rect.setAttribute('fill', '#f0d9c8'); rect.setAttribute('rx', 1);
          svg.appendChild(rect);
        }
        // lines
        for (let i = 0; i < N; i++) {
          for (let j = 0; j < B; j++) {
            const y1 = 20 + (i / Math.max(1, N - 1)) * 160;
            const y2 = 15 + (j / Math.max(1, B - 1)) * 170;
            const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            l.setAttribute('x1', 48); l.setAttribute('y1', y1);
            l.setAttribute('x2', 353); l.setAttribute('y2', y2);
            l.setAttribute('stroke', '#c4653a'); l.setAttribute('stroke-width', 0.4);
            l.setAttribute('opacity', 0.35);
            svg.appendChild(l);
          }
        }
        c.appendChild(svg);
      }
      draw();
      const unsub = window.__bte.subscribe(draw);
      return () => { stopped = true; unsub(); };
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
          <div style="background: var(--problem-bg); padding: 14px; border-radius: 10px; border: 1px solid var(--problem-accent-light);">
            <p class="tag" style="color: var(--problem-accent-strong); margin-bottom: 10px;">PFE ciphertext</p>
            <div style="display: flex; gap: 4px;">
              <div style="flex: 1; height: 26px; border-radius: 4px; background: var(--problem-accent-light); display:flex; align-items:center; justify-content:center; font-family: var(--mono); font-size: 10px; color: var(--problem-accent-strong);">G₁</div>
              <div style="flex: 1; height: 26px; border-radius: 4px; background: var(--problem-accent-light); display:flex; align-items:center; justify-content:center; font-family: var(--mono); font-size: 10px; color: var(--problem-accent-strong);">G₁</div>
              <div style="flex: 2; height: 26px; border-radius: 4px; background: var(--problem-accent); color: white; display:flex; align-items:center; justify-content:center; font-family: var(--mono); font-size: 10px;">G_T</div>
            </div>
            <p style="font-family: var(--mono); font-size: 10px; color: var(--problem-accent-strong); margin-top: 10px;">4 pairings per open · 0.723 ms/ct</p>
          </div>
          <div style="background: var(--solution-bg); padding: 14px; border-radius: 10px; border: 1px solid color-mix(in oklab, var(--solution-accent) 30%, transparent);">
            <p class="tag" style="margin-bottom: 10px;">BTX ciphertext</p>
            <div style="display: flex; gap: 4px;">
              <div style="flex: 1; height: 26px; border-radius: 4px; background: var(--solution-accent-light); display:flex; align-items:center; justify-content:center; font-family: var(--mono); font-size: 10px; color: var(--solution-accent);">G₁</div>
              <div style="flex: 2; height: 26px; border-radius: 4px; background: var(--solution-accent); color: white; display:flex; align-items:center; justify-content:center; font-family: var(--mono); font-size: 10px;">G_T</div>
            </div>
            <p style="font-family: var(--mono); font-size: 10px; color: var(--solution-accent); margin-top: 10px;">1 pairing per open · 0.171 ms/ct</p>
          </div>
        </div>
      `;
      return () => {};
    },
  };

  render(SCHEMES[0]);
})();
