/**
 * Spam MEV equilibrium model
 * Based on "Blockspace Under Pressure" (Category Labs, 2025)
 * Paper: https://arxiv.org/abs/2604.00234
 *
 * Linear demand: D(g) = D0 - beta * g
 * Competitive equilibrium: spam enters until zero-profit condition holds
 */

export interface ModelParams {
  D0: number; // demand intercept (max gas demanded at price 0)
  beta: number; // price sensitivity
  s: number; // gas per spam transaction
  r0: number; // base MEV opportunity value
  gmin: number; // minimum gas price floor
}

export const DEFAULTS: ModelParams = {
  D0: 1200,
  beta: 6,
  s: 20,
  r0: 6000,
  gmin: 20,
};

export interface EquilibriumResult {
  S: number; // number of spam transactions
  spamGas: number; // total spam gas (S * s)
  g: number; // equilibrium clearing gas price
  Qu: number; // included user gas
  regime: "no-spam" | "congested" | "slack";
  Bplat: number; // slack threshold
  BnoSpam: number; // no-spam upper bound
  userWelfare: number; // Qu^2 / (2*beta)
  userWelfareNoSpam: number; // counterfactual welfare
  validatorRevenue: number;
  spamShare: number; // spamGas / total included gas
}

/** Linear demand: gas demanded at price g */
export function demand(
  g: number,
  D0: number = DEFAULTS.D0,
  beta: number = DEFAULTS.beta
): number {
  return Math.max(0, D0 - beta * g);
}

/** Compute full spam equilibrium at a given Bmax */
export function computeEquilibrium(
  Bmax: number,
  params: ModelParams = DEFAULTS
): EquilibriumResult {
  const { D0, beta, s, r0, gmin } = params;

  // Demand at floor price
  const DgMin = demand(gmin, D0, beta);

  // Slack regime spam volume
  const rSlack = (r0 * DgMin) / D0;
  const SSlack = Math.max(0, rSlack / (s * gmin));
  const Bplat = DgMin + SSlack * s;

  // No-spam threshold: below this Bmax, fees are too high for spam
  const BnoSpam = (s * D0 * D0) / (r0 * beta + s * D0);

  // Counterfactual (no-spam) values
  const Qu0 = Math.min(Math.max(0, Bmax), DgMin);
  const g0 = Bmax >= DgMin ? gmin : Math.max(gmin, (D0 - Bmax) / beta);
  const welfareNoSpam = (Qu0 * Qu0) / (2 * beta);

  const base = { Bplat, BnoSpam, userWelfareNoSpam: welfareNoSpam };

  // --- Regime 1: No Spam ---
  if (Bmax <= BnoSpam || Bmax <= 0) {
    const Qu = Math.max(0, Qu0);
    const w = (Qu * Qu) / (2 * beta);
    return {
      S: 0,
      spamGas: 0,
      g: Bmax <= 0 ? D0 / beta : g0,
      Qu,
      regime: "no-spam",
      userWelfare: w,
      validatorRevenue: g0 * Qu,
      spamShare: 0,
      ...base,
    };
  }

  // --- Regime 3: Slack ---
  if (Bmax >= Bplat) {
    const w = (DgMin * DgMin) / (2 * beta);
    const totalGas = DgMin + SSlack * s;
    return {
      S: SSlack,
      spamGas: SSlack * s,
      g: gmin,
      Qu: DgMin,
      regime: "slack",
      userWelfare: w,
      validatorRevenue: gmin * totalGas,
      spamShare: totalGas > 0 ? (SSlack * s) / totalGas : 0,
      ...base,
    };
  }

  // --- Regime 2: Congested ---
  // Block full: Qu + s*S = Bmax
  // Zero-profit: r0 * Qu / (D0 * S) = s * (D0 - Qu) / beta
  // Solve for total spam gas x = s*S via quadratic:
  // D0*x^2 + [D0*(D0-Bmax) + beta*r0]*x - beta*r0*Bmax = 0
  const a = D0;
  const b = D0 * (D0 - Bmax) + beta * r0;
  const c = -beta * r0 * Bmax;
  const disc = b * b - 4 * a * c;

  if (disc < 0) {
    const Qu = Qu0;
    const w = (Qu * Qu) / (2 * beta);
    return {
      S: 0,
      spamGas: 0,
      g: g0,
      Qu,
      regime: "no-spam",
      userWelfare: w,
      validatorRevenue: g0 * Qu,
      spamShare: 0,
      ...base,
    };
  }

  const x = Math.max(0, (-b + Math.sqrt(disc)) / (2 * a));
  const spamGas = Math.min(x, Bmax);
  const S = spamGas / s;
  const Qu = Math.max(0, Bmax - spamGas);
  const gStar = Math.max(gmin, (D0 - Qu) / beta);
  const w = (Qu * Qu) / (2 * beta);
  const totalGas = Qu + spamGas;

  return {
    S,
    spamGas,
    g: gStar,
    Qu,
    regime: "congested",
    userWelfare: w,
    validatorRevenue: gStar * totalGas,
    spamShare: totalGas > 0 ? spamGas / totalGas : 0,
    ...base,
  };
}

/** Marginal user share of block capacity (Proposition 3.3) */
export function marginalUserShare(
  Bmax: number,
  params: ModelParams = DEFAULTS
): number {
  const { D0, beta, s, r0 } = params;
  const eq = computeEquilibrium(Bmax, params);
  if (eq.regime === "no-spam") return 1;
  if (eq.regime === "slack") return 0;
  const term = Bmax - D0 + s + (beta * r0) / D0;
  const denom = Math.sqrt(term * term + 4 * beta * r0);
  return 0.5 * (1 - term / denom);
}

/** Approximate PFO effect on spam volume */
export function computeEquilibriumPFO(
  Bmax: number,
  v: number,
  params: ModelParams = DEFAULTS
): EquilibriumResult {
  const base = computeEquilibrium(Bmax, params);
  if (base.S === 0 || v <= 0) return base;

  // PFO reduces spam proportional to user priority participation
  // From paper Figure 8: at v=1 spam ~33% of random, at v=0.5 ~64%
  const factor = Math.max(0.1, 1 - 0.7 * v);
  const newSpamGas = base.spamGas * factor;
  const newS = newSpamGas / params.s;

  const DgMin = demand(params.gmin, params.D0, params.beta);
  const Qu = Math.min(
    Math.max(0, Bmax - newSpamGas),
    DgMin
  );
  const g = Math.max(params.gmin, (params.D0 - Qu) / params.beta);
  const totalGas = Qu + newSpamGas;

  return {
    ...base,
    S: newS,
    spamGas: newSpamGas,
    g,
    Qu,
    userWelfare: (Qu * Qu) / (2 * params.beta),
    validatorRevenue: g * totalGas,
    spamShare: totalGas > 0 ? newSpamGas / totalGas : 0,
  };
}

/** Precompute sweep data for charts */
export function computeSweep(
  params: ModelParams = DEFAULTS,
  maxBmax: number = 2000,
  step: number = 10
): EquilibriumResult[] {
  const results: EquilibriumResult[] = [];
  for (let b = 0; b <= maxBmax; b += step) {
    results.push(computeEquilibrium(b, params));
  }
  return results;
}
