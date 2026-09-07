import { Reveal, PageHero, Kicker } from "../components/ui";
import { useState } from "react";
import { Search } from "lucide-react";

const TERMS: [string, string][] = [
  ["Albedo (Bond)", "The fraction of total starlight a world reflects to space, over all wavelengths and angles. Earth's is 0.30; Venus' unbroken cloud deck reaches 0.75."],
  ["Apastron / Periastron", "The farthest and nearest points of an orbit from its star. The flux ratio between them is ((1+e)/(1−e))²."],
  ["Bond albedo", "See Albedo. Distinct from geometric albedo, which is measured at a single viewing geometry."],
  ["Clausius–Clapeyron relation", "The thermodynamic law linking boiling point to pressure; the engine uses it to decide whether surface water can even be liquid."],
  ["Conservative habitable zone", "The annulus between the runaway-greenhouse and maximum-greenhouse flux limits — the region where climate models say oceans must be possible."],
  ["Eccentric anomaly", "The angle E bridging mean anomaly (uniform time angle) and true anomaly (actual position) via Kepler's equation M = E − e·sinE."],
  ["Equilibrium temperature", "The blackbody temperature at which a planet's absorbed sunlight balances its total infrared emission. Earth: 255 K."],
  ["Escape velocity", "Speed needed to leave a body's gravity for good: v = √(2GM/R). Earth's is 11.2 km/s."],
  ["Earth Similarity Index (ESI)", "A 0–1 score comparing a planet's radius, density, escape velocity and temperature to Earth's, as a weighted geometric mean (Schulze-Makuch et al. 2011)."],
  ["Exobase", "The altitude where the atmosphere becomes collisionless — the launch pad for Jeans escape. On Earth ~500 km up, ~1000 K."],
  ["Grey atmosphere", "A simplified climate model with one infrared optical depth τ for the whole column. The engine's (1 + 3τ/4)¼ surface-temperature law comes from it."],
  ["Greenhouse index", "Worldforge's single compression of atmospheric composition: 1.0 = a modern-Earth mix, ~5 = nearly pure CO₂. Scales the optical depth."],
  ["Habitable zone", "The range of orbital distances where a rocky planet can maintain liquid surface water, for a given stellar luminosity and colour."],
  ["Hydrodynamic escape", "Wholesale blow-off of an atmosphere heated hard enough by XUV to flow to space as a continuous wind — the likely fate of Venus' ocean."],
  ["Hycean world", "A hydrogen-rich sub-Neptune with a global ocean beneath its H₂ envelope — the proposed nature of K2-18 b."],
  ["Jeans parameter λ", "Ratio of gravitational binding to thermal energy for a molecule at the exobase. λ > 15 means geological retention; λ < 5 means loss."],
  ["Kepler's equation", "M = E − e·sinE, linking uniform time (mean anomaly M) to orbital position. Solved numerically every animation frame in the simulation."],
  ["Kopparapu boundaries", "The standard 2013 revision of habitable-zone flux limits, as polynomial functions of stellar effective temperature."],
  ["Mass–luminosity relation", "The steep empirical scaling L ∝ M³·⁵–⁴ for main-sequence stars; halving mass dims a star roughly ten-fold."],
  ["Maximum greenhouse", "The outer HZ edge: the greatest distance at which even a saturated pure-CO₂ greenhouse can hold the surface above freezing."],
  ["Mean anomaly", "A fictitious angle advancing uniformly with time — the clock of an orbit, before eccentricity warps it into position."],
  ["Optical depth τ", "Mean number of absorptions an infrared photon suffers before escaping to space. Zero = airless; Earth ≈ 0.84."],
  ["Runaway greenhouse", "The positive feedback where evaporating water amplifies its own greenhouse until oceans boil wholesale. Defines the inner HZ edge."],
  ["Semi-major axis", "Half of the orbit's long axis — the 'average distance' in Kepler's third law, P² = a³/M."],
  ["Spectral class", "A star's colour-temperature label (M, K, G, F, A, B from cool to hot). The Sun is G2V."],
  ["Sputtering", "Atmospheric loss where the solar wind's electric field picks up ionised gas and drags it to space — dominant for unmagnetised Mars today."],
  ["Tidal locking", "Spin-orbit synchronisation driven by tides; close-in planets around small stars lock within megayears. The Moon shows Earth one face: 1:1 locking."],
  ["Transit depth", "The fractional starlight blocked when a planet crosses its star's disk: (R_p/R_★)². Earth transiting the Sun = 84 parts per million."],
  ["Triple point", "The pressure-temperature (611.7 Pa, 273.16 K) where ice, liquid and vapour coexist. Below it, liquid water is impossible — the ground truth for Mars."],
  ["Vis-viva equation", "v² = GM(2/r − 1/a): orbital speed from position alone. It is why comets sprint at perihelion."],
  ["XUV flux", "X-ray + extreme-ultraviolet starlight, the driver of atmospheric heating and escape. Young stars output hundreds of times the modern Sun's."],
  ["ESI term weights", "The published exponents 0.57 (radius), 1.07 (density), 0.70 (escape velocity), 5.58 (temperature) — set by expert opinion in the 2011 paper."],
];

export default function Glossary() {
  const [q, setQ] = useState("");
  const f = TERMS.filter(([t, d]) => (t + d).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHero index="The Lexicon" title={<>Speak <span className="italic text-teal">planet</span>.</>}>
        Thirty-two terms, written the way a colleague would explain them at a whiteboard — precise enough
        to argue with, plain enough to remember.
      </PageHero>
      <section className="max-w-5xl mx-auto px-6 md:px-10">
        <Reveal>
          <div className="relative mb-10 max-w-md">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search the lexicon — try 'escape'…"
              className="w-full bg-panel border border-line rounded-full pl-11 pr-5 py-3 text-[13.5px] text-bone placeholder:text-faint focus:outline-none focus:border-amber/50 transition-colors"
            />
          </div>
        </Reveal>
        <div className="columns-1 md:columns-2 gap-5 [column-fill:balance]">
          {f.map(([t, d], i) => (
            <Reveal key={t} delay={Math.min(i, 8) * 30} className="break-inside-avoid mb-5">
              <div className="rounded-2xl border border-line bg-panel/40 p-6 hover:border-bone/15 transition-colors duration-300">
                <h3 className="font-display text-lg tracking-tight text-bone">{t}</h3>
                <p className="text-[13px] text-mist mt-2 leading-relaxed font-light">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        {f.length === 0 && (
          <p className="text-mist text-sm font-light py-10 text-center">No entries match — the lexicon is finite, the universe less so.</p>
        )}
        <Reveal className="mt-16">
          <Kicker> Meta </Kicker>
          <p className="text-[13px] text-faint font-light max-w-2xl leading-relaxed">
            Where definitions differ across the literature (and they do), this lexicon follows the usage in the
            papers cited on the Data page — primarily Kopparapu-2013-era habitability literature.
          </p>
        </Reveal>
      </section>
    </div>
  );
}
