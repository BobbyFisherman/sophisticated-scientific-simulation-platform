import { useMemo, useState } from "react";
import { Reveal, PageHero, Kicker, Equation, Callout, Slider, Stat } from "../../components/ui";
import { equilibriumTemp, surfaceTemp, fmtC } from "../../engine/astro";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Temperature() {
  const [S, setS] = useState(1);
  const [A, setA] = useState(0.3);
  const [tau, setTau] = useState(0.84);
  const teq = useMemo(() => equilibriumTemp(S, A), [S, A]);
  const ts = useMemo(() => surfaceTemp(teq, tau), [teq, tau]);

  return (
    <div>
      <PageHero index="Chapter II" title={<>Light in, heat <span className="italic text-amber">out</span>.</>}>
        A planet's temperature is where two constancies meet: the star's output and the physics of blackbody
        radiation. Two short equations — energy balance and a grey atmosphere — take you from sunlight to a
        climate, and they are the thermal heart of this engine.
      </PageHero>

      <section className="max-w-5xl mx-auto px-6 md:px-10 space-y-24">
        <Reveal>
          <Kicker n="2.1">The first law of planetary climate</Kicker>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="space-y-5 text-[14.5px] text-mist leading-relaxed font-light">
              <p>
                A planet intercepts starlight on its disk — area πR² — and radiates from its whole sphere, 4πR².
                That single factor of 4, the ratio of a disk to a sphere, is the difference between a planet and a
                lightbulb. Setting absorbed sunlight equal to emitted infrared gives the
                <em> equilibrium temperature</em>: the temperature the world settles toward if its surface were a
                perfect, uniform blackbody.
              </p>
              <p>
                For Earth: S = 1361 W/m², A = 0.30, so T<sub>eq</sub> = 255 K (−18°C). Measured from space, Earth
                really does glow at 255 K. But we live at 288 K (+15°C). The missing 33 K is the entire story of
                the greenhouse effect — and the reason this chapter exists.
              </p>
            </div>
            <Equation source="Stefan 1879 · Boltzmann 1884" caption="The 278.4 K constant folds in the solar constant (1361 W/m²) and σ = 5.67×10⁻⁸ W m⁻² K⁻⁴; S is flux in Earth units.">
              T<sub>eq</sub> = 278.4 · S<sup>¼</sup> · (1 − A)<sup>¼</sup>
            </Equation>
          </div>
        </Reveal>

        <Reveal>
          <Kicker n="2.2">Albedo — the mirror fraction</Kicker>
          <div className="space-y-5 text-[14.5px] text-mist leading-relaxed font-light max-w-3xl">
            <p>
              The <em>Bond albedo</em> A is the share of starlight a world reflects straight back to space,
              integrated over all wavelengths and angles. It is planetary identity in one number: charcoal-dark
              Mercury (0.09), balanced Earth (0.30), and Venus under unbroken sulphuric-acid cloud (0.75) —
              Venus absorbs <em>less</em> sunlight than Earth despite being closer, which is why its equilibrium
              temperature is actually lower than Earth's.
            </p>
            <p>
              Albedo is also a feedback. Freeze an ocean and A rises, cooling the world further — the runtoward
              "snowball" states Earth itself experienced ~650 Myr ago. Melt the ice caps and A falls, accelerating
              the warming. The slider in the engine is, quietly, a climate-history dial.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            <Stat label="Mercury" value="0.09" unit="bare rock" />
            <Stat label="Mars" value="0.25" unit="dusty, thin air" />
            <Stat label="Earth" value="0.30" unit="ocean + cloud" tone="#6fd3c7" />
            <Stat label="Venus" value="0.75" unit="solid cloud deck" tone="#e3a94e" />
          </div>
        </Reveal>

        <Reveal>
          <Kicker n="2.3">The grey atmosphere</Kicker>
          <Equation source="Pierrehumbert, Principles of Planetary Climate (2010), Ch. 3" caption="Treat the atmosphere as a single infrared-absorbing layer characterised by optical depth τ. The surface warms until its stronger emission can push the same flux through the blanket.">
            T<sub>s</sub> = T<sub>eq</sub> · (1 + 3τ/4)<sup>1/4</sup>
          </Equation>
          <div className="grid md:grid-cols-2 gap-10 mt-8 text-[14.5px] text-mist leading-relaxed font-light">
            <div className="space-y-5">
              <p>
                Optical depth τ counts how many times, on average, an infrared photon is absorbed before it escapes.
                τ = 0: bare rock, T<sub>s</sub> = T<sub>eq</sub>. Earth's τ ≈ 0.84 → +33 K. Venus, with 92 bar
                of nearly pure CO₂ plus stratospheric haze, sits at τ ≈ 120 in this grey language — pushing
                232 K of equilibrium into roughly 720 K of surface, close to its observed 737 K.
              </p>
              <p>
                The engine synthesises τ from two human-legible inputs: total pressure (more gas, more paths to
                block) and a greenhouse index standing in for composition — 1.0 for a modern-Earth mix, ~5 for a
                nearly pure CO₂ sky. It is a deliberately transparent compression of real spectroscopy.
              </p>
            </div>
            <div className="space-y-6">
              <Equation source="Kasting 1988 · Pierrehumbert 2010" caption="Beyond the flux limit f_runaway, no surface temperature can radiate enough to balance the books: the ocean enters the atmosphere wholesale. The grey law blows past this point — Worldforge flags it as the runaway regime.">
                F<sub>out</sub> → F<sub>limit</sub> as T<sub>s</sub> → ∞
              </Equation>
              <Callout tone="amber" title="The grey law's breaking point">
                The (1 + 3τ/4)¼ law underestimates the true runaway: real atmospheres hit the Komabayashi–Ingersoll
                limit (~290 W/m² for Earth gravity) and then oceans evaporate entirely regardless of surface
                temperature. The engine reports both — the grey surface temperature and the runaway warning.
              </Callout>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <Kicker n="2.4">Feel it — the thermal sandbox</Kicker>
          <div className="rounded-3xl border border-line bg-panel/50 p-8 md:p-10">
            <div className="grid md:grid-cols-[1fr_280px] gap-10">
              <div className="space-y-8">
                <Slider label="Received sunlight S" value={S} min={0.05} max={4} accent="#e3a94e" display={`${S.toFixed(2)} × Earth`} onChange={setS}
                  hint="Earth 1.0 · Venus 1.91 · Mars 0.43 · TRAPPIST-1e 0.66" />
                <Slider label="Bond albedo A" value={A} min={0.02} max={0.8} accent="#7fb6d9" display={A.toFixed(2)} onChange={setA}
                  hint="The mirror: brighter worlds run cooler" />
                <Slider label="Optical depth τ" value={tau} min={0} max={8} accent="#b99ce8" display={tau.toFixed(2)} onChange={setTau}
                  hint="0 = airless · 0.84 = Earth · 2–5 = thick CO₂" />
              </div>
              <div className="flex flex-col justify-center gap-5">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-faint">equilibrium</div>
                  <div className="font-mono text-3xl tabular text-bone mt-1">{fmtC(teq)}</div>
                </div>
                <div className="h-px bg-line" />
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-faint">surface (grey model)</div>
                  <div className="font-mono text-5xl tabular mt-1" style={{ color: ts >= 273 && ts < 320 ? "#6fd3c7" : ts >= 320 ? "#c9582e" : "#7fb6d9" }}>{fmtC(ts)}</div>
                  <div className="text-[11px] font-mono text-faint mt-2">greenhouse boost +{(ts - teq).toFixed(1)} K</div>
                </div>
              </div>
            </div>
          </div>
          <Link to="/observatory" className="group inline-flex items-center gap-2.5 rounded-full border border-amber/50 text-amber px-6 py-3 text-[13px] hover:bg-amber hover:text-ink transition-all">
            Couple it to a full planet <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
