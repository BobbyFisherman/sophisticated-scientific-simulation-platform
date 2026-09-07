import { Reveal, PageHero, Kicker } from "../components/ui";
import { PRESETS } from "../engine/presets";
import { derive, fmtC } from "../engine/astro";
import { useSystem } from "../engine/store";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, BadgeInfo } from "lucide-react";

const TONE_HEX: Record<string, string> = { ice: "#7fb6d9", teal: "#6fd3c7", amber: "#e3a94e", red: "#c9582e", dim: "#5c6572" };

export default function Worlds() {
  const { load, setActivePreset } = useSystem();
  const nav = useNavigate();
  const flyTo = (id: string, to: string) => {
    const p = PRESETS.find((x) => x.id === id)!;
    load(p.inputs); setActivePreset(p.id); nav(to);
  };

  return (
    <div>
      <PageHero index="The Library" title={<>Fourteen worlds, <span className="italic text-teal">measured</span>.</>}>
        Real objects, real numbers. Every orbital element and bulk property here comes from the discovery
        paper or the NASA Exoplanet Archive; every field the telescopes can't yet see is honestly marked as
        modelled — those are the knobs you get to turn.
      </PageHero>

      <section className="max-w-7xl mx-auto px-6 md:px-10">
        <Reveal>
          <div className="rounded-2xl border border-line bg-panel/40 px-6 py-5 flex gap-3.5 items-start mb-10">
            <BadgeInfo size={16} className="text-amber shrink-0 mt-0.5" />
            <p className="text-[13px] text-mist leading-relaxed font-light">
              For most exoplanets, astronomers have measured the orbit and either mass <em>or</em> radius — not
              atmospheres, oceans, or magnetic fields. In each card, solid values are measured; values marked
              with an asterisk are the engine's working assumptions. Change them: that's the experiment.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {PRESETS.map((p, i) => {
            const d = derive(p.inputs);
            const tone = TONE_HEX[d.waterState.tone];
            return (
              <Reveal key={p.id} delay={(i % 3) * 70}>
                <div className="group rounded-3xl border border-line bg-panel/40 hover:bg-panel/70 hover:border-bone/15 transition-all duration-500 p-7 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-display text-[1.55rem] tracking-tight leading-tight">{p.name}</h3>
                      <div className="text-[10.5px] font-mono text-faint mt-1.5">{p.discovery.split(",")[0]}</div>
                    </div>
                    <span className="font-mono text-xl tabular shrink-0" style={{ color: tone }}>{d.scores.H}</span>
                  </div>
                  <p className="text-mist text-[13px] leading-relaxed font-light flex-1">{p.tagline}</p>

                  <div className="grid grid-cols-3 gap-2 mt-6 text-center">
                    <Cell k="star" v={`${p.inputs.starMass.toFixed(2)} M☉`} star />
                    <Cell k="orbit" v={`${p.inputs.semiMajor.toFixed(3)} AU`} />
                    <Cell k="flux" v={`${d.S.toFixed(2)} S⊕`} accent={d.inConservative} />
                    <Cell k="radius" v={`${p.inputs.planetRadius.toFixed(2)} R⊕${p.estimated.some((e) => e.startsWith("planetRadius")) ? "*" : ""}`} />
                    <Cell k="surface" v={fmtC(d.Tsurf)} tone={tone} />
                    <Cell k="esi" v={d.esi.global.toFixed(3)} />
                  </div>

                  {p.estimated.length > 0 && (
                    <p className="text-[10px] text-faint mt-4 font-light leading-relaxed">
                      * modelled: {p.estimated.slice(0, 4).join(", ")}{p.estimated.length > 4 ? ", …" : ""}
                    </p>
                  )}

                  <div className="flex gap-2 mt-5">
                    <button onClick={() => flyTo(p.id, "/observatory")}
                      className="flex-1 rounded-full border border-line px-4 py-2.5 text-[12px] text-mist hover:text-ink hover:bg-amber hover:border-amber transition-all duration-300">
                      Open in Observatory
                    </button>
                    <button onClick={() => flyTo(p.id, "/simulation")}
                      className="grid place-items-center w-10 rounded-full border border-line text-mist hover:text-teal hover:border-teal/50 transition-all" title="Simulate orbit">
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-14">
          <div className="rounded-2xl border border-line bg-panel/30 p-8 flex flex-wrap items-center justify-between gap-6">
            <div>
              <Kicker n="Data">Provenance</Kicker>
              <p className="text-[13px] text-mist max-w-xl font-light leading-relaxed">
                Sources are listed with discovery citations on the Data page — Gillon et al. for TRAPPIST-1,
                Jenkins et al. for Kepler-452 b, Anglada-Escudé et al. for Proxima b, and so on.
              </p>
            </div>
            <Link to="/data" className="text-[12.5px] font-mono text-teal u-sweep">Citations & constants →</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function Cell({ k, v, accent, star, tone }: { k: string; v: string; accent?: boolean; star?: boolean; tone?: string }) {
  return (
    <div className="rounded-lg bg-abyss/60 border border-line-soft px-2 py-2.5">
      <div className="text-[8.5px] font-mono uppercase tracking-[0.14em] text-faint">{k}</div>
      <div className="font-mono text-[12px] tabular mt-1 truncate" style={{ color: tone ?? (accent ? "#6fd3c7" : star ? "#e3a94e" : "rgba(236,231,219,0.85)") }}>{v}</div>
    </div>
  );
}
