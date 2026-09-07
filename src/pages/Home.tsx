import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sun, Orbit, Globe2, Wind, Sigma, BookOpenText, FlaskConical, Telescope } from "lucide-react";
import { Starfield } from "../components/Starfield";
import { Slider, Kicker, Reveal } from "../components/ui";
import { DEFAULT_INPUTS, SystemInputs, derive, fmtC, massToLuminosity } from "../engine/astro";
import { PRESETS } from "../engine/presets";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export default function Home() {
  const [mini, setMini] = useState<SystemInputs>(DEFAULT_INPUTS);
  const md = useMemo(() => derive(mini), [mini]);
  const setM = (patch: Partial<SystemInputs>) =>
    setMini((s) => ({ ...s, ...(patch.starMass !== undefined ? { luminosity: massToLuminosity(patch.starMass!) } : {}), ...patch }));

  return (
    <div>
      {/* ============================================================ HERO */}
      <section className="relative min-h-[100svh] flex flex-col overflow-hidden hero-glow">
        <img src="/images/nebula.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-screen" />
        <Starfield density={170} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/10 via-transparent to-ink" />

        <div className="relative flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 md:px-10 pt-32 pb-16">
          <motion.div {...fadeUp} transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}>
            <div className="flex items-center gap-4 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-amber pulse-dot" />
              <span className="font-mono text-[11px] tracking-[0.32em] uppercase text-mist">An engine for imagining other worlds</span>
            </div>
          </motion.div>

          <motion.h1
            {...fadeUp} transition={{ duration: 1.1, delay: 0.12, ease: [0.19, 1, 0.22, 1] }}
            className="font-display tracking-tight leading-[0.98] text-[15vw] sm:text-7xl md:text-8xl lg:text-[7.2rem] max-w-6xl"
          >
            How alive<br />
            is <span className="italic text-amber">your</span> world?
          </motion.h1>

          <motion.p
            {...fadeUp} transition={{ duration: 1.1, delay: 0.28, ease: [0.19, 1, 0.22, 1] }}
            className="mt-8 max-w-xl text-mist text-base md:text-lg leading-relaxed font-light"
          >
            Worldforge is a planetary habitability engine. Tune twelve physical levers — the star,
            the orbit, the oceans, the air — and watch forty published equations from real
            astrophysics weigh your world's chances of holding liquid water, and life.
          </motion.p>

          <motion.div {...fadeUp} transition={{ duration: 1.1, delay: 0.42, ease: [0.19, 1, 0.22, 1] }} className="mt-10 flex flex-wrap items-center gap-4">
            <Link to="/observatory" className="group rounded-full bg-amber text-ink px-7 py-3.5 text-sm font-medium flex items-center gap-2 hover:bg-bone transition-colors duration-300">
              Open the Observatory <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/simulation" className="rounded-full border border-line px-7 py-3.5 text-sm text-mist hover:text-bone hover:border-bone/30 transition-all duration-300">
              Watch a world orbit
            </Link>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 1.1, delay: 0.6, ease: [0.19, 1, 0.22, 1] }} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-line-soft rounded-2xl overflow-hidden border border-line-soft max-w-3xl">
            {[
              ["12", "physical levers"],
              ["24", "computed quantities"],
              ["14", "real worlds loaded"],
              ["40+", "published equations"],
            ].map(([v, l]) => (
              <div key={l} className="bg-ink/70 backdrop-blur px-5 py-4">
                <div className="font-mono text-2xl text-bone tabular">{v}</div>
                <div className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-faint mt-1">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* scroll cue */}
        <div className="relative pb-8 flex justify-center">
          <div className="w-px h-14 bg-gradient-to-b from-transparent via-bone/30 to-transparent" />
        </div>
      </section>

      {/* ============================================================ MARQUEE */}
      <div className="border-y border-line py-4 overflow-hidden">
        <div className="marquee-track flex whitespace-nowrap gap-10 text-[11px] font-mono uppercase tracking-[0.3em] text-faint w-max">
          {[0, 1].map((rep) => (
            <div key={rep} className="flex gap-10 shrink-0">
              {["equilibrium temperature", "runaway greenhouse", "Bond albedo", "Jeans escape", "Earth similarity index", "tidal locking", "Chen–Kipping relation", "grey atmosphere", "Kopparapu boundaries", "vis-viva", "XUV flux", "moist stratosphere"].map((t) => (
                <span key={t} className="flex items-center gap-10"><span>{t}</span><span className="text-amber/50">·</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ LIVE MINI LAB */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-24 md:pt-32">
        <Reveal>
          <Kicker n="01">A taste of the instrument</Kicker>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight max-w-3xl">
            Drag a slider. <span className="italic text-teal">Physics answers.</span>
          </h2>
          <p className="text-mist mt-5 max-w-xl font-light leading-relaxed">
            This is the real engine, running inline — the same code that drives the full Observatory.
            Pull a distant star close, thicken the air, watch a climate turn.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 rounded-3xl border border-line bg-panel/50 backdrop-blur-sm overflow-hidden">
            <div className="grid md:grid-cols-[1fr_340px]">
              <div className="p-8 md:p-10 space-y-8 border-b md:border-b-0 md:border-r border-line">
                <Slider label="Distance from star" value={mini.semiMajor} min={0.05} max={5} scale="log" accent="#6fd3c7"
                  display={`${mini.semiMajor.toFixed(3)} AU`} hint="Master control of received sunlight" onChange={(semiMajor) => setM({ semiMajor })} />
                <Slider label="Stellar mass" value={mini.starMass} min={0.08} max={3} accent="#e3a94e"
                  display={`${mini.starMass.toFixed(2)} M☉ · ${md.spectral}`} hint="Small stars are dim, slow-burning, and flare" onChange={(starMass) => setM({ starMass })} />
                <Slider label="Surface pressure" value={mini.pressure} min={0.001} max={100} scale="log" accent="#b99ce8"
                  display={`${mini.pressure.toFixed(3)} atm`} hint="Thin air barely insulates; thick air traps" onChange={(pressure) => setM({ pressure })} />
                <Slider label="Greenhouse index" value={mini.ghgIndex} min={0} max={5} accent="#b99ce8"
                  display={`${mini.ghgIndex.toFixed(2)}×`} hint="1 = Earth's mix · 5 = pure CO₂" onChange={(ghgIndex) => setM({ ghgIndex })} />
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center gap-6 bg-abyss/30">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-faint">modelled surface</div>
                  <div className="font-mono text-5xl tabular mt-2 transition-colors duration-500" style={{ color: md.Tsurf >= 273 && md.Tsurf < 320 ? "#6fd3c7" : md.Tsurf >= 320 ? "#c9582e" : "#7fb6d9" }}>
                    {fmtC(md.Tsurf)}
                  </div>
                </div>
                <div className="space-y-3 text-[12.5px]">
                  <Line k="received sunlight" v={`${md.S.toFixed(3)} × Earth`} />
                  <Line k="zone position" v={md.hzPosition} />
                  <Line k="surface water" v={md.waterState.label} tone />
                  <Line k="habitability" v={`${md.scores.H} / 100`} />
                </div>
                <Link to="/observatory" className="group flex items-center gap-2 text-[12.5px] font-mono text-amber mt-2 u-sweep w-fit">
                  All twelve levers live in the Observatory <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============================================================ THE INSTRUMENT */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-28 md:pt-36">
        <Reveal>
          <Kicker n="02">The instrument</Kicker>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight max-w-4xl">
            One world, three ways to <span className="italic text-amber">interrogate</span> it.
          </h2>
        </Reveal>
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {[
            {
              icon: <Telescope size={18} />, to: "/observatory", n: "I", title: "Configure",
              body: "Twelve levers across four instrument panels — star, orbit, world, atmosphere. Earth, Mars, Venus and eleven real exoplanets load as calibrated presets.",
            },
            {
              icon: <Sigma size={18} />, to: "/method", n: "II", title: "Compute",
              body: "Forty published relations fire in sequence: mass–luminosity, Stefan–Boltzmann balance, grey-atmosphere greenhouse, Kopparapu zone edges, Jeans escape, ESI.",
            },
            {
              icon: <Orbit size={18} />, to: "/simulation", n: "III", title: "Simulate",
              body: "Watch your world ride its orbit under true Keplerian mechanics — flux breathing with distance, colour following temperature, years passing in seconds.",
            },
          ].map((c, i) => (
            <Reveal key={c.n} delay={i * 110}>
              <Link to={c.to} className="group block h-full rounded-3xl border border-line bg-panel/40 p-8 hover:bg-panel/70 hover:border-bone/15 transition-all duration-500">
                <div className="flex items-center justify-between">
                  <span className="grid place-items-center w-11 h-11 rounded-full border border-amber/35 text-amber">{c.icon}</span>
                  <span className="font-display italic text-4xl text-bone/10 group-hover:text-amber/30 transition-colors duration-500">{c.n}</span>
                </div>
                <h3 className="font-display text-2xl mt-7 tracking-tight">{c.title}</h3>
                <p className="text-mist text-[13.5px] mt-3 leading-relaxed font-light">{c.body}</p>
                <div className="mt-6 flex items-center gap-2 text-[12px] font-mono text-faint group-hover:text-amber transition-colors">
                  Enter <ArrowUpRight size={13} />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================================================ REAL WORLDS */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-28 md:pt-36">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Kicker n="03">Ground truth</Kicker>
              <h2 className="font-display text-4xl md:text-6xl tracking-tight max-w-3xl">
                Built on worlds we <span className="italic text-teal">actually found</span>.
              </h2>
            </div>
            <Link to="/worlds" className="text-[12.5px] font-mono text-teal u-sweep whitespace-nowrap mb-2">Browse all 14 worlds →</Link>
          </div>
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {["trappist1e", "kepler452b", "proximab"].map((id, i) => {
            const pr = PRESETS.find((p) => p.id === id)!;
            const pd = derive(pr.inputs);
            return (
              <Reveal key={id} delay={i * 110}>
                <div className="rounded-3xl border border-line bg-panel/40 p-7 hover:border-bone/15 transition-colors duration-500 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-faint">{pr.discovery.split(" — ")[0]}</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: pd.waterState.tone === "teal" ? "#6fd3c7" : pd.waterState.tone === "ice" ? "#7fb6d9" : "#e3a94e" }}>
                      <Globe2 size={11} /> {pd.waterState.label.split("—")[0]}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl tracking-tight">{pr.name}</h3>
                  <p className="text-mist text-[13px] mt-2.5 leading-relaxed font-light flex-1">{pr.tagline}</p>
                  <div className="grid grid-cols-3 gap-2 mt-6 text-center">
                    {[["Flux", `${pd.S.toFixed(2)} S⊕`], ["Surface", fmtC(pd.Tsurf)], ["H-index", `${pd.scores.H}`]].map(([k, v]) => (
                      <div key={k} className="rounded-lg bg-abyss/60 border border-line-soft py-2.5">
                        <div className="text-[8.5px] font-mono uppercase tracking-[0.16em] text-faint">{k}</div>
                        <div className="font-mono text-[13px] tabular mt-1 text-bone/90">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============================================================ SCIENCE DOORS */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-28 md:pt-36 pb-8">
        <Reveal>
          <Kicker n="04">The scholarship</Kicker>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight max-w-4xl">
            Every number is <span className="italic text-amber">argued for</span>.
          </h2>
          <p className="text-mist mt-5 max-w-xl font-light leading-relaxed">
            Four long-form chapters walk the science — from where a habitable zone begins, to why
            Mars lost its sky. Two more pages list every constant, citation and caveat.
          </p>
        </Reveal>
        <div className="mt-12 border-t border-line">
          {[
            { to: "/science/habitable-zones", icon: <Sun size={16} />, t: "The Habitable Zone", d: "Kopparapu et al. (2013) and the flux boundaries that define where oceans can exist.", n: "4 200 words · charts" },
            { to: "/science/temperature", icon: <Sigma size={16} />, t: "Energy & Temperature", d: "Stefan–Boltzmann balance, albedo, and the grey atmosphere that turns 255 K into 288 K.", n: "the ΔT engine" },
            { to: "/science/atmospheres", icon: <Wind size={16} />, t: "Atmospheric Escape", d: "Jeans escape, M-dwarf XUV, magnetic shields — why keeping air is harder than making it.", n: "the retention model" },
            { to: "/science/similarity", icon: <BookOpenText size={16} />, t: "Similarity Metrics", d: "ESI and the Worldforge habitability index — compressing a planet into an honest number.", n: "the scoring" },
          ].map((s, i) => (
            <Reveal key={s.to} delay={i * 60}>
              <Link to={s.to} className="group grid md:grid-cols-[46px_1fr_auto] gap-5 items-center py-7 border-b border-line px-2 hover:bg-panel/40 transition-colors duration-300">
                <span className="grid place-items-center w-10 h-10 rounded-full border border-line text-mist group-hover:text-amber group-hover:border-amber/40 transition-colors">{s.icon}</span>
                <div>
                  <h3 className="font-display text-xl md:text-2xl tracking-tight group-hover:text-amber transition-colors duration-300">{s.t}</h3>
                  <p className="text-mist text-[13px] mt-1.5 font-light">{s.d}</p>
                </div>
                <div className="hidden md:flex items-center gap-5">
                  <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-faint">{s.n}</span>
                  <ArrowRight size={16} className="text-faint group-hover:text-amber group-hover:translate-x-1.5 transition-all duration-300" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================================================ FINAL CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-24 pb-4">
        <Reveal>
          <div className="relative rounded-[2.5rem] border border-line overflow-hidden">
            <img src="/images/nebula.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
            <div className="relative p-10 md:p-20 text-center">
              <FlaskConical size={22} className="mx-auto text-amber mb-6" strokeWidth={1.5} />
              <h2 className="font-display text-4xl md:text-6xl tracking-tight leading-tight max-w-3xl mx-auto">
                Somewhere out there is a world you'd <span className="italic text-teal">call home</span>.
              </h2>
              <p className="text-mist mt-6 max-w-md mx-auto font-light">Try to build it. The physics will tell you, kindly and precisely, how close you came.</p>
              <Link to="/observatory" className="group inline-flex items-center gap-2.5 mt-10 rounded-full bg-amber text-ink px-8 py-4 text-sm font-medium hover:bg-bone transition-colors duration-300">
                Start designing <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function Line({ k, v, tone }: { k: string; v: string; tone?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-2.5">
      <span className="text-faint font-light">{k}</span>
      <span className={`font-mono tabular text-right ${tone ? "text-teal" : "text-bone/85"}`}>{v}</span>
    </div>
  );
}
