import { Reveal, PageHero, Kicker, Equation, Callout, Stat } from "../../components/ui";
import { HZChart } from "../../components/HZChart";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function HabitableZones() {
  return (
    <div>
      <PageHero index="Chapter I" title={<>The habitable <span className="italic text-teal">zone</span>.</>}>
        The oldest idea in astrobiology is a geometric one: too close and oceans boil; too far and they freeze.
        Between those two failures lies an annulus around every star where liquid water can persist on a
        rocky surface. This chapter is about where those edges actually are — and why they move with the
        colour of the star.
      </PageHero>

      <section className="max-w-5xl mx-auto px-6 md:px-10 space-y-24">
        <Reveal>
          <Kicker n="1.1">The classical picture</Kicker>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="space-y-5 text-[14.5px] text-mist leading-relaxed font-light">
              <p>
                In 1959, Su-Shu Huang asked what stellar types could host planets with Earth-like temperatures, and in 1993
                James Kasting's group at Penn State answered with the first self-consistent climate calculation:
                1-D radiative–convective models of a CO₂/H₂O atmosphere around main-sequence stars
                (Kasting, Whitmire & Reynolds 1993, Icarus 101:108).
              </p>
              <p>
                The inner edge is set by a feed-forward catastrophe. Warm the planet and more water evaporates;
                water vapour is itself a greenhouse gas, so it warms further. Past a critical flux the loop runs
                away — the entire ocean enters the sky, UV light cracks the water apart, hydrogen escapes to
                space, and the world is left like Venus: dry and baking.
              </p>
              <p>
                The outer edge is set by the opposite pathology. CO₂ warms only up to a point; add more and it
                begins to condense into bright ice clouds that reflect starlight — the greenhouse saturates, and
                even a pure-CO₂ sky cannot keep the surface above freezing. Beyond that <em>maximum greenhouse</em>
                distance, any amount of CO₂ fails.
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Sun's inner edge" value="0.99" unit="AU (runaway GH)" />
                <Stat label="Sun's outer edge" value="1.70" unit="AU (max GH)" tone="#6fd3c7" />
                <Stat label="Optimistic inner" value="0.75" unit="AU (recent Venus)" />
                <Stat label="Optimistic outer" value="1.77" unit="AU (early Mars)" tone="#7fb6d9" />
              </div>
              <Callout tone="teal" title="Earth sits 1% from the inner edge — and doesn't run away">
                Clouds, weather and ocean heat transport do stabilising work a 1-D model cannot see.
                Radiosonde-calibrated models put the true trigger closer to ~1.06× modern flux (Kopparapu+ 2013),
                and geological evidence of early liquid oceans says the empirical edges can be wider still.
              </Callout>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <Kicker n="1.2">The runaway greenhouse, formulated</Kicker>
          <Equation source="Kopparapu, Ramirez, Kasting et al. 2013, ApJ 765:131 — Table 2" caption="Boundary fluxes are fourth-order polynomials in stellar colour, T* = T_eff − 5780 K. Worlds interior to a boundary exceed its flux; the planet cannot keep surface oceans in that regime.">
            S<sub>eff</sub>(T*) = S<sub>eff,⊙</sub> + aT* + bT*² + cT*³ + dT*⁴
          </Equation>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-[12.5px] font-mono">
              <thead>
                <tr className="text-faint text-[10px] uppercase tracking-[0.18em] border-b border-line">
                  <th className="text-left px-5 py-3 font-normal">Boundary</th>
                  <th className="text-right px-4 py-3 font-normal">S_eff,⊙</th>
                  <th className="text-right px-4 py-3 font-normal">a</th>
                  <th className="text-right px-4 py-3 font-normal">b</th>
                  <th className="text-right px-4 py-3 font-normal">c</th>
                  <th className="text-right px-5 py-3 font-normal">d</th>
                </tr>
              </thead>
              <tbody className="text-bone/80">
                {[
                  ["Recent Venus", "1.776", "2.136e−4", "2.533e−8", "−1.332e−11", "−3.097e−15"],
                  ["Runaway GH", "1.107", "1.332e−4", "1.580e−8", "−8.308e−12", "−1.931e−15"],
                  ["Maximum GH", "0.356", "6.171e−5", "1.698e−9", "−3.198e−12", "−5.575e−16"],
                  ["Early Mars", "0.3207", "5.547e−5", "1.526e−9", "−2.874e−12", "−5.011e−16"],
                ].map((r) => (
                  <tr key={r[0]} className="border-b border-line-soft last:border-0 hover:bg-bone/[0.03]">
                    {r.map((c, i) => <td key={i} className={`px-4 py-3 ${i === 0 ? "px-5 text-bone" : "text-right"} ${i === 5 ? "px-5" : ""}`}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-faint mt-3 font-light">The distance of each edge follows from the flux definition: d = √(L★/S_eff). Worldforge evaluates these coefficients verbatim — nothing is fitted after the fact.</p>
        </Reveal>

        <Reveal>
          <Kicker n="1.3">The map</Kicker>
          <h3 className="font-display text-2xl md:text-3xl tracking-tight mb-6">Every star, one annulus — hover the worlds.</h3>
          <div className="rounded-3xl border border-line bg-panel/40 p-5 md:p-8">
            <HZChart />
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {[
              ["The zone collapses around red dwarfs", "A 0.1 M☉ M-dwarf's zone hugs the star at 0.02–0.06 AU — so close that planets there are tidally locked and bathed in flares. Most of the galaxy's stars are these."],
              ["K-dwarfs are the sweet spot", "Quieter than M-dwarfs, plentiful, and stable for 30+ Gyr — hosts like Kepler-442 offer the zone without the flare tax."],
              ["The zone migrates over time", "Stars brighten as they age (~10%/Gyr for the Sun). Today's temperate world is inside tomorrow's runaway; Venus may once have been inside the young Sun's zone."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-line-soft bg-panel/30 p-6">
                <h4 className="font-display text-base leading-snug">{t}</h4>
                <p className="text-[12.5px] text-mist mt-2 leading-relaxed font-light">{d}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <Kicker n="1.4">The corners of the box</Kicker>
          <div className="space-y-6 text-[14.5px] text-mist leading-relaxed font-light max-w-3xl">
            <p>
              The classical zone is deliberately conservative. Several published mechanisms stretch it:
              dry planets with little water can stay temperate closer in (the “Dune” regime — Abe et al. 2011);
              substellar-point clouds on tidally locked worlds can stabilise climates at 2× the classical inner
              flux (Yang et al. 2014); and a few percent of atmospheric hydrogen can keep a world warm well
              beyond the outer edge (Ramirez & Kaltenegger 2014).
            </p>
            <p>
              Worldforge draws the classical boundaries because they are the community's reference standard —
              but it prices these escape hatches into its notes and scores, flagging eyeball climates and
              hydrogen-warmed outliers wherever the physics allows them.
            </p>
          </div>
          <Link to="/observatory" className="group inline-flex items-center gap-2.5 rounded-full border border-teal/40 text-teal px-6 py-3 text-[13px] hover:bg-teal hover:text-ink transition-all">
            Test the boundaries yourself <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
