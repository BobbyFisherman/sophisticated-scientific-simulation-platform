import { Reveal, PageHero, Kicker, Equation, Callout, Stat } from "../../components/ui";
import { derive } from "../../engine/astro";
import { PRESETS } from "../../engine/presets";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const ROWS = PRESETS.filter((p) => !["mercury"].includes(p.id))
  .map((p) => ({ p, d: derive(p.inputs) }))
  .sort((a, b) => b.d.esi.global - a.d.esi.global);

export default function Similarity() {
  return (
    <div>
      <PageHero index="Chapter IV" title={<>The honest <span className="italic text-amber">number</span>.</>}>
        A planet is a thousand facts. Policy, press releases and telescope-time committees demand one.
        This chapter is about compressing worlds into scores — the Earth Similarity Index that started
        the genre, and the Worldforge habitability index that extends it.
      </PageHero>

      <section className="max-w-5xl mx-auto px-6 md:px-10 space-y-24">
        <Reveal>
          <Kicker n="4.1">ESI — similarity, not habitability</Kicker>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="space-y-5 text-[14.5px] text-mist leading-relaxed font-light">
              <p>
                In 2011, Dirk Schulze-Makuch and colleagues proposed a deceptively simple device:
                for each measurable property x, how far is the planet from Earth's value x₀ — measured as a
                fractional difference, never able to go negative — and then blended as a weighted geometric mean
                (Schulze-Makuch et al. 2011, Astrobiology 11:1041).
              </p>
              <p>
                Four terms make the published index: <strong className="text-bone font-normal">radius</strong> (w = 0.57),
                <strong className="text-bone font-normal"> bulk density</strong> (1.07),
                <strong className="text-bone font-normal"> escape velocity</strong> (0.70) and
                <strong className="text-bone font-normal"> surface temperature</strong> (5.58).
                The temperature term gets ten times the radius weight: this is a temperature-first index,
                by design and by vote of the authors' panel.
              </p>
              <p>
                ESI famously scores Titan ≈ 0.24 and the Moon ≈ 0.56 — a reminder that <em>similar to Earth</em>
                is not <em>habitable</em>. It answers a narrower question: if this object appeared in a telescope,
                how surprised would Earth's geologists be?
              </p>
            </div>
            <Equation source="Schulze-Makuch et al. 2011 — with Worldforge's modeled surface temperature" caption="wᵢ are the published weights; the exponent normalises them. Earth evaluates, by construction, to exactly 1.000.">
              ESI = Π<sub>i</sub> ( 1 − |xᵢ − x<sub>i,0</sub>| / (xᵢ + x<sub>i,0</sub>) )<sup>wᵢ/Σw</sup>
            </Equation>
          </div>
        </Reveal>

        <Reveal>
          <Kicker n="4.2">The library, ranked live</Kicker>
          <p className="text-mist text-[14.5px] max-w-2xl font-light mb-8">
            Every world in the Worldforge library, passed through the same ESI computation the Observatory runs:
          </p>
          <div className="rounded-2xl border border-line overflow-hidden">
            {ROWS.map(({ p, d }, i) => (
              <div key={p.id} className={`grid grid-cols-[36px_1fr_auto] md:grid-cols-[46px_1.4fr_1fr_0.7fr_0.7fr_auto] gap-4 items-center px-5 py-3.5 ${i % 2 ? "bg-panel/30" : "bg-panel/60"} border-b border-line-soft last:border-0`}>
                <span className="font-mono text-[11px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-[15px] truncate">{p.name}</span>
                <span className="hidden md:block text-[11.5px] font-mono text-faint truncate">{p.discovery.split(" — ")[0]}</span>
                <span className="hidden md:block text-[11.5px] font-mono text-mist tabular">{(d.Tsurf - 273.15).toFixed(0)}°C</span>
                <span className="hidden md:block text-[11.5px] font-mono text-mist tabular">H {d.scores.H}</span>
                <span className="text-right">
                  <span className="font-mono text-sm tabular" style={{ color: d.esi.global > 0.8 ? "#6fd3c7" : d.esi.global > 0.6 ? "#e3a94e" : "#c9582e" }}>
                    {d.esi.global.toFixed(3)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <Kicker n="4.3">H — the Worldforge habitability index</Kicker>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="space-y-5 text-[14.5px] text-mist leading-relaxed font-light">
              <p>
                Where ESI measures resemblance, the H index prices <em>opportunity</em>. Four sub-scores,
                each defensible on its own, combine geometrically so that a single catastrophic factor can
                sink the whole:
              </p>
              <ul className="space-y-3.5">
                {[
                  ["Temperature fit (40%)", "A Gaussian around 15°C with σ = 42 K — the thermal window where known biochemistry runs fastest."],
                  ["Water availability (25%)", "Climate-state dependent: full marks for open oceans, partial for eyeball states, near-zero below the triple point."],
                  ["Atmosphere quality (20%)", "Pressure-band fitness multiplied by the retention score — having air now is not the same as keeping it."],
                  ["Stellar stability (15%)", "Flare tax for young M-dwarfs, lifetime tax for massive stars that burn out inside a billion years."],
                ].map(([t, dd]) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-teal shrink-0" />
                    <span><span className="text-bone/90">{t}.</span> <span className="text-mist">{dd}</span></span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Earth" value="100" unit="definitionally maximal" tone="#6fd3c7" />
                <Stat label="Kepler-452 b" value={String(derive(PRESETS.find((p) => p.id === "kepler452b")!.inputs).scores.H)} unit="best candidate" />
                <Stat label="Mars" value={String(derive(PRESETS.find((p) => p.id === "mars")!.inputs).scores.H)} unit="desiccated" />
                <Stat label="Venus" value={String(derive(PRESETS.find((p) => p.id === "venus")!.inputs).scores.H)} unit="runaway" tone="#c9582e" />
              </div>
              <Callout tone="amber" title="Why multiply rather than add">
                Habitability is a conjunction: a world needs temperature <em>and</em> water <em>and</em> air
                <em>and</em> time. Geometric means encode that a zero anywhere zeroes everything — an additive
                score would let a 600 K world with a great magnetic field pass as "average".
              </Callout>
            </div>
          </div>
          <Equation source="Worldforge scoring convention — fully inspectable in the Observatory" caption="Sub-scores are weighted geometrically, exponents summing to 1. Every sub-score is displayed beside the headline number; nothing hides inside the index.">
            H = 100 · T<sub>fit</sub><sup>0.40</sup> · W<sup>0.25</sup> · A<sub>atm</sub><sup>0.20</sup> · S<sub>star</sub><sup>0.15</sup>
          </Equation>
        </Reveal>

        <Reveal>
          <Kicker n="4.4">The critics are right — and it still helps</Kicker>
          <div className="space-y-5 text-[14.5px] text-mist leading-relaxed font-light max-w-3xl">
            <p>
              Similarity indices have honest detractors. Any index silently encodes which Earth we mean
              (today's? the Archaean's, with no oxygen and a fainter Sun?), and weight choices are judgement
              calls (Heller & Barnes 2013). No number replaces the full climate calculation.
            </p>
            <p>
              But indices do the one thing raw tables cannot: they <em>rank</em>. When JWST has more
              atmosphere requests than time, something must sort the queue. The virtue of a transparent index —
              one whose every input you can see and argue with — is that its disagreements teach you where the
              physics is uncertain. That is the philosophy behind exposing every sub-score in this instrument.
            </p>
          </div>
          <Link to="/observatory" className="group inline-flex items-center gap-2.5 rounded-full border border-amber/50 text-amber px-6 py-3 text-[13px] hover:bg-amber hover:text-ink transition-all">
            Argue with the index <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
