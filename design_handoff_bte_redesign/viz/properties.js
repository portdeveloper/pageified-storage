// v2
// Four properties section — refined mini-vizes
(function () {
  const root = document.getElementById('properties-root');
  root.innerHTML = `
    <section>
      <div class="wrap reveal" id="props-reveal">
        <h2 style="margin-bottom: 16px;">Four properties, all at once</h2>
        <p class="lede" style="margin-bottom: 32px;">BTX is the first BTE scheme with all four. Encryption takes no coordination, setup is one-time, and decryption cost scales with the actual batch.</p>
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px;" class="props-grid">
          <div class="card" id="p1"></div>
          <div class="card" id="p2"></div>
          <div class="card" id="p3"></div>
          <div class="card" id="p4"></div>
        </div>
      </div>
      <style>@media (max-width: 780px) { .props-grid { grid-template-columns: 1fr !important; } }</style>
    </section>
  `;
  registerReveal(document.getElementById('props-reveal'));

  // ----- P1: Compact (animated bytes comparison) -----
  document.getElementById('p1').innerHTML = `
    <p class="tag">Property 1</p>
    <h3 style="margin: 6px 0 10px;">Compact</h3>
    <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.55; margin-bottom: 18px;">Ciphertext is the same size as plain ElGamal: one source element plus one target element. Every prior BTE scheme uses at least two source elements.</p>
    <div id="p1-bars" style="display: flex; flex-direction: column; gap: 12px;"></div>
    <p style="font-family: var(--mono); font-size: 10.5px; color: var(--text-tertiary); margin-top: 14px;">With BLS12-381: |G₁| = 48B, |G_T| = 576B</p>
  `;
  const p1 = document.getElementById('p1-bars');
  const SCHEMES_C = [
    { name: 'BEAT-MEV / Batched IBE', parts: ['G₁', 'G₁', 'G₁', 'G_T'], bytes: 3*48 + 576 },
    { name: 'TrX / BEAT++ / PFE',    parts: ['G₁', 'G₁', 'G_T'],        bytes: 2*48 + 576 },
    { name: 'BTX',                   parts: ['G₁', 'G_T'],               bytes: 48 + 576, hl: true },
  ];
  SCHEMES_C.forEach(s => {
    const row = document.createElement('div');
    row.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="font-family: var(--mono); font-size: 11px; color: ${s.hl ? 'var(--solution-accent)' : 'var(--text-tertiary)'}; font-weight: ${s.hl ? 600 : 400};">${s.name}</span>
        <span style="font-family: var(--mono); font-size: 10.5px; color: var(--text-tertiary);">${s.bytes}B</span>
      </div>
      <div style="display: flex; gap: 3px;">
        ${s.parts.map(p => {
          const isT = p === 'G_T';
          const flex = isT ? 6 : 1;
          const bg = s.hl ? (isT ? 'var(--solution-accent)' : 'var(--solution-accent-light)') : (isT ? 'var(--text-tertiary)' : 'var(--border)');
          const fg = s.hl ? (isT ? 'white' : 'var(--solution-accent)') : (isT ? 'white' : 'var(--text-secondary)');
          return `<div class="p1-seg" style="flex: ${flex}; height: 28px; border-radius: 5px; background: ${bg}; color: ${fg}; display:flex; align-items:center; justify-content:center; font-family: var(--mono); font-size: 11px; font-weight: ${s.hl && !isT ? 600 : 500}; transform: scaleX(0); transform-origin: left; transition: transform 0.7s cubic-bezier(0.16,1,0.3,1);">${p}</div>`;
        }).join('')}
      </div>
    `;
    p1.appendChild(row);
  });
  const p1Io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.p1-seg').forEach((seg, i) => {
          setTimeout(() => { seg.style.transform = 'scaleX(1)'; }, i * 60);
        });
        p1Io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  p1Io.observe(p1);

  // ----- P2: Collision-free (race animation) -----
  document.getElementById('p2').innerHTML = `
    <p class="tag">Property 2</p>
    <h3 style="margin: 6px 0 10px;">Collision-free</h3>
    <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.55; margin-bottom: 18px;">A user just encrypts. Nothing to collide on → no censorship via index collision.</p>
    <div id="p2-frame"></div>
  `;
  const p2 = document.getElementById('p2-frame');
  let p2t = 0, p2stopped = false;
  function p2frame() {
    if (p2stopped) return;
    p2t = (p2t + 1) % 180;
    const stage = p2t < 90 ? 'indexed' : 'btx';
    const local = p2t < 90 ? p2t : p2t - 90;
    const alicePos = Math.min(100, local * 1.5);
    const attackPos = Math.min(100, (local + 20) * 1.5);
    const collided = stage === 'indexed' && local > 55;
    const both_ok = stage === 'btx' && local > 55;
    p2.innerHTML = `
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <button class="p2-tab" data-stage="indexed" style="flex:1; padding: 6px; border-radius: 8px; border: none; background: ${stage==='indexed'?'var(--problem-bg)':'var(--surface)'}; color: ${stage==='indexed'?'var(--problem-accent-strong)':'var(--text-tertiary)'}; font-family: var(--mono); font-size: 10px; font-weight: 600; cursor: pointer;">Indexed BTE</button>
        <button class="p2-tab" data-stage="btx" style="flex:1; padding: 6px; border-radius: 8px; border: none; background: ${stage==='btx'?'var(--solution-bg)':'var(--surface)'}; color: ${stage==='btx'?'var(--solution-accent)':'var(--text-tertiary)'}; font-family: var(--mono); font-size: 10px; font-weight: 600; cursor: pointer;">BTX</button>
      </div>
      <div style="background: ${stage==='indexed'?'var(--problem-bg)':'var(--solution-bg)'}; border: 1px solid ${stage==='indexed'?'var(--problem-accent-light)':'color-mix(in oklab, var(--solution-accent) 22%, transparent)'}; border-radius: 10px; padding: 14px; transition: all 0.3s;">
        ${['alice','attacker'].map((who, idx) => {
          const pos = idx === 0 ? alicePos : attackPos;
          const color = idx === 0 ? '#3b7dd8' : '#c4653a';
          const bg = idx === 0 ? '#edf3fc' : '#fdf6ef';
          const ctLabel = idx === 0 ? 'ct_A' : (stage === 'indexed' ? 'ct_attack' : 'ct_X');
          const faded = stage === 'indexed' && idx === 0 && collided;
          return `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: ${idx === 0 ? '10px' : '0'};">
              <span style="font-family: var(--mono); font-size: 10px; font-weight: 600; color: ${color}; background: ${bg}; padding: 3px 8px; border-radius: 999px; min-width: 62px; text-align: center;">${who}</span>
              <div style="flex: 1; height: 22px; background: var(--surface); border-radius: 4px; position: relative; overflow: hidden;">
                <div style="position: absolute; left: ${pos}%; top: 50%; transform: translate(-50%, -50%); padding: 2px 6px; border-radius: 3px; background: ${color}; color: white; font-family: var(--mono); font-size: 9.5px; opacity: ${faded ? 0.2 : 1}; transition: opacity 0.3s;">${ctLabel}</div>
              </div>
              <span style="font-family: var(--mono); font-size: 9.5px; color: var(--text-tertiary); width: 36px;">${stage === 'indexed' ? 'idx 7' : 'encrypt'}</span>
            </div>
          `;
        }).join('')}
        <p style="font-family: var(--mono); font-size: 11px; font-weight: 600; margin: 12px 0 0; color: ${stage === 'indexed' ? 'var(--problem-accent-strong)' : 'var(--solution-accent)'}; opacity: ${collided || both_ok ? 1 : 0.3}; transition: opacity 0.3s;">
          ${stage === 'indexed' ? '✗ Alice tx censored' : '✓ No index · no collision surface'}
        </p>
      </div>
    `;
    p2.querySelectorAll('.p2-tab').forEach(b => {
      b.addEventListener('click', () => { p2t = b.dataset.stage === 'indexed' ? 0 : 90; });
    });
    setTimeout(() => requestAnimationFrame(p2frame), 60);
  }
  p2frame();

  // ----- P3: Epochless (rolling ct) -----
  document.getElementById('p3').innerHTML = `
    <p class="tag">Property 3</p>
    <h3 style="margin: 6px 0 10px;">Epochless</h3>
    <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.55; margin-bottom: 18px;">A ciphertext isn't bound to a block. If it isn't included in N, it stays valid for N+1 and beyond.</p>
    <div id="p3-frame"></div>
  `;
  const p3 = document.getElementById('p3-frame');
  let p3t = 0, p3stopped = false;
  function p3frame() {
    if (p3stopped) return;
    p3t = (p3t + 1) % 150;
    const phase = p3t < 75 ? 'epoch' : 'btx';
    const local = phase === 'epoch' ? p3t : p3t - 75;
    const pos = Math.min(100, local * 1.8);
    const nextBlock = local > 50;
    p3.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${[
          { label: 'Epoch-bound BTE', key: 'epoch', active: phase === 'epoch' },
          { label: 'BTX', key: 'btx', active: phase === 'btx' }
        ].map(row => {
          const blockBg = row.key === 'epoch' ? 'var(--problem-bg)' : 'var(--solution-bg)';
          const ctColor = row.key === 'epoch' ? '#c4653a' : '#2a7d6a';
          const showCt = row.active;
          const ctX = row.active ? pos : 0;
          const expired = row.key === 'epoch' && row.active && nextBlock;
          return `
            <div style="opacity: ${row.active ? 1 : 0.35}; transition: opacity 0.3s;">
              <p class="tag" style="color: ${row.key==='epoch'?'var(--problem-accent-strong)':'var(--solution-accent)'}; margin-bottom: 6px;">${row.label}</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; position: relative;">
                <div style="background: ${blockBg}; border: 1px solid var(--border); border-radius: 8px; padding: 12px; position: relative; min-height: 56px;">
                  <p style="font-family: var(--mono); font-size: 9px; color: var(--text-tertiary); text-transform: uppercase; margin: 0 0 4px;">Block N</p>
                  <div style="font-family: var(--mono); font-size: 10px; color: ${ctColor}; opacity: ${row.active && !nextBlock ? 1 : 0.2}; transition: opacity 0.3s;">${row.key === 'epoch' ? 'ct tagged N' : 'ct'}</div>
                </div>
                <div style="background: ${blockBg}; border: 1px solid var(--border); border-radius: 8px; padding: 12px; position: relative; min-height: 56px;">
                  <p style="font-family: var(--mono); font-size: 9px; color: var(--text-tertiary); text-transform: uppercase; margin: 0 0 4px;">Block N+1</p>
                  <div style="font-family: var(--mono); font-size: 10px; color: ${expired ? 'var(--problem-accent-strong)' : ctColor}; opacity: ${nextBlock && row.active ? 1 : 0}; transition: opacity 0.3s; font-weight: 600;">${expired ? '✗ expired' : '✓ still valid'}</div>
                </div>
                <div style="position: absolute; left: calc(50% - 9px); top: 50%; transform: translateY(-50%); font-family: var(--mono); font-size: 12px; color: var(--text-tertiary);">→</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    setTimeout(() => requestAnimationFrame(p3frame), 80);
  }
  p3frame();

  // ----- P4: Fast scaling (animated blocks) -----
  document.getElementById('p4').innerHTML = `
    <p class="tag">Property 4</p>
    <h3 style="margin: 6px 0 10px;">Fast · dynamic batch sizing</h3>
    <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.55; margin-bottom: 16px;">Decryption is <span class="mono">O(B log B)</span> where B is the <strong>actual</strong> batch. Prior schemes pay for the maximum Bmax, always.</p>
    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
      <span style="font-family: var(--mono); font-size: 10.5px; color: var(--text-tertiary);">Actual batch B</span>
      <span id="p4-val" class="mono" style="font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums;">128</span>
    </div>
    <input id="p4-slider" type="range" min="16" max="512" step="16" value="128" style="width: 100%; accent-color: var(--solution-accent);">
    <div style="display: flex; justify-content: space-between; font-family: var(--mono); font-size: 9.5px; color: var(--text-tertiary); margin-top: 2px; margin-bottom: 16px;"><span>16</span><span>Bmax = 512</span></div>
    <div id="p4-viz"></div>
    <p style="font-family: var(--mono); font-size: 10.5px; color: var(--text-tertiary); margin-top: 14px; line-height: 1.55;">PFE / BEAT++ pay for <span id="p4-prior">90</span>% max every block. BTX pays only for the actual batch.</p>
  `;
  const p4Slider = document.getElementById('p4-slider');
  const p4Viz = document.getElementById('p4-viz');
  const p4Val = document.getElementById('p4-val');
  const p4Prior = document.getElementById('p4-prior');
  function renderP4() {
    const B = Number(p4Slider.value);
    const Bmax = 512;
    p4Val.textContent = B;
    const actualCost = B * Math.log2(Math.max(2, B));
    const maxCost = Bmax * Math.log2(Bmax);
    const actualPct = (actualCost / maxCost) * 100;
    p4Prior.textContent = Math.round((1 - actualPct / 100) * 100);
    p4Viz.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div>
          <div style="display: flex; justify-content: space-between; font-family: var(--mono); font-size: 10.5px; margin-bottom: 4px;">
            <span style="color: var(--problem-accent-strong); font-weight: 600;">Prior · O(Bmax log Bmax)</span>
            <span style="color: var(--text-secondary);">${maxCost.toFixed(0)} units</span>
          </div>
          <div style="height: 22px; background: var(--border); border-radius: 5px; overflow: hidden; position: relative;">
            <div style="position:absolute; inset: 0; background: repeating-linear-gradient(45deg, var(--problem-accent-light), var(--problem-accent-light) 6px, var(--problem-bg) 6px, var(--problem-bg) 12px);"></div>
            <div style="position: absolute; left: 0; top:0; bottom:0; width: 100%; background: var(--problem-accent); opacity: 0.85;"></div>
          </div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; font-family: var(--mono); font-size: 10.5px; margin-bottom: 4px;">
            <span style="color: var(--solution-accent); font-weight: 600;">BTX · O(B log B)</span>
            <span style="color: var(--text-secondary);">${actualCost.toFixed(0)} units</span>
          </div>
          <div style="height: 22px; background: var(--border); border-radius: 5px; overflow: hidden;">
            <div style="height: 100%; width: ${actualPct}%; background: var(--solution-accent); transition: width 0.25s cubic-bezier(0.2,0.8,0.2,1);"></div>
          </div>
        </div>
      </div>
    `;
  }
  p4Slider.addEventListener('input', renderP4);
  window.__bte.subscribe((s) => { p4Slider.value = s.B; renderP4(); });
  renderP4();
})();
