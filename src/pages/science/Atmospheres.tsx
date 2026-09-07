import { Reveal, PageHero, Kicker, Equation, Callout } from "../../components/ui";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, Wind } from "lucide-react";

export default function Atmospheres() {
  return (
    <div>
      <PageHero index="Chapter III" title={<>Keeping the <span className="italic text-ice">sky</span>.</>}>
        Any nebula can hand a planet an atmosphere. The hard part is holding onto one for four billion years —
        against molecular kinetics, against the star's ultraviolet violence, against the wind of charged
        particles the star throws at it. Mars failed. Earth, so far, has not. This chapter is the difference.
      </PageHero>

      <section className="max-w-5xl mx-auto px-6 md:px-10 space-y-24">
        <Reveal>
          <Kicker n="3.1">Jeans escape — the kinetics of loss</Kicker>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="space-y-5 text-[14.5px] text-mist leading-relaxed font-light">
              <p>
                At the top of every atmosphere, gas is so thin that a fast molecule on an upward trajectory simply
                never collides again — it is on a ballistic orbit. If its speed exceeds escape velocity, it is gone.
                James Jeans worked out the evaporation rate from the thermal tail of the Maxwell distribution in
                1916, and the controlling dimensionless number is named for him.
              </p>
              <p>
                The Jeans parameter λ compares gravitational binding energy GMm/R to thermal energy kT. The empirical
                rule: <strong className="text-bone font-normal">λ &gt; ~15</strong> and the gas survives for geological
                ages; <strong className="text-bone font-normal">λ &lt; ~5</strong> and it drains quickly. The
                exponents are brutal — λ is why the Moon (v<sub>esc</sub> 2.4 km/s) is airless, why Titan (2.6 km/s,
                but bitterly cold at 94 K) keeps a thicker atmosphere than Earth's, and why no rocky planet hangs
                onto hydrogen.
              </p>
              <p>
                World's for scale: at the exobase, N₂ on Earth has λ ≈ 250; but H₂, at 1/14 the mass, sits at λ ≈ 18 —
                and on a warm world hydrogen-rich envelopes boil away, which is exactly how sub-Neptunes are thought
                to shrink into super-Earths (Owen & Wu 2013).
              </p>
            </div>
            <div className="space-y-4">
              <Equation source="Jeans 1916 · Catling & Kasting 2017, Ch. 5" caption="m = molecular mass, T_exo = exobase temperature. Worldforge computes λ for N₂, H₂O and CO₂ simultaneously.">
                λ = GM<sub>p</sub>m / (k<sub>B</sub> T<sub>exo</sub> R<sub>p</sub>)
              </Equation>
              <div className="rounded-2xl border border-line overflow-hidden">
                <div className="grid grid-cols-4 gap-px bg-line-soft text-[11.5px] font-mono text-center">
                  <div className="bg-abyss px-3 py-2.5 text-faint uppercase tracking-wider text-[9.5px]">Body</div>
                  <div className="bg-abyss px-3 py-2.5 text-faint uppercase tracking-wider text-[9.5px]">v<sub>esc</sub></div>
                  <div className="bg-abyss px-3 py-2.5 text-faint uppercase tracking-wider text-[9.5px]">T<sub>exo</sub></div>
                  <div className="bg-abyss px-3 py-2.5 text-faint uppercase tracking-wider text-[9.5px]">Verdict</div>
                  {[["Earth", "11.2", "~1000 K", "keeps N₂, sheds H₂", "#6fd3c7"], ["Mars", "5.0", "~300 K", "loses to sputtering", "#e3a94e"], ["Moon", "2.4", "~400 K", "airless", "#c9582e"], ["Titan", "2.6", "~190 K", "keeps N₂!", "#6fd3c7"], ["Mercury", "4.3", "~600 K", "airless", "#c9582e"]].map((r) => (
                    <div key={r[0]} className="contents">
                      <div className="bg-panel px-3 py-2.5 text-bone/90 text-left">{r[0]}</div>
                      <div className="bg-panel px-3 py-2.5 text-mist">{r[1]} km/s</div>
                      <div className="bg-panel px-3 py-2.5 text-mist">{r[2]}</div>
                      <div className="bg-panel px-3 py-2.5" style={{ color: r[4] }}>{r[3]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <Kicker n="3.2">The star fights back — XUV and wind</Kicker>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <Zap size={16} />, t: "X-ray & extreme UV", d: "Photons energetic enough to ionise atmospheric gases heat the upper atmosphere to escape temperatures wholesale. Young stars emit 100–1000× more XUV than the quiet middle-aged Sun; M-dwarfs, which host most known temperate planets, stay violent for billions of years (Shields et al. 2016)." },
              { icon: <Wind size={16} />, t: "The stellar wind", d: "A supersonic gale of protons streams past every planet. Unmagnetised worlds have nowhere to hide: the wind's electric field picks up ionised air and drags it to space — the process MAVEN measured stripping Mars of ~100 g of atmosphere every second today (Jakosky et al. 2015, Science 350:0210)." },
              { icon: <Shield size={16} />, t: "The magnetic question", d: "A global field deflects the wind around the planet, standing it off by many planetary radii. It is not a perfect shield — Earth's polar regions still leak — but cores that convect (large, iron-rich, fast-spinning) both generate fields and recycle volatiles via plate tectonics." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-line bg-panel/40 p-7">
                <span className="grid place-items-center w-10 h-10 rounded-full border border-ice/35 text-ice mb-5">{c.icon}</span>
                <h4 className="font-display text-lg">{c.t}</h4>
                <p className="text-[12.5px] text-mist mt-2.5 leading-relaxed font-light">{c.d}</p>
              </div>
            ))}
          </div>
          <Callout tone="ice" title="How Worldforge prices retention">
            The engine combines three factors multiplicatively: the Jeans score for N₂ (gravity × temperature),
            a magnetic-shielding factor from the moment slider (0–2× Earth), and an M-dwarf XUV activity proxy
            (damaging below ~0.45 M☉). It is heuristic — honest retention needs MHD simulations no pen-and-paper
            model can do — but it ranks worlds correctly against the Solar System's experiments.
          </Callout>
        </Reveal>

        <Reveal>
          <Kicker n="3.3">Hydrodynamic escape — when the sky boils</Kicker>
          <div className="space-y-5 text-[14.5px] text-mist leading-relaxed font-light max-w-3xl">
            <p>
              Under extreme XUV the upper atmosphere stops evaporating molecule-by-molecule (Jeans) and instead
              lifts off as a continuous, comet-like wind of gas — hydrodynamic escape. This is the standard
              explanation for Venus' missing water: a runaway greenhouse filled its stratosphere with steam,
              UV cracked the H₂O, and hydrogen blew off carrying the ocean with it. Isotope archaeology agrees —
              Venus' atmosphere is enriched in heavy deuterium ~150× over Earth's, the fingerprint of preferential
              hydrogen escape (Donahue et al. 1982).
            </p>
            <p>
              The same suspect haunts every close-in temperate planet ever found. Whether Proxima b still has
              air after 5 billion years beside a flare star is arguably the most consequential open question
              in exoplanet science — which is why the engine treats retention as a first-class score, not a
              footnote.
            </p>
          </div>
          <Link to="/simulation" className="group inline-flex items-center gap-2.5 rounded-full border border-ice/50 text-ice px-6 py-3 text-[13px] hover:bg-ice hover:text-ink transition-all">
            Compare Mars and Earth in the lab <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
