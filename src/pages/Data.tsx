import { Reveal, PageHero } from "../components/ui";
import { DataRow } from "../components/ui";
import { BookMarked, Scale3D, FileText } from "lucide-react";

export default function Data() {
  return (
    <div>
      <PageHero index="The Ledger" title={<>Data & <span className="italic text-amber">sources</span>.</>}>
        Every constant, coefficient and citation behind the engine — so that a number you see in the
        Observatory can always be chased back to a paper.
      </PageHero>

      <section className="max-w-6xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-14 items-start">
        {/* constants */}
        <div>
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <Scale3D size={15} className="text-amber" />
              <h2 className="font-display text-2xl tracking-tight">Physical constants & nominal values</h2>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div className="rounded-2xl border border-line bg-panel/40 px-6 py-4">
              <DataRow k="Solar constant S⊕ at 1 AU" v="1361 W/m²" accent />
              <DataRow k="Stefan–Boltzmann σ" v="5.6704×10⁻⁸ W m⁻²K⁻⁴" accent />
              <DataRow k="Gravitational G" v="6.6743×10⁻¹¹ m³kg⁻¹s⁻²" />
              <DataRow k="Boltzmann k_B" v="1.380649×10⁻²³ J/K" />
              <DataRow k="Astronomical unit" v="1.495978707×10¹¹ m" />
              <DataRow k="Solar mass / radius" v="1.9885×10³⁰ kg · 6.957×10⁸ m" />
              <DataRow k="Earth mass / radius" v="5.9722×10²⁴ kg · 6371 km" />
              <DataRow k="Earth mean density" v="5.514 g/cm³" />
              <DataRow k="Earth escape velocity" v="11.186 km/s" />
              <DataRow k="T_eq constant (S in S⊕)" v="278.4 K · S¼(1−A)¼" accent />
              <DataRow k="Earth grey-atmosphere τ" v="0.84 (ΔT = 33 K)" accent />
              <DataRow k="Water triple point" v="611.7 Pa · 273.16 K" />
              <DataRow k="Water latent heat ΔH_vap" v="2.257×10⁶ J/kg" />
              <DataRow k="RV semi-amplitude constant" v="28.43 m/s (Jupiter, 1 yr, 1 M☉)" />
              <DataRow k="Circular-orbit speed constant" v="29.78 km/s (1 AU, 1 M☉)" />
              <DataRow k="Chen–Kipping Terran exponent" v="M = R³·⁵⁸ (R ≤ 1.23 R⊕)" accent />
              <DataRow k="Chen–Kipping Neptunian" v="M = 1.436 · R¹·⁷" />
              <DataRow k="Jeans retention thresholds" v="λ > 15 safe · λ < 5 lost" accent />
              <DataRow k="Tidal-lock scaling constant" v="t ⊕ ≈ 60 Gyr at 1 AU (Peale-style)" />
            </div>
          </Reveal>
        </div>

        {/* citations */}
        <div>
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <BookMarked size={15} className="text-teal" />
              <h2 className="font-display text-2xl tracking-tight">Primary sources</h2>
            </div>
          </Reveal>
          <div className="space-y-3">
            {SOURCES.map((s, i) => (
              <Reveal key={s.authors} delay={Math.min(i, 8) * 40}>
                <div className="rounded-xl border border-line-soft bg-panel/30 px-5 py-4">
                  <div className="text-[13px] text-bone/90 font-normal leading-snug">{s.title}</div>
                  <div className="text-[11.5px] font-mono text-faint mt-1.5">{s.authors}</div>
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {s.usedFor.map((u) => (
                      <span key={u} className="text-[9.5px] font-mono uppercase tracking-[0.14em] text-teal/80 bg-teal/10 rounded-full px-2.5 py-1">{u}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-10 mt-20">
        <Reveal>
          <div className="flex items-center gap-3 mb-6">
            <FileText size={15} className="text-amber" />
            <h2 className="font-display text-2xl tracking-tight">Usage notes</h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            ["Modelled vs measured", "Observatory presets mark modelled fields with an asterisk on the Worlds page. Measured inputs (orbit, mass or radius, stellar data) follow the discovery papers cited above."],
            ["CODATA & archives", "Constants follow CODATA 2018 and the IAU 2012 definition of the AU. Exoplanet parameters cross-checked against the NASA Exoplanet Archive (Akeson et al. 2013, PASP 125:989)."],
            ["Reproducibility", "The engine is a single pure TypeScript function with no randomness and no network calls. The same twelve inputs always produce the same twenty-four outputs."],
          ].map(([t, d]) => (
            <Reveal key={t} delay={60}>
              <div className="rounded-2xl border border-line bg-panel/40 p-7 h-full">
                <h4 className="font-display text-lg">{t}</h4>
                <p className="text-[13px] text-mist mt-3 leading-relaxed font-light">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

const SOURCES = [
  {
    title: "Habitable Zones around Main-Sequence Stars: New Estimates",
    authors: "Kopparapu, Ramirez, Kasting et al. 2013, ApJ 765:131",
    usedFor: ["HZ boundary coefficients", "polynomial fits"],
  },
  {
    title: "A Two-Tiered Approach to Assessing the Habitability of Exoplanets",
    authors: "Schulze-Makuch et al. 2011, Astrobiology 11:1041",
    usedFor: ["ESI formulation", "term weights"],
  },
  {
    title: "Probabilistic Forecasting of the Masses and Radii of Other Worlds",
    authors: "Chen & Kipping 2017, ApJ 834:17",
    usedFor: ["mass–radius relation"],
  },
  {
    title: "Principles of Planetary Climate (textbook)",
    authors: "Pierrehumbert 2010, Cambridge University Press",
    usedFor: ["grey atmosphere", "runaway greenhouse", "boiling curve"],
  },
  {
    title: "Atmospheric Evolution on Inhabited and Lifeless Worlds",
    authors: "Catling & Kasting 2017, Cambridge University Press",
    usedFor: ["Jeans escape", "retention thresholds"],
  },
  {
    title: "The Habitability of Planets Orbiting M-Dwarf Stars",
    authors: "Shields, Ballard & Johnson 2016, Physics Reports 663:1",
    usedFor: ["XUV activity proxy", "M-dwarf caveats"],
  },
  {
    title: "The Habitable Zones of Pre-Main-Sequence Stars",
    authors: "Ramirez & Kaltenegger 2014, ApJL 797:L25",
    usedFor: ["H₂ greenhouse beyond outer edge", "notes"],
  },
  {
    title: "Stabilizing Cloud Feedback Dramatically Expands the HZ of Tidally Locked Planets",
    authors: "Yang, Cowan & Abbot 2013/2014, ApJL 771:L45",
    usedFor: ["eyeball climates", "inner-edge caveats"],
  },
  {
    title: "Habitable Zones around Main-Sequence Stars",
    authors: "Kasting, Whitmire & Reynolds 1993, Icarus 101:108",
    usedFor: ["original CHZ framework"],
  },
  {
    title: "Origin and Evolution of Planetary Atmospheres: implications for habitability",
    authors: "Peale 1977 · Gladman et al. 1996 — tidal-locking scalings",
    usedFor: ["tidal locking timescale"],
  },
  {
    title: "A Terrestrial Planet Candidate in a Temperate Orbit Around Proxima Centauri",
    authors: "Anglada-Escudé et al. 2016, Nature 536:437",
    usedFor: ["Proxima b parameters"],
  },
  {
    title: "Seven Temperate Terrestrial Planets Around TRAPPIST-1 + Agol et al. 2021 refinement",
    authors: "Gillon et al. 2017, Nature 542:456 · Agol et al. 2021, PSJ 2:1",
    usedFor: ["TRAPPIST-1 e/f parameters"],
  },
  {
    title: "Discovery and Validation of Kepler-452b / Validation of Kepler-442b / Kepler-186f",
    authors: "Jenkins et al. 2015 AJ 150:56 · Torres et al. 2015 ApJ 800:99 · Quintana et al. 2014 Science 344:277",
    usedFor: ["Kepler world parameters"],
  },
  {
    title: "MAVEN measurements of atmospheric loss at Mars",
    authors: "Jakosky et al. 2015, Science 350:0210",
    usedFor: ["sputtering narrative", "retention heuristics"],
  },
];
