import { Reveal, PageHero, Kicker, Equation, Callout } from "../components/ui";
import { derive } from "../engine/astro";
import { PRESETS } from "../engine/presets";
import { Cpu, Sun, Compass, ThermometerSun, CloudRainWind, Scale, Sigma, TriangleAlert, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";

const CAL = PRESETS.filter((p) => ["earth", "venus", "mars"].includes(p.id)).map((p) => ({
  name: p.name, d: derive(p.inputs),
  actual: p.id === "earth" ? 288 : p.id === "venus" ? 737 : 210,
}));

export default function Method() {
  return (
    <div>
      <PageHero index="The Engine" title={<>How the engine <span className="italic text-amber">thinks</span>.</>}>
        Every slider change re-runs a six-stage pipeline of published astrophysics in under a millisecond.
        This page is the schematic: what each stage computes, which papers it stands on, and —
        just as important — where it is wrong on purpose.
      </PageHero>

      <section className="max-w-5xl mx-auto px-6 md:px-10">
        {/* pipeline */}
        <Reveal><Kicker n="A">The pipeline</Kicker></Reveal>
        <div className="relative mt-4 space-y-5">
          <div className="absolute left-[27px] top-10 bottom-10 w-px bg-gradient-to-b from-amber/40 via-teal/30 to-transparent hidden md:block" />
          {STAGES.map((s, i) => (
            <Reveal key={s.n} delay={i * 60}>
              <div className="grid md:grid-cols-[56px_1fr] gap-6 items-start">
                <div className="hidden md:grid place-items-center w-14 h-14 rounded-2xl border border-line bg-panel text-amber relative z-10">{s.icon}</div>
                <div className="rounded-2xl border border-line bg-panel/50 p-7 md:p-8">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
                    <span className="font-mono text-[11px] tracking-[0.28em] text-faint">STAGE {s.n}</span>
                    <h3 className="font-display text-2xl md:text-[1.7rem] tracking-tight">{s.title}</h3>
                    <span className="font-mono text-[10.5px] text-teal/80 ml-auto">{s.fn}</span>
                  </div>
                  <p className="text-mist text-[14px] leading-relaxed font-light max-w-3xl">{s.body}</p>
                  <div className="eq text-base md:text-lg text-bone/85 mt-5 bg-abyss/50 border border-line-soft rounded-xl px-5 py-4 overflow-x-auto whitespace-nowrap">{s.eq}</div>
                  <div className="mt-3 text-[10.5px] font-mono uppercase tracking-[0.18em] text-faint">{s.src}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* calibration */}
        <Reveal className="mt-24">
          <Kicker n="B">Calibration — the Earth test</Kicker>
          <h2 className="font-display text-3xl md:text-5xl tracking-tight max-w-3xl">If the physics is honest, Earth must come out as Earth.</h2>
          <p className="text-mist mt-5 max-w-2xl font-light leading-relaxed">
            The strongest evidence a simplified model deserves your trust is that it reproduces the three
            terrestrial climates we have actually measured. Run the same pipeline on Earth's, Venus' and Mars'
            known inputs and compare the modelled surface temperature with the observed one.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-10 rounded-2xl border border-line bg-panel/50 overflow-hidden">
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-px bg-line-soft text-sm">
              <div className="bg-abyss px-5 py-3.5 text-[10px] font-mono uppercase tracking-[0.2em] text-faint">World</div>
              <div className="bg-abyss px-5 py-3.5 text-[10px] font-mono uppercase tracking-[0.2em] text-faint">Observed mean</div>
              <div className="bg-abyss px-5 py-3.5 text-[10px] font-mono uppercase tracking-[0.2em] text-faint">Engine output</div>
              <div className="bg-abyss px-5 py-3.5 text-[10px] font-mono uppercase tracking-[0.2em] text-faint">Residual</div>
              {CAL.map((c) => {
                const model = c.d.Tsurf;
                const res = model - c.actual;
                return (
                  <div key={c.name} className="contents">
                    <div className="bg-panel px-5 py-4 font-display text-base">{c.name}</div>
                    <div className="bg-panel px-5 py-4 font-mono tabular text-mist">{c.actual} K</div>
                    <div className="bg-panel px-5 py-4 font-mono tabular text-teal">{model.toFixed(1)} K</div>
                    <div className="bg-panel px-5 py-4 font-mono tabular" style={{ color: Math.abs(res) < 5 ? "#6fd3c7" : Math.abs(res) < 20 ? "#e3a94e" : "#c9582e" }}>
                      {res > 0 ? "+" : ""}{res.toFixed(1)} K
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
        <Reveal delay={150} className="mt-6">
          <Callout tone="teal" title="Why Mars runs slightly warm in the model">
            Mars' atmosphere is 95% CO₂ but only 6 mbar — its real greenhouse effect (~5–8 K) sits at the resolution
            limit of any one-parameter optical-depth law. We accept a small warm bias there in exchange for a
            single transparent τ(p, ghg) relation that nails Earth and Venus — the two cases that carry the
            habitable-zone argument.
          </Callout>
        </Reveal>

        {/* equations governing */}
        <Reveal className="mt-24">
          <Kicker n="C">The governing equations</Kicker>
        </Reveal>
        <div className="mt-8 grid gap-4">
          <Reveal><Equation source="Stefan–Boltzmann energy balance" caption="Starlight absorbed across the planet's disk must equal infrared emission from the whole sphere. The 4 in the denominator is the geometry of a rotating world.">
            S(1 − A) / 4σ = T<sub>eq</sub><sup>4</sup>
          </Equation></Reveal>
          <Reveal delay={60}><Equation source="Grey (leaky) atmosphere — Pierrehumbert 2010, Ch. 3" caption="With infrared optical depth τ, the surface must run hotter to push the same energy through the blanket. τ = 0 gives the raw equilibrium; Earth's τ ≈ 0.84 adds 33 K.">
            T<sub>s</sub> = T<sub>eq</sub> · (1 + 3τ/4)<sup>1/4</sup>
          </Equation></Reveal>
          <Reveal delay={120}><Equation source="Kopparapu et al. 2013 — Table 2 coefficients" caption="Polynomial corrections make the habitable-zone edges depend on the star's colour: red stars' infrared light is absorbed differently by steam and CO₂ than the Sun's.">
            S<sub>eff</sub> = S<sub>eff,⊙</sub> + aT* + bT*² + cT*³ + dT*⁴
          </Equation></Reveal>
        </div>

        {/* limitations */}
        <Reveal className="mt-24">
          <Kicker n="D">Honest limitations</Kicker>
          <h2 className="font-display text-3xl md:text-5xl tracking-tight max-w-3xl">A map is useful because it is smaller than the territory.</h2>
        </Reveal>
        <div className="mt-10 grid md:grid-cols-2 gap-4">
          {LIMITS.map((l, i) => (
            <Reveal key={l.t} delay={i * 60}>
              <div className="rounded-2xl border border-line bg-panel/40 p-7 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <TriangleAlert size={14} className="text-amber" />
                  <h4 className="font-display text-lg">{l.t}</h4>
                </div>
                <p className="text-mist text-[13px] leading-relaxed font-light">{l.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16">
          <div className="rounded-2xl border border-line bg-panel/40 p-8 flex flex-wrap items-center justify-between gap-6">
            <p className="text-mist text-sm max-w-xl font-light leading-relaxed">
              Everything above is implemented in a single pure function — <span className="font-mono text-teal text-[13px]">derive(inputs) → derived</span> —
              no randomness, no hidden state, entirely reproducible.
            </p>
            <Link to="/observatory" className="group flex items-center gap-2.5 rounded-full border border-amber/50 text-amber px-6 py-3 text-[13px] hover:bg-amber hover:text-ink transition-all">
              <Cpu size={14} /> Run it yourself <ArrowDown size={13} className="rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

const STAGES = [
  {
    n: "01", icon: <Sun size={20} />, title: "The stellar model", fn: "massToLuminosity() → massToTeff()",
    body: "From a single number — the star's mass — the engine derives luminosity (piecewise mass–luminosity relation), effective temperature, radius, colour and main-sequence lifetime. A 0.1 M☉ red dwarf is 500× dimmer than the Sun and burns for trillions of years instead of billions; both facts matter enormously for its planets.",
    eq: "L ★ ≈ M★³·⁵…⁴   ·   tMS ≈ 10 Gyr × M★/L★   ·   R★ ≈ M★⁰·⁸",
    src: "Duric 2004 · Pecaut & Mamajek 2013 · Hansen & Kawaler 1994",
  },
  {
    n: "02", icon: <Compass size={20} />, title: "The orbital model", fn: "orbitalPeriod() → eccentricAnomaly()",
    body: "Kepler's third law turns the semi-major axis into a year length. Each simulation frame solves Kepler's equation M = E − e·sin E by Newton–Raphson to place the planet on its ellipse — fast at periastron, slow at apastron — which is what makes eccentric climates breathe.",
    eq: "P² = a³/M★   ·   r = a(1 − e·cos E)   ·   v² = GM(2/r − 1/a)",
    src: "Kepler 1609/1619 · Newton 1687",
  },
  {
    n: "03", icon: <ThermometerSun size={20} />, title: "The energy budget", fn: "equilibriumTemp() → hzBounds()",
    body: "Mean flux S = L/a² feeds the Stefan–Boltzmann balance for equilibrium temperature. Simultaneously, the Kopparapu polynomial shifts the runaway-greenhouse and maximum-greenhouse flux edges according to stellar colour, turning L and T_eff into four habitable-zone distances.",
    eq: "Teq = 278.4 K × S¼(1 − A)¼   ·   dHZ = √(L/S_eff)",
    src: "Stefan 1879 · Kopparapu et al. 2013, ApJ 765:131",
  },
  {
    n: "04", icon: <CloudRainWind size={20} />, title: "The climate model", fn: "opticalDepth() → surfaceTemp() → waterState()",
    body: "A grey atmosphere with optical depth τ — synthesised from surface pressure and a greenhouse-gas index — lifts the surface above equilibrium temperature. Clausius–Clapeyron then locates water's boiling point at that pressure, and the engine classifies the hydrosphere from frozen to runaway.",
    eq: "τ = 0.84 p⁰·⁹⁵(0.4 + 0.6 g¹·¹⁵)   ·   Tboil = T₀/(1 − 0.0763 ln p)",
    src: "Pierrehumbert 2010 · Ingersoll 1969 (runaway)",
  },
  {
    n: "05", icon: <Scale size={20} />, title: "The interior & retention model", fn: "radiusToMass() → jeansLambda()",
    body: "Radius and iron fraction yield mass via the Chen–Kipping relation, then gravity, density and escape velocity. The Jeans escape parameter λ compares molecular thermal motion to gravity at the exobase; τ, λ, magnetic moment and stellar XUV together score whether the atmosphere survives gigayears.",
    eq: "M = R³·⁵⁸ … 1.436R¹·⁷⁰   ·   λ = GMpm/kBTexoRp",
    src: "Chen & Kipping 2017, ApJ 834:17 · Catling & Kasting 2017",
  },
  {
    n: "06", icon: <Sigma size={20} />, title: "The scoring model", fn: "ESI → habitability index H",
    body: "Four ESI similarity terms (radius, density, escape velocity, temperature) form the published Schulze-Makuch index. On top of it, a habitability index blends temperature fit, water stability, atmospheric quality and stellar stability into a single 0–100 verdict — transparently, from the same quantities you can inspect.",
    eq: "ESI = Πᵢ (1 − |xᵢ − xᵢ₀|/(xᵢ + xᵢ₀))ʷⁱ/Σʷ",
    src: "Schulze-Makuch et al. 2011, Astrobiology 11:1041",
  },
];

const LIMITS = [
  { t: "One-dimensional climate", d: "Real climates are three-dimensional — Hadley cells, ice-albedo feedbacks, cloud decks both warming and cooling. A single grey-atmosphere τ cannot see a planet's weather, only its energy ledger. Tidally locked worlds especially can stay habitable far outside our flux bounds (Yang et al. 2014)." },
  { t: "Atmospheric chemistry is compressed to one index", d: "The greenhouse index stands in for CO₂, H₂O vapour, CH₄, H₂ and pressure broadening — each with its own spectroscopy. We calibrate to Earth, Venus and Mars rather than solving line-by-line radiative transfer." },
  { t: "Retention is heuristic", d: "True atmospheric loss mixes Jeans escape, hydrodynamic blow-off, polar-wind and sputtering — none fully solvable from basic parameters. Our score combines the Jeans parameter, a shielding factor and an M-dwarf XUV proxy as a defensible first cut (Shields et al. 2016)." },
  { t: "Microbial life is beyond scope", d: "Everything here speaks to surface liquid water — the classical, conservative criterion. Subsurface oceans (Europa), hydrogen-greenhouse warming beyond the outer edge (Ramirez & Kaltenegger 2014), or weird solvents are real possibilities this engine deliberately does not claim." },
  { t: "Exoplanet inputs carry error bars", d: "For most known worlds only mass or radius — not both — plus orbit are measured. The 'known worlds' library marks every modelled field; treating those atmospheres as knowable is precisely the point of the instrument." },
  { t: "Stellar evolution is static", d: "Stars brighten ~10% per billion years (the Sun was ~70% as bright 4 Gyr ago — the 'faint young Sun'). The engine evaluates the system as observed today." },
];
