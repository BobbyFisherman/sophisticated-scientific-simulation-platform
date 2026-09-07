import { SystemInputs } from "./astro";

/* =====================================================================================
   REAL WORLDS — parameters from the NASA Exoplanet Archive & primary literature.
   Unknown atmospheric properties (albedo, pressure, greenhouse index, ocean coverage,
   magnetic moment) are marked as modelled estimates — that is the point of the lab:
   they are the knobs an astronomer would love to measure.
   ===================================================================================== */

export interface Preset {
  id: string;
  name: string;
  tagline: string;
  discovery: string;
  inputs: SystemInputs;
  estimated: string[]; // which fields are modelled, not measured
  reference: string;
}

const p = (
  id: string, name: string, tagline: string, discovery: string,
  inputs: SystemInputs, estimated: string[], reference: string,
): Preset => ({ id, name, tagline, discovery, inputs, estimated, reference });

export const PRESETS: Preset[] = [
  p("earth", "Earth", "The control experiment. Every model in this engine is calibrated so that Earth falls out as the answer.", "—",
    { starMass: 1.0, luminosity: 1.0, semiMajor: 1.0, eccentricity: 0.017, planetRadius: 1.0, ironFraction: 0.32, albedo: 0.30, pressure: 1.0, ghgIndex: 1.0, oceanCoverage: 0.71, magneticMoment: 1.0 },
    [], "NOAA / NASA Earth Fact Sheet"),
  p("venus", "Venus", "The greenhouse went runaway here — 92 bar of CO₂ at 737 K. Earth's twin, climate's cautionary tale.", "—",
    { starMass: 1.0, luminosity: 1.0, semiMajor: 0.723, eccentricity: 0.007, planetRadius: 0.949, ironFraction: 0.32, albedo: 0.75, pressure: 92, ghgIndex: 2.6, oceanCoverage: 0.0, magneticMoment: 0.0 },
    [], "NASA Venus Fact Sheet"),
  p("mars", "Mars", "Retains a whisper of air at 6 mbar. Once watered, now frozen — a habitable world that lost its shield.", "—",
    { starMass: 1.0, luminosity: 1.0, semiMajor: 1.524, eccentricity: 0.093, planetRadius: 0.532, ironFraction: 0.27, albedo: 0.25, pressure: 0.006, ghgIndex: 5.0, oceanCoverage: 0.0, magneticMoment: 0.001 },
    [], "NASA Mars Fact Sheet"),
  p("mercury", "Mercury", "A scorched iron heart near the inner edge of possibility — dayside lead-melting, nightside cryogenic.", "—",
    { starMass: 1.0, luminosity: 1.0, semiMajor: 0.387, eccentricity: 0.206, planetRadius: 0.383, ironFraction: 0.65, albedo: 0.09, pressure: 0.0001, ghgIndex: 0.0, oceanCoverage: 0.0, magneticMoment: 0.01 },
    [], "NASA Mercury Fact Sheet"),
  p("trappist1e", "TRAPPIST-1 e", "0.66 Earth-flux around an ultracool dwarf. Perhaps the most studied temperate rocky world known.", "2017 — Spitzer transit, Gillon et al. 2017, Nature 542:456",
    { starMass: 0.0898, luminosity: 0.000553, semiMajor: 0.0293, eccentricity: 0.005, planetRadius: 0.92, ironFraction: 0.25, albedo: 0.30, pressure: 0.8, ghgIndex: 0.8, oceanCoverage: 0.7, magneticMoment: 0.3 },
    ["albedo", "pressure", "ghgIndex", "oceanCoverage", "magneticMoment"], "Agol et al. 2021, PSJ 2:1"),
  p("trappist1f", "TRAPPIST-1 f", "Sits near the maximum-greenhouse edge — habitable only if climate feedbacks cooperate.", "2017 — Gillon et al. 2017, Nature 542:456",
    { starMass: 0.0898, luminosity: 0.000553, semiMajor: 0.0385, eccentricity: 0.01, planetRadius: 1.045, ironFraction: 0.2, albedo: 0.30, pressure: 1.0, ghgIndex: 1.2, oceanCoverage: 0.8, magneticMoment: 0.3 },
    ["albedo", "pressure", "ghgIndex", "oceanCoverage", "magneticMoment"], "Agol et al. 2021, PSJ 2:1"),
  p("proximab", "Proxima Centauri b", "The nearest exoplanet to us — 4.25 ly. Temperate flux, but under a famously violent flare star.", "2016 — ESO HARPS radial velocity, Anglada-Escudé et al., Nature 536:437",
    { starMass: 0.1221, luminosity: 0.00155, semiMajor: 0.0485, eccentricity: 0.02, planetRadius: 1.07, ironFraction: 0.3, albedo: 0.30, pressure: 1.0, ghgIndex: 1.0, oceanCoverage: 0.5, magneticMoment: 0.3 },
    ["planetRadius", "albedo", "pressure", "ghgIndex", "oceanCoverage", "magneticMoment"], "Anglada-Escudé et al. 2016"),
  p("kepler452b", "Kepler-452 b", "“Earth’s bigger, older cousin” — 1,400 ly away, 60% wider, in a Sun-like star’s habitable zone.", "2015 — Kepler transit, Jenkins et al. 2015, AJ 150:56",
    { starMass: 1.11, luminosity: 1.23, semiMajor: 1.046, eccentricity: 0.03, planetRadius: 1.63, ironFraction: 0.3, albedo: 0.30, pressure: 1.5, ghgIndex: 1.0, oceanCoverage: 0.7, magneticMoment: 0.8 },
    ["albedo", "pressure", "ghgIndex", "oceanCoverage", "magneticMoment"], "Jenkins et al. 2015, AJ 150:56"),
  p("kepler442b", "Kepler-442 b", "A quiet K-dwarf, 1,200 ly out, hosts this 1.34 R⊕ world at 0.7 Earth-flux — a top ESI contender.", "2015 — Kepler transit, Torres et al. 2015, ApJ 800:99",
    { starMass: 0.61, luminosity: 0.121, semiMajor: 0.409, eccentricity: 0.04, planetRadius: 1.34, ironFraction: 0.32, albedo: 0.30, pressure: 1.2, ghgIndex: 1.0, oceanCoverage: 0.7, magneticMoment: 0.6 },
    ["planetRadius est.", "albedo", "pressure", "ghgIndex", "oceanCoverage", "magneticMoment"], "Torres et al. 2015, ApJ 800:99"),
  p("kepler186f", "Kepler-186 f", "First Earth-sized world found in another star’s habitable zone — 580 ly, orbiting a serene M1 dwarf.", "2014 — Kepler transit, Quintana et al. 2014, Science 344:277",
    { starMass: 0.544, luminosity: 0.0486, semiMajor: 0.41, eccentricity: 0.04, planetRadius: 1.17, ironFraction: 0.3, albedo: 0.32, pressure: 1.2, ghgIndex: 1.2, oceanCoverage: 0.6, magneticMoment: 0.5 },
    ["albedo", "pressure", "ghgIndex", "oceanCoverage", "magneticMoment"], "Quintana et al. 2014, Science 344:277"),
  p("teegardenb", "Teegarden’s Star b", "Only 12.5 ly away orbiting an ancient, unusually quiet M-dwarf. ESI ≈ 0.95 — the highest on record.", "2019 — CARMENES radial velocity, Zechmeister et al. 2019, A&A 627:A49",
    { starMass: 0.089, luminosity: 0.00073, semiMajor: 0.0252, eccentricity: 0.0, planetRadius: 1.05, ironFraction: 0.3, albedo: 0.30, pressure: 1.0, ghgIndex: 1.0, oceanCoverage: 0.6, magneticMoment: 0.4 },
    ["planetRadius", "albedo", "pressure", "ghgIndex", "oceanCoverage", "magneticMoment"], "Zechmeister et al. 2019, A&A 627:A49"),
  p("lhs1140b", "LHS 1140 b", "A dense super-Earth (5.6 M⊕) with a whiff of atmosphere hinted by JWST — 49 ly distant.", "2017 — MEarth transit + HARPS, Dittmann et al. 2017, Nature 544:333",
    { starMass: 0.184, luminosity: 0.00506, semiMajor: 0.0946, eccentricity: 0.0, planetRadius: 1.727, ironFraction: 0.36, albedo: 0.30, pressure: 3.0, ghgIndex: 1.4, oceanCoverage: 0.5, magneticMoment: 0.4 },
    ["albedo", "pressure", "ghgIndex", "oceanCoverage", "magneticMoment"], "Dittmann et al. 2017, Nature 544:333"),
  p("toi700d", "TOI-700 d", "TESS’s first habitable-zone Earth-sized world — 87% of Earth-flux around a calm M2V, 101 ly away.", "2020 — TESS transit, Gilbert et al. 2020, AJ 160:116",
    { starMass: 0.416, luminosity: 0.0233, semiMajor: 0.163, eccentricity: 0.0, planetRadius: 1.19, ironFraction: 0.3, albedo: 0.30, pressure: 1.0, ghgIndex: 1.0, oceanCoverage: 0.6, magneticMoment: 0.5 },
    ["albedo", "pressure", "ghgIndex", "oceanCoverage", "magneticMoment"], "Gilbert et al. 2020, AJ 160:116"),
  p("g667cc", "Gliese 667 Cc", "Super-Earth in a triple-star system, 23.6 ly. Flux near the inner edge — cloud cover decides its fate.", "2011 — HARPS radial velocity, Anglada-Escudé et al. 2012, ApJL 751:L16",
    { starMass: 0.31, luminosity: 0.0137, semiMajor: 0.125, eccentricity: 0.06, planetRadius: 1.54, ironFraction: 0.32, albedo: 0.42, pressure: 2.0, ghgIndex: 1.2, oceanCoverage: 0.65, magneticMoment: 0.4 },
    ["planetRadius", "albedo", "pressure", "ghgIndex", "oceanCoverage", "magneticMoment"], "Anglada-Escudé et al. 2012"),
  p("k218b", "K2-18 b", "A 2.6 R⊕ sub-Neptune in the habitable zone — JWST detected CH₄ and CO₂. The “Hycean” ocean-world hypothesis.", "2015 — K2 transit; atmosphere: Madhusudhan et al. 2023, ApJL 956:L13",
    { starMass: 0.495, luminosity: 0.0284, semiMajor: 0.1429, eccentricity: 0.0, planetRadius: 2.61, ironFraction: 0.05, albedo: 0.50, pressure: 4.0, ghgIndex: 1.1, oceanCoverage: 1.0, magneticMoment: 0.5 },
    ["albedo", "pressure", "ghgIndex", "oceanCoverage", "magneticMoment"], "Madhusudhan et al. 2023, ApJL 956:L13"),
];
