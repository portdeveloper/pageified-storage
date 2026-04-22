// Comparison table: animated property reveal
(function () {
  const root = document.getElementById('comparison-root');
  const SCHEMES = [
    { name: 'Batched IBE',         ref: '[2]',  cr: 'mixed', ep: 'no',  decrypt: 'O(B log² B) / O(Bmax log Bmax)', ctxt: '3·|G₁| + |G_T|' },
    { name: 'Fernando et al. (TrX)', ref: '[15]', cr: 'yes',   ep: 'yes', decrypt: 'O(B log² B)',                   ctxt: '2·|G₁| + |G_T|' },
    { name: 'BEAT-MEV',            ref: '[10]', cr: 'no',    ep: 'yes', decrypt: 'O(B²)',                          ctxt: '3·|G₁| + |G_T|' },
    { name: 'Gong et al.',         ref: '[19]', cr: 'mixed', ep: 'no',  decrypt: 'O(B log² B) / O(Bmax log Bmax)', ctxt: '2·|G₁| + |G_T|' },
    { name: 'BEAT++ (Agarwal)',    ref: '[1]',  cr: 'no',    ep: 'yes', decrypt: 'O(Bmax log Bmax)',               ctxt: '2·|G₁| + |G_T|' },
    { name: 'PFE (Boneh et al.)',  ref: '[7]',  cr: 'yes',   ep: 'yes', decrypt: 'O(Bmax log Bmax)',               ctxt: '2·|G₁| + |G_T|' },
    { name: 'BTX',                              cr: 'yes',   ep: 'yes', decrypt: 'O(B log B)',                     ctxt: '|G₁| + |G_T|',    highlight: true },
  ];

  const mark = (v) => {
    if (v === 'yes') return `<span style="display:inline-flex; width:22px; height:22px; border-radius:50%; background:color-mix(in oklab, var(--solution-accent) 15%, transparent); color:var(--solution-accent); align-items:center; justify-content:center; font-weight:600; font-size:12px;">✓</span>`;
    if (v === 'no')  return `<span style="display:inline-flex; width:22px; height:22px; border-radius:50%; background:color-mix(in oklab, var(--problem-accent) 15%, transparent); color:var(--problem-accent-strong); align-items:center; justify-content:center; font-weight:600; font-size:12px;">✗</span>`;
    return `<span style="display:inline-flex; padding: 2px 8px; border-radius:10px; background: var(--border); color: var(--text-tertiary); font-family: var(--mono); font-size: 9px;">✓/✗</span>`;
  };

  root.innerHTML = `
    <section class="alt">
      <div class="wrap reveal" id="cmp-reveal">
        <h2 style="margin-bottom: 16px;">Every other BTE scheme trades off</h2>
        <p class="lede" style="margin-bottom: 28px;">Four properties each matter for a usable encrypted mempool. Every prior scheme drops at least one. Hover a column to see why it's needed.</p>

        <div style="overflow-x: auto; border-radius: 14px; border: 1px solid var(--border); background: var(--surface-elevated);">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; min-width: 720px;">
            <thead>
              <tr style="background: var(--surface); border-bottom: 1px solid var(--border);">
                <th style="text-align:left; padding: 14px 16px; font-family: var(--mono); font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color: var(--text-tertiary); font-weight:500;">Scheme</th>
                <th data-prop="cr" class="prop-head" style="text-align:center; padding: 14px 12px; font-family: var(--mono); font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color: var(--text-tertiary); font-weight:500; cursor:help;">Collision-free</th>
                <th data-prop="ep" class="prop-head" style="text-align:center; padding: 14px 12px; font-family: var(--mono); font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color: var(--text-tertiary); font-weight:500; cursor:help;">Epochless</th>
                <th data-prop="decrypt" class="prop-head" style="text-align:left; padding: 14px 12px; font-family: var(--mono); font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color: var(--text-tertiary); font-weight:500; cursor:help;">Decryption cost</th>
                <th data-prop="ctxt" class="prop-head" style="text-align:left; padding: 14px 16px; font-family: var(--mono); font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color: var(--text-tertiary); font-weight:500; cursor:help;">Ciphertext</th>
              </tr>
            </thead>
            <tbody id="cmp-body">
              ${SCHEMES.map((s, i) => `
                <tr data-row="${i}" class="${s.highlight ? 'btx-row' : ''}" style="${s.highlight ? 'background: var(--solution-bg); border-top: 2px solid var(--solution-accent); border-bottom: 2px solid var(--solution-accent);' : i > 0 ? 'border-top: 1px solid var(--border-soft);' : ''}">
                  <td style="padding: 12px 16px;">
                    <span style="${s.highlight ? 'font-weight: 600; color: var(--solution-accent);' : 'color: var(--text-primary);'}">${s.name}</span>
                    ${s.ref ? `<span style="font-family: var(--mono); font-size:10px; color: var(--text-tertiary); margin-left: 6px;">${s.ref}</span>` : ''}
                  </td>
                  <td data-prop="cr" style="text-align:center; padding: 12px; transition: background 0.2s;">${mark(s.cr)}</td>
                  <td data-prop="ep" style="text-align:center; padding: 12px; transition: background 0.2s;">${mark(s.ep)}</td>
                  <td data-prop="decrypt" style="padding: 12px; font-family: var(--mono); font-size: 12px; color: var(--text-secondary); transition: background 0.2s;">${s.decrypt}</td>
                  <td data-prop="ctxt" style="padding: 12px 16px; font-family: var(--mono); font-size: 12px; color: var(--text-secondary); transition: background 0.2s;">${s.ctxt}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div id="prop-explainer" style="margin-top: 18px; padding: 14px 18px; background: var(--surface-elevated); border: 1px solid var(--border); border-radius: 10px; min-height: 48px; transition: all 0.2s;">
          <p style="font-family: var(--mono); font-size: 11px; color: var(--text-tertiary); margin: 0;">Hover a property to learn why it matters.</p>
        </div>

        <p style="font-family: var(--mono); font-size: 11px; color: var(--text-tertiary); margin-top: 16px; line-height: 1.6;">B = actual batch size, Bmax = maximum supported. |G₁|, |G_T| are group element sizes (BLS12-381). Adapted from BTX, Table 1.</p>
      </div>
    </section>
  `;
  registerReveal(document.getElementById('cmp-reveal'));

  const EXPLAIN = {
    cr: { label: 'Collision-free', body: 'Two users can independently encrypt without coordinating on an index. No censorship via index collision.' },
    ep: { label: 'Epochless', body: "A ciphertext isn't bound to a specific block. If it isn't included in block N, it rolls over to N+1." },
    decrypt: { label: 'Decryption cost', body: 'How computation scales. O(B log B) tracks the real batch size. O(Bmax) pays for the max, always.' },
    ctxt: { label: 'Ciphertext size', body: 'Bytes on the wire. Smaller ciphertexts mean less mempool bandwidth and faster propagation.' },
  };
  const exp = document.getElementById('prop-explainer');
  document.querySelectorAll('.prop-head').forEach(h => {
    const prop = h.dataset.prop;
    const setActive = (on) => {
      document.querySelectorAll(`[data-prop="${prop}"]`).forEach(c => {
        c.style.background = on ? 'color-mix(in oklab, var(--solution-accent) 8%, transparent)' : '';
      });
      if (on) {
        exp.innerHTML = `<p class="tag" style="margin-bottom: 4px;">${EXPLAIN[prop].label}</p><p style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.55;">${EXPLAIN[prop].body}</p>`;
      } else {
        exp.innerHTML = `<p style="font-family: var(--mono); font-size: 11px; color: var(--text-tertiary); margin: 0;">Hover a property to learn why it matters.</p>`;
      }
    };
    h.addEventListener('mouseenter', () => setActive(true));
    h.addEventListener('mouseleave', () => setActive(false));
  });
})();
