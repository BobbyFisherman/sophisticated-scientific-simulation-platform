/* =====================================================================================
   WORLDFORGE PHYSICS ENGINE
   All models are published, first-order scientific approximations, calibrated so that
   Earth, Mars and Venus reproduce their measured values. Sources are cited inline and
   collected on the /data page.
   ===================================================================================== */

// ---------------------------------------------------------------- constants
export const SOLAR_CONSTANT = 1361;            // W m^-2, mean solar flux at 1 AU (Kopp & Lean 2011)
export const SIGMA = 5.670374419e-8;           // Stefan–Boltzmann constant, W m^-2 K^-4 (CODATA 2018)
export const G = 6.6743e-11;                   // gravitational constant, m^3 kg^-1 s^-2
export const K_B = 1.380649e-23;               // Boltzmann constant, J K^-1
export const AMU = 1.6605390666e-27;           // atomic mass unit, kg
export const AU_M = 1.495978707e11;            // metres per AU (IAU 2012)
export const MSUN = 1.98847e30;                // kg
export const RSUN = 6.957e8;                   // m
export const MEARTH = 5.9722e24;               // kg
export const REARTH = 6.371e6;                 // m
export const YEAR_S = 365.25 * 86400;
export const MJUP_MEARTH = 317.83;

// ---------------------------------------------------------------- user inputs
export interface SystemInputs {
  starMass: number;        // solar masses            0.08 – 3.0
  luminosity: number;      // solar luminosities      (auto-derived, user-overridable)
  semiMajor: number;       // AU                      0.01 – 5
  eccentricity: number;    //                         0 – 0.6
  planetRadius: number;    // Earth radii             0.3 – 3.5
  ironFraction: number;    // bulk iron fraction      0 – 0.65   (0.32 ≈ Earth)
  albedo: number;          // Bond albedo             0.02 – 0.8
  pressure: number;        // surface pressure, atm   1e-4 – 100 (log)
  ghgIndex: number;        // greenhouse index        0 – 5      (1.0 = modern Earth mix)
  oceanCoverage: number;   // fraction                0 – 1
  magneticMoment: number;  // relative to Earth       0 – 2
}

export const DEFAULT_INPUTS: SystemInputs = {
  starMass: 1.0,
  luminosity: massToLuminosity(1.0),
  semiMajor: 1.0,
  eccentricity: 0.017,
  planetRadius: 1.0,
  ironFraction: 0.32,
  albedo: 0.30,
  pressure: 1.0,
  ghgIndex: 1.0,
  oceanCoverage: 0.71,
  magneticMoment: 1.0,
};

// ---------------------------------------------------------------- stellar model
/** Mass–luminosity relation for main-sequence stars (Duric 2004; Eker et al. 2015). */
export function massToLuminosity(M: number): number {
  if (M < 0.43) return 0.23 * Math.pow(M, 2.3);
  if (M < 2.0) return Math.pow(M, 4);
  return 1.4 * Math.pow(M, 3.5);
}

/** Effective temperature from zero-age main-sequence interpolation (Pecaut & Mamajek 2013 tables). */
const MSTARS = [0.08, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.5, 1.7, 2.0, 2.5, 3.0];
const TSTARS = [2650, 2900, 3150, 3300, 3450, 3650, 3850, 4200, 4450, 5050, 5400, 5778, 6050, 6400, 6650, 7200, 7800, 9200, 11300, 13200];

export function massToTeff(M: number): number {
  const lm = Math.log(M);
  if (lm <= Math.log(MSTARS[0])) return TSTARS[0];
  if (lm >= Math.log(MSTARS[MSTARS.length - 1])) return TSTARS[TSTARS.length - 1];
  for (let i = 0; i < MSTARS.length - 1; i++) {
    if (M >= MSTARS[i] && M <= MSTARS[i + 1]) {
      const t = (lm - Math.log(MSTARS[i])) / (Math.log(MSTARS[i + 1]) - Math.log(MSTARS[i]));
      return TSTARS[i] + t * (TSTARS[i + 1] - TSTARS[i]);
    }
  }
  return 5778;
}

/** Stellar radius, MS approximation R ∝ M^0.8 (Demircan & Kahraman 1991). */
export function massToStarRadius(M: number): number {
  return Math.pow(M, 0.8);
}

/** Main-sequence lifetime, t ≈ 10 Gyr × M/L (Hansen & Kawaler 1994). */
export function mainSequenceLifetime(M: number, L: number): number {
  return 10 * (M / Math.max(L, 1e-6));
}

export function spectralClass(T: number): string {
  if (T < 2800) return "M7–M9";
  if (T < 3400) return "M4–M7";
  if (T < 3900) return "M0–M3";
  if (T < 5300) return "K0–K9";
  if (T < 6000) return "G0–G8";
  if (T < 7200) return "F0–F9";
  if (T < 9700) return "A0–A9";
  return "B0–B5";
}

/** Approximate blackbody colour of the star (Tanner Helland algorithm, piecewise 1000–40000 K). */
export function starColor(T: number): string {
  const t = T / 100;
  let r: number, g: number, b: number;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  }
  if (t >= 66) b = 255;
  else if (t <= 19) b = 0;
  else b = 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
}

// ---------------------------------------------------------------- habitable zone
/*  Kopparapu et al. (2013, ApJ 765:131), Table 2.
    S_eff = S_eff⊙ + a·T* + b·T*² + c·T*³ + d·T*⁴,  T* = T_eff − 5780 K
    Boundary distance d = sqrt(L / S_eff) AU                                       */
export interface KCoeff { s0: number; a: number; b: number; c: number; d: number }
export const KOPP: Record<string, KCoeff> = {
  recentVenus: { s0: 1.7760, a: 2.136e-4, b: 2.533e-8, c: -1.332e-11, d: -3.097e-15 },
  runawayGH:   { s0: 1.1070, a: 1.332e-4, b: 1.580e-8, c: -8.308e-12, d: -1.931e-15 },
  maximumGH:   { s0: 0.3560, a: 6.171e-5, b: 1.698e-9, c: -3.198e-12, d: -5.575e-16 },
  earlyMars:   { s0: 0.3207, a: 5.547e-5, b: 1.526e-9, c: -2.874e-12, d: -5.011e-16 },
};

function sEff(T: number, k: KCoeff): number {
  const t = T - 5780;
  return k.s0 + k.a * t + k.b * t * t + k.c * t * t * t + k.d * t * t * t * t;
}

export interface HZBounds {
  recentVenus: number; runawayGH: number; maximumGH: number; earlyMars: number;
}
export function hzBounds(L: number, T: number): HZBounds {
  const d = (s: number) => Math.sqrt(L / s);
  return {
    recentVenus: d(sEff(T, KOPP.recentVenus)),
    runawayGH: d(sEff(T, KOPP.runawayGH)),
    maximumGH: d(sEff(T, KOPP.maximumGH)),
    earlyMars: d(sEff(T, KOPP.earlyMars)),
  };
}

// ---------------------------------------------------------------- temperatures
/** Equilibrium temperature (Stefan–Boltzmann energy balance): T_eq = 278.4·S^¼·(1−A)^¼ K, S in Earth flux units. */
export function equilibriumTemp(S: number, albedo: number): number {
  return 278.4 * Math.pow(Math.max(S, 1e-6), 0.25) * Math.pow(1 - albedo, 0.25);
}

/** Infrared optical depth: τ = 0.84 · (p/p⊕)^0.95 · (0.4 + 0.6·g^1.15). Calibrated to Earth (τ≈0.84, ΔT≈33 K). */
export function opticalDepth(pressure: number, ghg: number): number {
  return 0.84 * Math.pow(Math.max(pressure, 1e-4), 0.95) * (0.4 + 0.6 * Math.pow(Math.max(ghg, 0.001), 1.15));
}

/** Grey (leaky) atmosphere surface temperature: T_s = T_eq · (1 + 3τ/4)^¼  (Pierrehumbert 2010, Ch. 3). */
export function surfaceTemp(Teq: number, tau: number): number {
  return Teq * Math.pow(1 + 0.75 * tau, 0.25);
}

/** Boiling point of water via integrated Clausius–Clapeyron (ΔH_vap = 2.257e6 J/kg, R_v = 461.5 J/kg/K). */
export function boilingPoint(pAtm: number): number {
  const p = Math.max(pAtm, 1e-5);
  return 373.15 / (1 - 0.07635 * Math.log(p));
}

// ---------------------------------------------------------------- planet structure
/*  Mass–radius relation (Chen & Kipping 2017, ApJ 834:17):
    M = R^3.58 (Terran, R ≤ 1.23 R⊕) · M = 1.436·R^1.70 (Neptunian).
    Bulk-composition multiplier shifts density with the iron fraction (Earth ≈ 0.32).  */
export function radiusToMass(R: number, iron: number): number {
  const comp = 0.6 + 1.25 * iron; // 1.0 at Earth's 32% iron
  const base = R <= 1.23 ? Math.pow(R, 3.58) : 1.436 * Math.pow(1.23, 3.58) * Math.pow(R / 1.23, 1.7);
  return base * comp;
}

export function density(M_earth: number, R_earth: number): number {
  return (M_earth / Math.pow(R_earth, 3)) * 5.514; // g cm^-3
}

export function surfaceGravity(M: number, R: number): number {
  return 9.80665 * (M / (R * R));
}

export function escapeVelocity(M: number, R: number): number {
  return 11.186 * Math.sqrt(M / R); // km s^-1
}

// ---------------------------------------------------------------- orbit
export function orbitalPeriod(a: number, Mstar: number): number {
  return Math.sqrt(Math.pow(a, 3) / Math.max(Mstar, 1e-4)); // years, Kepler's third law
}

/** Solve Kepler's equation M = E − e·sinE by Newton–Raphson. */
export function eccentricAnomaly(M: number, e: number): number {
  let E = e < 0.8 ? M : Math.PI;
  for (let i = 0; i < 8; i++) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  return E;
}

/** Tidal locking timescale, order-of-magnitude scaling after Peale (1977):
    t_lock ∝ a⁶·M_p / (M★²·R_p³), calibrated so Earth–Sun ≈ 60 Gyr, Mercury ≈ 0.2 Gyr.  */
export function tidalLockGyr(a: number, Mp: number, Rp: number, Mstar: number): number {
  return (60 * Math.pow(a, 6) * Mp) / (Math.pow(Mstar, 2) * Math.pow(Rp, 3));
}

// ---------------------------------------------------------------- observability
export function transitDepth(Rp: number, Rstar: number): number {
  return Math.pow((Rp * REARTH) / (Rstar * RSUN), 2); // fraction (×1e6 = ppm)
}
export function transitProbability(Rstar: number, a: number): number {
  return (Rstar * RSUN) / (a * AU_M);
}
/** Radial-velocity semi-amplitude (Cumming et al. 1999): K = 28.43 m/s · (M_p sin i / M_J) · P^-⅓ · M★^-⅔ / √(1−e²). */
export function rvSemiAmplitude(Mp: number, Pyr: number, Mstar: number, e: number): number {
  return (28.43 * (Mp / MJUP_MEARTH) * Math.pow(Pyr, -1 / 3) * Math.pow(Mstar, -2 / 3)) / Math.sqrt(1 - e * e);
}

// ---------------------------------------------------------------- atmospheres
/** Jeans escape parameter λ = GM_p·m/(k_B·T_exo·R_p). λ ≫ 15: retained on Gyr timescales (Catling & Kasting 2017). */
export function jeansLambda(Mp: number, Rp: number, Texo: number, amu: number): number {
  const m = amu * AMU;
  return (G * Mp * MEARTH * m) / (K_B * Texo * Rp * REARTH);
}

// ---------------------------------------------------------------- scoring
export interface Scores {
  tempFit: number;
  waterScore: number;
  atmScore: number;
  stability: number;
  retention: number;
  H: number;
}

// ---------------------------------------------------------------- full derivation
export interface Derived {
  // star
  L: number; Teff: number; starR: number; spectral: string; color: string; lifetimeGyr: number;
  // flux & orbit
  S: number; Speri: number; Sap: number; period: number; periodDays: number;
  hz: HZBounds; inConservative: boolean; inOptimistic: boolean; hzPosition: string;
  // temperature
  Teq: number; tau: number; Tsurf: number; deltaG: number; Tboil: number;
  // planet
  Mp: number; densityGcc: number; gravity: number; vesc: number;
  lockGyr: number; locked: boolean;
  // atmosphere
  Texo: number; lambdaN2: number; lambdaH2O: number; lambdaCO2: number; retention: number;
  // water
  waterState: WaterState;
  // observability
  transitPpm: number; transitProbPct: number; rvK: number;
  // scores
  esi: { radius: number; density: number; vesc: number; temp: number; global: number };
  scores: Scores;
}

export interface WaterState {
  code: "desiccated" | "unstable" | "deep-freeze" | "frozen" | "temperate" | "warm" | "stress" | "runaway";
  label: string;
  detail: string;
  tone: "ice" | "teal" | "amber" | "red" | "dim";
}

function waterState(T: number, p: number, Tb: number): WaterState {
  if (p < 0.00604) return { code: "desiccated", tone: "dim", label: "Below the triple point", detail: "At this pressure, water cannot exist as a stable liquid — it sublimes straight between ice and vapour." };
  if (Tb < 273.15) return { code: "unstable", tone: "dim", label: "Liquid water unstable", detail: `Water boils at ${Tb.toFixed(0)} K here, below its own freezing point — exposed oceans would flash to vapour.` };
  if (T < 252) return { code: "deep-freeze", tone: "ice", label: "Deep freeze", detail: "Global mean far below freezing. If oceans formed, they survive only as crusted, Europa-like seas or subsurface meltwater." };
  if (T < 273.15) return { code: "frozen", tone: "ice", label: "Frozen with niches", detail: "Below freezing on average — but substellar melt pools (“eyeball” climates) and equatorial melt seasons remain possible." };
  if (T < 300) return { code: "temperate", tone: "teal", label: "Temperate — stable oceans", detail: "Surface conditions sit squarely in the liquid-water window. This is the regime Earth occupies." };
  if (T < 320) return { code: "warm", tone: "amber", label: "Hot but habitable", detail: "Warmer than Earth — tropical worldwide. Cloud feedbacks and ice-albedo loss start to matter." };
  if (T < 373.15) return { code: "stress", tone: "amber", label: "Moist greenhouse risk", detail: "Severe heat stress. Water vapour climbs to the stratosphere where UV photolysis bleeds hydrogen to space." };
  return { code: "runaway", tone: "red", label: "Runaway greenhouse", detail: "Oceans evaporate wholesale and surface rock bakes — the pathway Venus took early in Solar history." };
}

export function derive(inp: SystemInputs): Derived {
  const L = Math.max(inp.luminosity, 1e-6);
  const Teff = massToTeff(inp.starMass);
  const starR = massToStarRadius(inp.starMass);
  const lifetimeGyr = mainSequenceLifetime(inp.starMass, L);

  const a = Math.max(inp.semiMajor, 0.005);
  const e = inp.eccentricity;
  const S = L / (a * a);
  const Speri = L / Math.pow(a * (1 - e), 2);
  const Sap = L / Math.pow(a * (1 + e), 2);
  const period = orbitalPeriod(a, inp.starMass);
  const hz = hzBounds(L, Teff);

  const Teq = equilibriumTemp(S, inp.albedo);
  const tau = opticalDepth(inp.pressure, inp.ghgIndex);
  const Tsurf = surfaceTemp(Teq, tau);
  const deltaG = Tsurf - Teq;
  const Tboil = boilingPoint(inp.pressure);

  const Mp = radiusToMass(inp.planetRadius, inp.ironFraction);
  const dens = density(Mp, inp.planetRadius);
  const grav = surfaceGravity(Mp, inp.planetRadius);
  const vesc = escapeVelocity(Mp, inp.planetRadius);

  const lockGyr = tidalLockGyr(a, Mp, inp.planetRadius, inp.starMass);
  const locked = lockGyr < 1.0;

  // XUV activity proxy for low-mass stars (Shields et al. 2016)
  const xuvFactor = inp.starMass < 0.45 ? Math.max(0.25, (inp.starMass - 0.15) / 0.3) : 1;
  const Texo = Math.max(300, 2.8 * Tsurf);
  const lambdaN2 = jeansLambda(Mp, inp.planetRadius, Texo, 28);
  const lambdaH2O = jeansLambda(Mp, inp.planetRadius, Texo, 18);
  const lambdaCO2 = jeansLambda(Mp, inp.planetRadius, Texo, 44);
  const lamScore = Math.min(1, Math.max(0, (lambdaN2 - 5) / 95));
  const magFactor = 0.55 + 0.45 * Math.tanh(inp.magneticMoment / 0.35);
  const retention = clamp01(lamScore * (0.5 + 0.5 * magFactor) * xuvFactor);

  const ws = waterState(Tsurf, inp.pressure, Tboil);

  // scores
  const tempFit = Math.exp(-Math.pow((Tsurf - 288) / 42, 2));
  let waterScore: number;
  if (ws.code === "desiccated" || ws.code === "unstable") waterScore = 0.06;
  else if (ws.code === "runaway") waterScore = 0.03;
  else if (ws.code === "deep-freeze") waterScore = 0.18 + 0.2 * inp.oceanCoverage;
  else if (ws.code === "frozen") waterScore = 0.32 + 0.3 * inp.oceanCoverage;
  else waterScore = Math.min(1, inp.oceanCoverage * 1.45 + 0.06);
  const pFit = Math.exp(-Math.pow(Math.log10(Math.max(inp.pressure, 1e-4)) / 1.1, 2));
  const atmScore = clamp01(pFit * (0.45 + 0.55 * retention));
  let stability = 1;
  if (inp.starMass < 0.2) stability *= 0.6;
  else if (inp.starMass < 0.35) stability *= 0.75;
  if (lifetimeGyr < 0.5) stability *= 0.5;
  const H = Math.round(100 * Math.pow(clamp01(tempFit), 0.4) * Math.pow(clamp01(waterScore), 0.25) * Math.pow(clamp01(atmScore), 0.2) * Math.pow(clamp01(stability), 0.15));

  // ESI (Schulze-Makuch et al. 2011) — weighted geometric mean, ref = Earth
  const esiTerm = (x: number, x0: number) => 1 - Math.abs(x - x0) / (x + x0);
  const esiR = esiTerm(inp.planetRadius, 1);
  const esiD = esiTerm(dens, 5.514);
  const esiV = esiTerm(vesc, 11.186);
  const esiT = esiTerm(Tsurf, 288);
  const w = [0.57, 1.07, 0.7, 5.58];
  const ws2 = w[0] + w[1] + w[2] + w[3];
  const esiGlobal = Math.pow(Math.pow(Math.max(esiR, 1e-6), w[0] / ws2) * Math.pow(Math.max(esiD, 1e-6), w[1] / ws2) * Math.pow(Math.max(esiV, 1e-6), w[2] / ws2) * Math.pow(Math.max(esiT, 1e-6), w[3] / ws2), 1);
  const esi = { radius: esiR, density: esiD, vesc: esiV, temp: esiT, global: esiGlobal };

  const inConservative = a >= hz.runawayGH && a <= hz.maximumGH;
  const inOptimistic = a >= hz.recentVenus && a <= hz.earlyMars;
  let hzPosition = "Beyond the optimistic outer edge";
  if (a < hz.recentVenus) hzPosition = "Interior to the optimistic inner edge";
  else if (a < hz.runawayGH) hzPosition = "Optimistic zone (Recent Venus edge)";
  else if (a <= hz.maximumGH) hzPosition = "Conservative habitable zone";
  else if (a <= hz.earlyMars) hzPosition = "Optimistic zone (Early Mars edge)";

  return {
    L, Teff, starR, spectral: spectralClass(Teff), color: starColor(Teff), lifetimeGyr,
    S, Speri, Sap, period, periodDays: period * 365.25, hz, inConservative, inOptimistic, hzPosition,
    Teq, tau, Tsurf, deltaG, Tboil,
    Mp, densityGcc: dens, gravity: grav, vesc,
    lockGyr, locked,
    Texo, lambdaN2, lambdaH2O, lambdaCO2, retention,
    waterState: ws,
    transitPpm: transitDepth(inp.planetRadius, starR) * 1e6,
    transitProbPct: transitProbability(starR, a) * 100,
    rvK: rvSemiAmplitude(Mp, period, inp.starMass, e),
    esi,
    scores: { tempFit: clamp01(tempFit), waterScore: clamp01(waterScore), atmScore, stability, retention, H },
  };
}

export function clamp01(x: number): number { return Math.max(0, Math.min(1, x)); }

// ---------------------------------------------------------------- dynamic prose
export interface Note { tone: "good" | "warn" | "bad" | "info"; text: string }

export function describe(inp: SystemInputs, d: Derived): Note[] {
  const n: Note[] = [];
  const pct = (x: number) => `${Math.round(x * 100)}%`;

  if (d.inConservative) n.push({ tone: "good", text: `Orbiting inside the conservative habitable zone — it receives ${pct(d.S)} of Earth's sunlight, between the runaway-greenhouse and maximum-greenhouse edges (Kopparapu et al. 2013).` });
  else if (d.inOptimistic) n.push({ tone: "warn", text: `Inside only the optimistic habitable zone (${d.hzPosition.toLowerCase()}). Habitability here depends on climate history, not current flux alone.` });
  else if (d.S > 1.8) n.push({ tone: "bad", text: `Irradiated at ${d.S.toFixed(2)}× Earth's sunlight — far inside the runaway-greenhouse limit. Expect catastrophic ocean loss.` });
  else n.push({ tone: "bad", text: `Only ${pct(d.S)} of Earth's sunlight arrives — beyond even the optimistic Early-Mars edge. Surface oceans would freeze.` });

  const Tc = d.Tsurf - 273.15;
  if (d.Tsurf >= 273 && d.Tsurf < 310) n.push({ tone: "good", text: `Modelled surface temperature of ${Tc.toFixed(0)}°C keeps oceans liquid on the dayside disk-wide average.` });
  else if (d.Tsurf < 273) n.push({ tone: "warn", text: `Mean surface temperature ${Tc.toFixed(0)}°C is below freezing — habitability leans on ice-albedo feedbacks, substellar melt, or subsurface seas.` });
  else n.push({ tone: "bad", text: `Mean surface temperature ${Tc.toFixed(0)}°C with ${d.deltaG.toFixed(0)} K of greenhouse warming (τ = ${d.tau.toFixed(2)}) — the moist-/runaway-greenhouse regime.` });

  if (d.locked) n.push({ tone: "warn", text: `Tidal-locking timescale ≈ ${d.lockGyr < 0.001 ? "<1 Myr" : d.lockGyr.toFixed(1) + " Gyr"} — this world almost certainly shows one face to its star. A dense atmosphere or ocean could still redistribute heat (Leconte et al. 2013).` });

  if (inp.eccentricity > 0.12) n.push({ tone: "info", text: `Eccentricity ${inp.eccentricity.toFixed(2)} swings sunlight ×${(d.Speri / Math.max(d.Sap, 1e-6)).toFixed(2)} between periastron and apastron — extreme seasons on a ${d.periodDays < 400 ? d.periodDays.toFixed(1) + "-day" : d.period.toFixed(2) + "-year"} year.` });

  if (d.retention > 0.6) n.push({ tone: "good", text: `Atmospheric retention looks durable: Jeans parameter for N₂ is ${d.lambdaN2.toFixed(0)} (≫15 needs no escape correction), bolstered by its magnetic moment.` });
  else if (d.retention > 0.3) n.push({ tone: "warn", text: `Retention is marginal (score ${d.retention.toFixed(2)}) — XUV-driven loss over billions of years is a genuine threat to the atmosphere.` });
  else n.push({ tone: "bad", text: `Atmospheric survival is doubtful: weak escape-parameter margins compounded by ${inp.magneticMoment < 0.1 ? "no magnetic shielding" : "intense stellar XUV flux"}.` });

  if (inp.starMass < 0.35) n.push({ tone: "info", text: `${d.spectral} dwarfs live ${d.lifetimeGyr > 400 ? "trillions of years but" : `${d.lifetimeGyr.toFixed(0)} Gyr but`} flare hard in youth — their pre-main-sequence luminosity can sterilise close-in worlds (Ramirez & Kaltenegger 2014).` });
  if (d.lifetimeGyr < 1) n.push({ tone: "warn", text: `This star exhausts its hydrogen in ~${d.lifetimeGyr.toFixed(2)} Gyr — barely enough time for life to ignite, let alone complexify.` });

  n.push({ tone: "info", text: `Surface gravity ${(d.gravity / 9.81).toFixed(2)} g at ${d.densityGcc.toFixed(2)} g/cm³ bulk density — escape velocity ${d.vesc.toFixed(1)} km/s.` });

  if (d.esi.global > 0.8) n.push({ tone: "good", text: `Earth Similarity Index ${d.esi.global.toFixed(3)} — inside the top tier of the Schulze-Makuch scale (Earth = 1.000 by construction).` });
  else n.push({ tone: "info", text: `Earth Similarity Index ${d.esi.global.toFixed(3)} on the 0–1 Schulze-Makuch scale.` });

  return n;
}

export function verdict(H: number): { label: string; text: string } {
  if (H >= 85) return { label: "Prime candidate", text: "Strikingly Earthlike. Every physical checkpoint resolves in favour of surface liquid water and a durable climate." };
  if (H >= 70) return { label: "Strong candidate", text: "Multiple lines of evidence support a habitable surface; only second-order caveats remain." };
  if (H >= 55) return { label: "Promising, with caveats", text: "The fundamentals work, but the climate depends on feedbacks this model cannot resolve." };
  if (H >= 40) return { label: "Marginal world", text: "Habitability would require exotic climatic states — eyeball oceans, hydrogen greenhouse warming, or subsurface seas." };
  if (H >= 20) return { label: "Inhospitable", text: "The physics closes nearly every door to surface liquid water as we understand it." };
  return { label: "Hostile world", text: "By current understanding, no pathway to surface habitability exists here." };
}

// ---------------------------------------------------------------- formatting
export const fmt = (x: number, dp = 2): string => {
  if (!isFinite(x)) return "—";
  if (Math.abs(x) >= 10000) return x.toExponential(2);
  return x.toFixed(dp);
};
export const fmtC = (K: number): string => `${(K - 273.15).toFixed(0)}°C`;
export const fmtPct = (x: number): string => `${Math.round(x * 100)}%`;
export const fmtGyr = (g: number): string =>
  g > 400 ? ">400 Gyr" : g >= 1 ? `${g.toFixed(g < 10 ? 1 : 0)} Gyr` : g < 0.001 ? "<1 Myr" : `${(g * 1000).toFixed(0)} Myr`;
