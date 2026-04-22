// Construction: animated ciphertext formation + committee flow
(function () {
  const root = document.getElementById('construction-root');
  root.innerHTML = `
    <section class="alt">
      <div class="wrap reveal" id="con-reveal">
        <h2 style="margin-bottom: 16px;">The construction, at a glance</h2>
        <p class="lede" style="margin-bottom: 32px;">BTX builds on pairing-friendly elliptic curves (BLS12-381). Everything below is a sketch — the paper has the full protocol, proofs, and security reductions.</p>

        <!-- 1. Ciphertext formation -->
        <div style="display: grid; grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); gap: 28px; margin-bottom: 40px; align-items: center;" class="con-grid">
          <div>
            <p class="tag">1. Encryption</p>
            <h3 style="margin: 6px 0 10px;">An ElGamal-shaped ciphertext</h3>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">To encrypt m, pick random r. Output a pair: the randomness, and m masked by a pad derived from the encryption key. That's it.</p>
          </div>
          <div class="card flat" style="font-family: var(--mono);">
            <p style="font-size: 10px; color: var(--text-tertiary); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px;">Ciphertext</p>
            <div id="ct-formula" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 14px;">
              <span style="color: var(--text-secondary);">ct =</span>
              <span class="ct-box" id="ct-r" style="background: var(--user-accent-light); color: var(--user-accent); font-weight: 600; padding: 8px 12px; border-radius: 8px; opacity: 0; transform: translateY(6px); transition: all 0.5s;">[r]₁</span>
              <span style="color: var(--text-tertiary);">,</span>
              <span class="ct-box" id="ct-m" style="background: var(--solution-accent-light); color: var(--solution-accent); font-weight: 600; padding: 8px 12px; border-radius: 8px; opacity: 0; transform: translateY(6px); transition: all 0.5s 0.25s;">m + r · ek</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border);">
              <div>
                <p style="font-size: 11px; color: var(--user-accent); font-weight: 600; margin-bottom: 2px;">[r]₁</p>
                <p style="font-size: 10.5px; color: var(--text-tertiary); line-height: 1.45;">randomness in G₁</p>
              </div>
              <div>
                <p style="font-size: 11px; color: var(--solution-accent); font-weight: 600; margin-bottom: 2px;">m + r · ek</p>
                <p style="font-size: 10.5px; color: var(--text-tertiary); line-height: 1.45;">masked message in G_T</p>
              </div>
            </div>
            <p style="font-size: 10.5px; color: var(--text-tertiary); margin-top: 14px; line-height: 1.5;">Core size: |G₁| + |G_T|. A short Schnorr NIZK rides alongside for CCA security.</p>
          </div>
        </div>

        <!-- 2. Committee decryption animated -->
        <div style="margin-bottom: 40px;">
          <p class="tag">2. Committee decryption</p>
          <h3 style="margin: 6px 0 10px;">One G₁ element per server, regardless of batch size</h3>
          <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; max-width: 46rem; margin-bottom: 24px;">Powers of the secret key τ are Shamir-shared across N servers. Any t+1 collectively decrypt. Each server sends exactly <strong>one group element</strong> to the combiner — its message size is independent of batch size.</p>

          <div class="card flat">
            <svg id="committee-svg" viewBox="0 0 640 280" style="width: 100%; display: block;"></svg>
            <div style="display: flex; justify-content: center; margin-top: 8px;">
              <button id="committee-replay" style="background: transparent; border: 1px solid var(--border); color: var(--text-secondary); font-family: var(--mono); font-size: 11px; padding: 6px 14px; border-radius: 999px; cursor: pointer;">↻ replay</button>
            </div>
          </div>
        </div>

        <!-- 3. FFT trick -->
        <div class="card solution">
          <p class="tag">3. The speed trick</p>
          <h3 style="margin: 6px 0 10px;">Batch decryption as a polynomial product</h3>
          <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px; max-width: 46rem;">Naïve batch decryption costs <span class="mono">O(B²)</span> pairings — every ciphertext contributes a cross-term to every other. BTX observes these cross-terms form a <em>contiguous window of a polynomial product</em>, computable as a middle-product via FFT: <span class="mono">O(B log B)</span> group operations, <span class="mono">O(B)</span> pairings.</p>
          <div id="fft-viz" style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 18px; align-items: center; margin-top: 20px;">
            <div>
              <p style="font-family: var(--mono); font-size: 10.5px; color: var(--problem-accent-strong); font-weight: 600; margin-bottom: 8px; text-align: center;">Naïve: O(B²)</p>
              <div id="fft-naive" style="aspect-ratio: 1; display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; max-width: 160px; margin: 0 auto;"></div>
            </div>
            <div style="font-family: var(--mono); font-size: 22px; color: var(--text-tertiary);">→</div>
            <div>
              <p style="font-family: var(--mono); font-size: 10.5px; color: var(--solution-accent); font-weight: 600; margin-bottom: 8px; text-align: center;">BTX FFT: O(B log B)</p>
              <div id="fft-btx" style="aspect-ratio: 1; display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; max-width: 160px; margin: 0 auto;"></div>
            </div>
          </div>
        </div>
      </div>
      <style>@media (max-width: 780px) { .con-grid { grid-template-columns: 1fr !important; } }</style>
    </section>
  `;
  registerReveal(document.getElementById('con-reveal'));

  // animate ct formula on reveal
  const ctIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.getElementById('ct-r').style.cssText += 'opacity:1;transform:translateY(0);';
        document.getElementById('ct-m').style.cssText += 'opacity:1;transform:translateY(0);';
        ctIo.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  ctIo.observe(document.getElementById('ct-formula'));

  // Committee SVG animation
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const committeeSvg = document.getElementById('committee-svg');
  const el = (n, a = {}) => {
    const e = document.createElementNS(SVG_NS, n);
    for (const k in a) e.setAttribute(k, a[k]);
    return e;
  };

  function buildCommittee() {
    committeeSvg.innerHTML = '';
    const N = window.__bte.N;
    // Labels
    const labelStyle = { 'font-family': 'IBM Plex Mono', 'font-size': 9, fill: '#8a7d6f', 'letter-spacing': 0.8 };
    ['CIPHERTEXTS', 'COMMITTEE', 'PLAINTEXTS'].forEach((l, i) => {
      const t = el('text', { x: [90, 320, 550][i], y: 18, 'text-anchor': 'middle', ...labelStyle });
      t.textContent = l;
      committeeSvg.appendChild(t);
    });

    // ciphertexts (left)
    const B = 5;
    const cts = [];
    for (let i = 0; i < B; i++) {
      const y = 50 + i * 38;
      const g = el('g', { opacity: 0 });
      const rect = el('rect', { x: 40, y: y - 12, width: 100, height: 24, rx: 4, fill: '#ffffff', stroke: '#e2ddd7' });
      const t1 = el('text', { x: 60, y: y + 3, 'font-family': 'IBM Plex Mono', 'font-size': 11, fill: '#2a7d6a', 'font-weight': 600 });
      t1.textContent = 'ct';
      const t2 = el('text', { x: 78, y: y + 3, 'font-family': 'IBM Plex Mono', 'font-size': 10, fill: '#8a7d6f' });
      t2.textContent = '#' + (i + 1);
      g.appendChild(rect); g.appendChild(t1); g.appendChild(t2);
      committeeSvg.appendChild(g);
      cts.push({ g, y, x: 140 });
    }

    // servers (center)
    const cx = 320, cy = 140, rad = 60;
    const ring = el('circle', { cx, cy, r: rad + 10, fill: 'none', stroke: '#e2ddd7', 'stroke-dasharray': '3 3' });
    committeeSvg.appendChild(ring);
    const tLabel = el('text', { x: cx, y: cy - rad - 18, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono', 'font-size': 9, fill: '#8a7d6f' });
    tLabel.textContent = 't+1 of N';
    committeeSvg.appendChild(tLabel);

    const servers = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      const sx = cx + Math.cos(a) * rad;
      const sy = cy + Math.sin(a) * rad;
      const c = el('circle', { cx: sx, cy: sy, r: 9, fill: '#c8e6df', stroke: '#2a7d6a', 'stroke-width': 1.2 });
      committeeSvg.appendChild(c);
      const lbl = el('text', { x: sx, y: sy + 3, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono', 'font-size': 8, fill: '#2a7d6a', 'font-weight': 600 });
      lbl.textContent = 'σ' + (i + 1);
      committeeSvg.appendChild(lbl);
      servers.push({ c, lbl, sx, sy });
    }

    // combiner label
    const cmb = el('text', { x: cx, y: cy + rad + 24, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono', 'font-size': 9, fill: '#8a7d6f' });
    cmb.textContent = 'combiner · 1 G₁ per server';
    committeeSvg.appendChild(cmb);

    // plaintexts (right)
    const pts = [];
    for (let i = 0; i < B; i++) {
      const y = 50 + i * 38;
      const g = el('g', { opacity: 0 });
      const rect = el('rect', { x: 500, y: y - 12, width: 100, height: 24, rx: 4, fill: '#c8e6df', stroke: '#2a7d6a', 'stroke-width': 0.8 });
      const t1 = el('text', { x: 515, y: y + 3, 'font-family': 'IBM Plex Mono', 'font-size': 11, fill: '#2a7d6a', 'font-weight': 600 });
      t1.textContent = 'm';
      const sub = el('text', { x: 527, y: y + 6, 'font-family': 'IBM Plex Mono', 'font-size': 9, fill: '#2a7d6a' });
      sub.textContent = (i + 1);
      g.appendChild(rect); g.appendChild(t1); g.appendChild(sub);
      committeeSvg.appendChild(g);
      pts.push({ g, y, x: 500 });
    }

    return { cts, servers, pts, cx, cy };
  }

  let playing = false;
  async function playCommittee() {
    if (playing) return;
    playing = true;
    const { cts, servers, pts, cx, cy } = buildCommittee();
    const speed = window.__bte.speed;
    const d = (ms) => new Promise(r => setTimeout(r, ms / speed));

    // ciphertexts fade in
    for (const c of cts) {
      c.g.setAttribute('opacity', 1);
      await d(80);
    }
    await d(200);

    // ciphertexts arrow toward center
    for (const c of cts) {
      const dot = el('circle', { cx: c.x, cy: c.y, r: 3, fill: '#2a7d6a' });
      committeeSvg.appendChild(dot);
      dot.animate([
        { cx: c.x, cy: c.y, opacity: 1 },
        { cx: cx, cy: cy, opacity: 0 }
      ], { duration: 500 / speed, easing: 'cubic-bezier(.3,0,.2,1)', fill: 'forwards' });
      setTimeout(() => dot.remove(), 500 / speed);
    }
    await d(600);

    // servers light up + each sends a dot to combiner center
    for (let i = 0; i < servers.length; i++) {
      const s = servers[i];
      s.c.setAttribute('fill', '#2a7d6a');
      const dot = el('circle', { cx: s.sx, cy: s.sy, r: 3, fill: '#2a7d6a' });
      committeeSvg.appendChild(dot);
      dot.animate([
        { cx: s.sx, cy: s.sy, opacity: 1 },
        { cx: cx, cy: cy, opacity: 0.3 }
      ], { duration: 400 / speed, easing: 'cubic-bezier(.3,0,.2,1)', fill: 'forwards' });
      setTimeout(() => dot.remove(), 400 / speed);
      await d(120);
    }
    await d(300);

    // plaintexts appear
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const dot = el('circle', { cx: cx, cy: cy, r: 3, fill: '#2a7d6a' });
      committeeSvg.appendChild(dot);
      dot.animate([
        { cx: cx, cy: cy, opacity: 1 },
        { cx: p.x, cy: p.y, opacity: 0 }
      ], { duration: 400 / speed, easing: 'cubic-bezier(.3,0,.2,1)', fill: 'forwards' });
      setTimeout(() => { dot.remove(); p.g.setAttribute('opacity', 1); }, 400 / speed);
      await d(100);
    }
    await d(1200);
    playing = false;
  }

  document.getElementById('committee-replay').addEventListener('click', playCommittee);
  window.__bte.subscribe(() => { if (!playing) buildCommittee(); });

  // initial build + play once visible
  buildCommittee();
  const playIo = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { playCommittee(); playIo.unobserve(e.target); } });
  }, { threshold: 0.3 });
  playIo.observe(committeeSvg);

  // FFT compute grids
  const fftNaive = document.getElementById('fft-naive');
  const fftBtx = document.getElementById('fft-btx');
  for (let i = 0; i < 64; i++) {
    const n = document.createElement('div');
    n.style.cssText = 'background: var(--problem-accent); aspect-ratio: 1; border-radius: 1px; opacity: 0.85;';
    fftNaive.appendChild(n);
    const b = document.createElement('div');
    const onDiag = i % 9 === 0 || (Math.log2(i + 1) % 1 === 0);
    b.style.cssText = `background: ${onDiag ? 'var(--solution-accent)' : 'var(--solution-accent-light)'}; aspect-ratio: 1; border-radius: 1px; opacity: ${onDiag ? 0.95 : 0.25};`;
    fftBtx.appendChild(b);
  }
})();
