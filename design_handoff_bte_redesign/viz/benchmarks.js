// Benchmarks: dual-line chart + headline + bars
(function () {
  const root = document.getElementById('benchmarks-root');

  const ROWS = [
    { b: 32,  pfePre: 0.963, btxPre: 0.644, pfeOpen: 0.721, btxOpen: 0.171 },
    { b: 64,  pfePre: 1.12,  btxPre: 0.722, pfeOpen: 0.721, btxOpen: 0.171 },
    { b: 128, pfePre: 1.278, btxPre: 0.801, pfeOpen: 0.721, btxOpen: 0.171 },
    { b: 256, pfePre: 1.436, btxPre: 0.88,  pfeOpen: 0.722, btxOpen: 0.171 },
    { b: 512, pfePre: 1.596, btxPre: 0.959, pfeOpen: 0.723, btxOpen: 0.171 },
  ];

  root.innerHTML = `
    <section>
      <div class="wrap reveal" id="bench-reveal">
        <h2 style="margin-bottom: 16px;">Faster than the best prior schemes</h2>
        <p class="lede" style="margin-bottom: 32px;">The authors reimplemented PFE and BEAT++ in the same aggressively-optimized C++ codebase as BTX — AVX-512, FFT backends, optimized MSM and pairing paths. A comparison against tuned baselines, not reference code.</p>

        <!-- Headline speedups -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;" class="bench-head">
          <div class="card" style="padding: 24px; background: linear-gradient(135deg, var(--solution-bg), var(--surface-elevated));">
            <p class="tag">Total decryption · B=512</p>
            <div style="display: flex; align-items: baseline; gap: 10px; margin: 10px 0 12px;">
              <span style="font-size: 44px; font-weight: 600; color: var(--solution-accent); letter-spacing: -0.03em;">2.0×</span>
              <span style="font-family: var(--mono); font-size: 12px; color: var(--text-secondary);">faster overall</span>
            </div>
            <div style="margin-top: 16px;">
              <div style="display: flex; justify-content: space-between; font-family: var(--mono); font-size: 10.5px; margin-bottom: 4px;"><span style="color: var(--problem-accent-strong);">PFE</span><span>1197 ms</span></div>
              <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;"><div class="bh-bar" data-w="100" style="width: 0; height: 100%; background: var(--problem-accent); transition: width 0.9s cubic-bezier(0.16,1,0.3,1);"></div></div>
              <div style="display: flex; justify-content: space-between; font-family: var(--mono); font-size: 10.5px; margin: 10px 0 4px;"><span style="color: var(--solution-accent); font-weight: 600;">BTX</span><span>598 ms</span></div>
              <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;"><div class="bh-bar" data-w="50" style="width: 0; height: 100%; background: var(--solution-accent); transition: width 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s;"></div></div>
            </div>
          </div>

          <div class="card" style="padding: 24px; background: linear-gradient(135deg, var(--solution-bg), var(--surface-elevated));">
            <p class="tag">Open phase · per ciphertext</p>
            <div style="display: flex; align-items: baseline; gap: 10px; margin: 10px 0 12px;">
              <span style="font-size: 44px; font-weight: 600; color: var(--solution-accent); letter-spacing: -0.03em;">4.2×</span>
              <span style="font-family: var(--mono); font-size: 12px; color: var(--text-secondary);">faster per ct · 1 pairing vs 4</span>
            </div>
            <div style="margin-top: 16px;">
              <div style="display: flex; justify-content: space-between; font-family: var(--mono); font-size: 10.5px; margin-bottom: 4px;"><span style="color: var(--problem-accent-strong);">PFE</span><span>0.723 ms/ct</span></div>
              <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;"><div class="bh-bar" data-w="100" style="width: 0; height: 100%; background: var(--problem-accent); transition: width 0.9s cubic-bezier(0.16,1,0.3,1);"></div></div>
              <div style="display: flex; justify-content: space-between; font-family: var(--mono); font-size: 10.5px; margin: 10px 0 4px;"><span style="color: var(--solution-accent); font-weight: 600;">BTX</span><span>0.171 ms/ct</span></div>
              <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;"><div class="bh-bar" data-w="24" style="width: 0; height: 100%; background: var(--solution-accent); transition: width 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s;"></div></div>
            </div>
          </div>
        </div>

        <!-- Line chart -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
            <div>
              <p class="tag" style="color: var(--text-tertiary); margin-bottom: 4px;">How decryption scales with batch size</p>
              <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">Drag across the chart to inspect.</p>
            </div>
            <div style="display: flex; gap: 14px; font-family: var(--mono); font-size: 11px;">
              <span style="display: inline-flex; align-items:center; gap: 6px;"><span style="width: 14px; height: 2px; background: var(--problem-accent);"></span>PFE precompute</span>
              <span style="display: inline-flex; align-items:center; gap: 6px;"><span style="width: 14px; height: 2px; background: var(--solution-accent);"></span>BTX precompute</span>
            </div>
          </div>
          <svg id="bench-chart" viewBox="0 0 640 280" style="width: 100%; display: block;"></svg>
          <div id="bench-readout" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 12px; padding-top: 14px; border-top: 1px solid var(--border);"></div>
          <p style="font-family: var(--mono); font-size: 10.5px; color: var(--text-tertiary); margin-top: 16px; line-height: 1.6;">Intel Xeon Platinum 8488C (3.8 GHz), <span class="mono">blst</span> over BLS12-381 with AVX-512, Clang 21.1.8. Per-ciphertext from BTX Table 4; totals from the abstract.</p>
        </div>
      </div>
      <style>@media (max-width: 780px) { .bench-head { grid-template-columns: 1fr !important; } }</style>
    </section>
  `;
  const revealEl = document.getElementById('bench-reveal');
  registerReveal(revealEl);

  // bars animate in on reveal
  const barIo = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        revealEl.querySelectorAll('.bh-bar').forEach(b => {
          b.style.width = b.dataset.w + '%';
        });
        barIo.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  barIo.observe(revealEl);

  // --- Line chart ---
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const chart = document.getElementById('bench-chart');
  const readout = document.getElementById('bench-readout');
  const W = 640, H = 280;
  const padL = 56, padR = 20, padT = 20, padB = 44;
  const cw = W - padL - padR;
  const ch = H - padT - padB;

  const bMin = ROWS[0].b, bMax = ROWS[ROWS.length - 1].b;
  const yMax = 1.8;
  const x = b => padL + Math.log2(b / bMin) / Math.log2(bMax / bMin) * cw;
  const y = v => padT + ch - (v / yMax) * ch;

  const el = (n, a = {}) => {
    const e = document.createElementNS(SVG_NS, n);
    for (const k in a) e.setAttribute(k, a[k]);
    return e;
  };

  function line(data, color, dash) {
    const d = data.map((r, i) => `${i === 0 ? 'M' : 'L'}${x(r.b)},${y(r.val)}`).join(' ');
    const p = el('path', { d, fill: 'none', stroke: color, 'stroke-width': 2.5, 'stroke-linecap': 'round' });
    if (dash) p.setAttribute('stroke-dasharray', dash);
    return p;
  }

  function drawChart() {
    chart.innerHTML = '';
    // grid
    [0, 0.5, 1.0, 1.5].forEach(v => {
      chart.appendChild(el('line', { x1: padL, x2: padL + cw, y1: y(v), y2: y(v), stroke: '#ede8e1' }));
      const t = el('text', { x: padL - 8, y: y(v) + 3, 'text-anchor': 'end', 'font-family': 'IBM Plex Mono', 'font-size': 10, fill: '#8a7d6f' });
      t.textContent = v.toFixed(1);
      chart.appendChild(t);
    });
    const yLbl = el('text', { x: 16, y: padT + ch / 2, 'text-anchor': 'middle', transform: `rotate(-90 16 ${padT + ch / 2})`, 'font-family': 'IBM Plex Mono', 'font-size': 10, fill: '#8a7d6f' });
    yLbl.textContent = 'ms / ct';
    chart.appendChild(yLbl);

    // x-axis
    ROWS.forEach(r => {
      chart.appendChild(el('line', { x1: x(r.b), x2: x(r.b), y1: padT + ch, y2: padT + ch + 4, stroke: '#c4b8a8' }));
      const t = el('text', { x: x(r.b), y: padT + ch + 16, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono', 'font-size': 10, fill: '#8a7d6f' });
      t.textContent = r.b;
      chart.appendChild(t);
    });
    const xLbl = el('text', { x: padL + cw / 2, y: H - 10, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono', 'font-size': 10, fill: '#8a7d6f' });
    xLbl.textContent = 'Batch size B (log scale)';
    chart.appendChild(xLbl);

    // fill between
    const fillPath = ROWS.map((r, i) => `${i === 0 ? 'M' : 'L'}${x(r.b)},${y(r.pfePre)}`).join(' ')
      + ' ' + ROWS.slice().reverse().map(r => `L${x(r.b)},${y(r.btxPre)}`).join(' ') + ' Z';
    chart.appendChild(el('path', { d: fillPath, fill: 'var(--solution-accent)', opacity: 0.08 }));

    // lines
    chart.appendChild(line(ROWS.map(r => ({ b: r.b, val: r.pfePre })), '#c4653a'));
    chart.appendChild(line(ROWS.map(r => ({ b: r.b, val: r.btxPre })), '#2a7d6a'));

    // dots
    ROWS.forEach(r => {
      chart.appendChild(el('circle', { cx: x(r.b), cy: y(r.pfePre), r: 4, fill: '#fdf6ef', stroke: '#c4653a', 'stroke-width': 2 }));
      chart.appendChild(el('circle', { cx: x(r.b), cy: y(r.btxPre), r: 4, fill: '#f0f7f5', stroke: '#2a7d6a', 'stroke-width': 2 }));
    });

    // hover line + readout
    const hoverLine = el('line', { x1: -1, x2: -1, y1: padT, y2: padT + ch, stroke: '#1a1714', 'stroke-width': 1, opacity: 0.25, 'pointer-events': 'none' });
    chart.appendChild(hoverLine);

    const hit = el('rect', { x: padL, y: padT, width: cw, height: ch, fill: 'transparent' });
    chart.appendChild(hit);

    function closest(px) {
      let best = ROWS[0], bd = Infinity;
      ROWS.forEach(r => { const d = Math.abs(x(r.b) - px); if (d < bd) { bd = d; best = r; } });
      return best;
    }

    function showRow(r) {
      hoverLine.setAttribute('x1', x(r.b));
      hoverLine.setAttribute('x2', x(r.b));
      hoverLine.setAttribute('opacity', 0.25);
      const speedup = (r.pfePre / r.btxPre).toFixed(2);
      readout.innerHTML = `
        <div><p style="font-family: var(--mono); font-size:10px; color:var(--text-tertiary); margin:0 0 2px;">B</p><p class="mono" style="font-size:15px; font-weight:600; margin:0;">${r.b}</p></div>
        <div><p style="font-family: var(--mono); font-size:10px; color:var(--problem-accent-strong); margin:0 0 2px;">PFE precompute</p><p class="mono" style="font-size:15px; font-weight:600; margin:0; color:var(--text-primary);">${r.pfePre} <span style="font-size:10px; color:var(--text-tertiary);">ms/ct</span></p></div>
        <div><p style="font-family: var(--mono); font-size:10px; color:var(--solution-accent); margin:0 0 2px;">BTX precompute</p><p class="mono" style="font-size:15px; font-weight:600; margin:0; color:var(--text-primary);">${r.btxPre} <span style="font-size:10px; color:var(--text-tertiary);">ms/ct</span></p></div>
        <div><p style="font-family: var(--mono); font-size:10px; color:var(--text-tertiary); margin:0 0 2px;">Speedup</p><p class="mono" style="font-size:15px; font-weight:600; margin:0; color:var(--solution-accent);">${speedup}×</p></div>
      `;
    }
    showRow(ROWS[ROWS.length - 1]);

    hit.addEventListener('mousemove', (ev) => {
      const rect = chart.getBoundingClientRect();
      const px = (ev.clientX - rect.left) * (W / rect.width);
      showRow(closest(px));
    });
    hit.addEventListener('mouseleave', () => { hoverLine.setAttribute('opacity', 0); showRow(ROWS[ROWS.length - 1]); });
  }

  // animate chart reveal
  const chartIo = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        drawChart();
        // animate stroke-dash
        chart.querySelectorAll('path[fill="none"]').forEach(p => {
          const len = p.getTotalLength();
          p.style.strokeDasharray = len;
          p.style.strokeDashoffset = len;
          p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1200, easing: 'cubic-bezier(.3,0,.2,1)', fill: 'forwards' });
        });
        chartIo.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  chartIo.observe(chart);

  drawChart();
})();
