import { Reveal, PageHero, Kicker, Callout } from "../components/ui";
import { Link } from "react-router-dom";
import { ArrowRight, Telescope, FlaskConical, Code2, HeartHandshake } from "lucide-react";

export default function About() {
  return (
    <div>
      <PageHero index="Colophon" title={<>Why this engine <span className="italic text-amber">exists</span>.</>}>
        A note on what Worldforge is, who it serves, and the epistemic contract between a beautiful
        instrument and the people who trust it.
      </PageHero>

      <section className="max-w-4xl mx-auto px-6 md:px-10 space-y-20">
        <Reveal>
          <div className="space-y-6 text-[15px] text-mist leading-[1.9] font-light">
            <p className="font-display text-2xl md:text-[1.75rem] text-bone leading-snug">
              Somewhere between the textbook and the telescope, there should be a bench where you are allowed
              to touch the universe's controls.
            </p>
            <p>
              Exoplanet science has produced one of the great datasets of the century: five and a half thousand
              worlds with orbits and sizes, a handful with atmospheres, and none — yet — with a confirmed ocean.
              But the science that connects those sparse constants to the question everyone actually asks —
              <em> could anything live there?</em> — lives inside specialist climate codes that take weeks to
              run and years to learn.
            </p>
            <p>
              Worldforge is the middle rung. Fast enough to be playful; honest enough that the play teaches
              the real physics. Every quantity it shows can be derived on a page, and the derivations are
              printed here alongside the papers they came from. It is calibrated, openly, against the only
              three terrestrial climates we have measured — Earth, Venus and Mars — and it wears its
              simplifications on the outside.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <Kicker n="A">The contract</Kicker>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <FlaskConical size={16} />, t: "Nothing hidden", d: "Every score can be decomposed into visible sub-scores; every formula is printed with its source; every limitation is stated on the Method page rather than buried in a footnote." },
              { icon: <Telescope size={16} />, t: "Ground truth first", d: "Fourteen real worlds ship with their discovery citations. Measured values are measured; modelled values are marked. The engine never silently invents data." },
              { icon: <Code2 size={16} />, t: "Deterministic", d: "No randomness, no telemetry, no calls home. The same twelve inputs always produce the same outputs — an instrument, not a slot machine." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-line bg-panel/40 p-7">
                <span className="grid place-items-center w-10 h-10 rounded-full border border-teal/35 text-teal mb-5">{c.icon}</span>
                <h4 className="font-display text-lg">{c.t}</h4>
                <p className="text-[12.5px] text-mist mt-2.5 leading-relaxed font-light">{c.d}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <Kicker n="B">What it is not</Kicker>
          <Callout tone="amber" title="Not a research instrument">
            Worldforge will not tell you whether TRAPPIST-1 e has an atmosphere — only JWST is patient and
            expensive enough for that. It is a teaching engine: it shows how the terms of that question
            behave when you push them. Treat its verdicts as educated argument, not measurement.
          </Callout>
          <div className="mt-6">
            <Callout tone="ice" title="Not the whole habitability story">
              Subsurface oceans under ice shells, plate tectonics, obliquity cycles, photochemical hazes and
              alternative biochemistries are all real science this engine deliberately does not model.
              The classical liquid-water habitable zone is the floor of the debate, not its ceiling.
            </Callout>
          </div>
        </Reveal>

        <Reveal>
          <Kicker n="C">The craft</Kicker>
          <div className="space-y-6 text-[14.5px] text-mist leading-relaxed font-light">
            <p>
              The engine is a single pure TypeScript function — <span className="font-mono text-teal text-[13px]">derive(inputs)</span> —
              implementing the Stefan–Boltzmann balance, a grey atmosphere, Kopparapu polynomials, Chen–Kipping
              mass–radius, Jeans escape, Peale-style tidal locking, vis-viva mechanics and the Schulze-Makuch index.
              The simulation solves Kepler's equation by Newton–Raphson sixty times per second; the charts are
              drawn from the same numbers, never approximated for display.
            </p>
            <div className="flex items-start gap-3.5 rounded-2xl border border-line bg-panel/40 p-6">
              <HeartHandshake size={16} className="text-amber mt-0.5 shrink-0" />
              <p className="text-[13px]">
                Standing on the shoulders of the habitability literature — Kasting's group at Penn State,
                Kopparapu et al., the Virtual Planetary Laboratory, and the teams who found all fourteen
                worlds in the library. Errors of compression are ours, not theirs.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="rounded-3xl border border-line bg-panel/40 p-10 md:p-14 text-center">
            <h2 className="font-display text-3xl md:text-5xl tracking-tight">The observatory is <span className="italic text-amber">open</span>.</h2>
            <p className="text-mist mt-4 max-w-md mx-auto font-light">Twelve levers. Fourteen real worlds. Zero prerequisites.</p>
            <Link to="/observatory" className="group inline-flex items-center gap-2.5 mt-8 rounded-full bg-amber text-ink px-8 py-4 text-sm font-medium hover:bg-bone transition-colors">
              Begin <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
