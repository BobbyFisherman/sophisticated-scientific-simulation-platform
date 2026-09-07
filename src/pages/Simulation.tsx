import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Pause, RotateCcw, Lock, Unlock, PencilRuler, ChevronRight } from "lucide-react";
import { useSystem } from "../engine/store";
import { derive, verdict, fmtC, fmtGyr, fmt } from "../engine/astro";
import { PRESETS } from "../engine/presets";
import { OrbitSim, FluxChart, EnergyFlow, LiveState } from "../components/OrbitSim";
import { Kicker, Slider } from "../components/ui";

const SPEEDS = [0.5, 1, 2, 4, 8, 16];

export default function Simulation() {
  const { inp, set, load, activePreset, setActivePreset } = useSystem();
  const d = useMemo(() => derive(inp), [inp]);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(2);
  const [phase, setPhase] = useState(0);
  const [live, setLive] = useState<LiveState>({ r: inp.semiMajor, S: d.S, Teq: d.Teq, Ts: d.Tsurf, v: 29.8, phaseFrac: 0 });

  const onTick = useCallback((l: LiveState) => setLive(l), []);
  const v = verdict(d.scores.H);

  return (
    <div className="pt-28 md:pt-32 pb-6">
      <div className="max-w-[1500px] mx-auto px-5 md:px-10">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-5 mb-7">
          <div>
            <Kicker n="02" tone="teal">Live Demonstration</Kicker>
            <h1 className="font-display text-4xl md:text-5xl tracking-tight">
              {activePreset === "custom" ? "Your world" : (PRESETS.find((p) => p.id === activePreset)?.name ?? "Your world")}, in <span className="italic text-teal">motion</span>
            </h1>
            <p className="text-mist text-[14px] mt-3 font-light max-w-xl">
              A true Keplerian integration — the planet speeds up at periastron, slows at apastron (Kepler's second law),
              while flux, temperature and orbit velocity update from its instantaneous position.
            </p>
          </div>
          <select
            value={activePreset}
            onChange={(e) => {
              const pr = PRESETS.find((p) => p.id === e.target.value);
              if (pr) { load(pr.inputs); setActivePreset(pr.id); }
            }}
            className="appearance-none bg-panel border border-line rounded-full px-5 py-2.5 text-[13px] text-bone/90 focus:outline-none focus:border-teal/50 cursor-pointer"
          >
            <option value="custom">Custom system</option>
            {PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-stretch">
          {/* -------------------------------------- main viewport */}
          <div className="rounded-2xl border border-line bg-panel/50 overflow-hidden flex flex-col min-w-0">
            <div className="flex items-center justify-between px-5 py-3 border-b border-line-soft">
              <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-faint">Heliocentric view · not to scale vertically</span>
              <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em]">
                {d.locked
                  ? <span className="flex items-center gap-1.5 text-amber"><Lock size={10} /> tidally locked</span>
                  : <span className="flex items-center gap-1.5 text-faint"><Unlock size={10} /> free rotation</span>}
              </span>
            </div>
            <div className="relative h-[52vh] min-h-[380px]">
              <OrbitSim inp={inp} playing={playing} speed={speed} phase={phase} onPhase={setPhase} onTick={onTick} />
              {/* live badge */}
              <div className="absolute top-4 left-5 rounded-lg bg-ink/70 backdrop-blur border border-line-soft px-4 py-3">
                <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-faint">instantaneous surface temp</div>
                <div className="font-mono text-2xl tabular mt-1" style={{ color: live.Ts >= 273 && live.Ts < 320 ? "#6fd3c7" : live.Ts >= 320 ? "#c9582e" : "#7fb6d9" }}>
                  {fmtC(live.Ts)}
                </div>
                <div className="text-[10px] font-mono text-faint mt-0.5">mean Δ {fmtC(live.Ts)} vs model {fmtC(d.Tsurf)}</div>
              </div>
            </div>
            {/* transport controls */}
            <div className="border-t border-line-soft px-5 py-4 flex flex-wrap items-center gap-4 md:gap-6">
              <button
                onClick={() => setPlaying(!playing)}
                className="grid place-items-center w-11 h-11 rounded-full bg-amber text-ink hover:scale-105 transition-transform"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
              </button>
              <button onClick={() => { setPhase(0); }} className="p-2 text-mist hover:text-bone transition-colors" aria-label="Restart orbit">
                <RotateCcw size={15} />
              </button>
              <div className="flex-1 min-w-[180px]">
                <Slider label="Orbital phase" value={phase} min={0} max={1} accent="#6fd3c7"
                  display={`${Math.round(phase * 100)}% of year`}
                  onChange={(p) => { setPhase(p); setPlaying(false); }} />
              </div>
              <div className="flex items-center gap-1 rounded-full border border-line p-1">
                {SPEEDS.map((s) => (
                  <button key={s} onClick={() => setSpeed(s)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-colors ${speed === s ? "bg-bone/10 text-bone" : "text-faint hover:text-mist"}`}>
                    {s}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* -------------------------------------- side rail */}
          <div className="space-y-5 min-w-0">
            <div className="rounded-2xl border border-line bg-panel/60 p-5">
              <h3 className="font-display text-lg mb-1">Flux through the year</h3>
              <p className="text-[11px] text-faint mb-4 font-light">Incident sunlight vs orbital phase · grey band = conservative HZ</p>
              <FluxChart inp={inp} phaseFrac={live.phaseFrac} liveS={live.S} />
              <div className="grid grid-cols-3 gap-2 mt-4">
                <Readout k="apoastron-periastron flux swing" v={`×${fmt(d.Speri / Math.max(d.Sap, 1e-9), 2)}`} />
                <Readout k="now" v={`${fmt(live.S, 2)} S⊕`} accent />
                <Readout k="orbital speed" v={`${live.v.toFixed(1)} km/s`} />
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-panel/60 p-5">
              <h3 className="font-display text-lg mb-1">Energy balance</h3>
              <p className="text-[11px] text-faint mb-3 font-light">
                Starlight in · {(1 - inp.albedo).toFixed(2)} absorbed · infrared out, delayed by τ = {fmt(d.tau, 2)}
              </p>
              <div className="h-40"><EnergyFlow inp={inp} /></div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Readout k="greenhouse boost" v={`+${d.deltaG.toFixed(1)} K`} accent />
                <Readout k="verdict" v={v.label} small />
              </div>
            </div>

            {/* quick tune */}
            <div className="rounded-2xl border border-line bg-panel/60 p-5 space-y-5">
              <h3 className="font-display text-lg">Nudge the physics</h3>
              <Slider label="Semi-major axis" value={inp.semiMajor} min={0.01} max={5} scale="log" accent="#6fd3c7"
                display={`${fmt(inp.semiMajor, 3)} AU`} onChange={(semiMajor) => set({ semiMajor })} />
              <Slider label="Eccentricity" value={inp.eccentricity} min={0} max={0.6} accent="#6fd3c7"
                display={fmt(inp.eccentricity, 3)} onChange={(eccentricity) => set({ eccentricity })} />
              <Slider label="Greenhouse index" value={inp.ghgIndex} min={0} max={5} accent="#e3a94e"
                display={`${fmt(inp.ghgIndex, 2)}×`} onChange={(ghgIndex) => set({ ghgIndex })} />
              <Link to="/observatory" className="group flex items-center justify-between rounded-xl border border-line px-4 py-3 hover:border-amber/40 transition-colors">
                <span className="flex items-center gap-2.5 text-[13px] text-mist group-hover:text-bone transition-colors">
                  <PencilRuler size={14} /> Open the full Observatory
                </span>
                <ChevronRight size={14} className="text-faint group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* explanation strip */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            { t: "Kepler's equation, solved live", d: "Each frame inverts M = E − e·sin E by Newton–Raphson to find where the planet is in its ellipse — the same mechanics JPL uses in its ephemerides." },
            { t: "Zones stay put, the planet doesn't", d: "The teal annuli are the Kopparapu et al. (2013) habitable boundaries, fixed in distance. Watch eccentric worlds swing in and out of the zone." },
            { t: "Colour is climate", d: "The planet's palette derives from instantaneous surface temperature — deep-freeze ice through temperate blues to runaway embers." },
          ].map((c, i) => (
            <div key={i} className="rounded-2xl border border-line-soft bg-panel/30 p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-teal/80 mb-3">0{i + 1}</div>
              <h4 className="font-display text-lg leading-snug">{c.t}</h4>
              <p className="text-[13px] text-mist mt-2.5 leading-relaxed font-light">{c.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-panel/40 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[13px] text-mist font-light max-w-2xl">
            <span className="text-faint font-mono text-[10px] uppercase tracking-[0.2em] block mb-1">Tidal locking</span>
            {d.locked
              ? `This world locks in ${fmtGyr(d.lockGyr)} — one eternal day, one eternal night. The amber beacon on its surface keeps facing the star.`
              : `Locking takes ${fmtGyr(d.lockGyr)} here — the beacon on the surface spins freely, as on Earth.`}
          </p>
          <Link to="/science/habitable-zones" className="text-[12.5px] font-mono text-teal u-sweep whitespace-nowrap">Read the science →</Link>
        </div>
      </div>
    </div>
  );
}

function Readout({ k, v, accent, small }: { k: string; v: string; accent?: boolean; small?: boolean }) {
  return (
    <div className="rounded-lg bg-abyss/60 border border-line-soft px-3 py-2.5 min-w-0">
      <div className="text-[8.5px] font-mono uppercase tracking-[0.16em] text-faint truncate">{k}</div>
      <div className={`font-mono tabular mt-1 ${small ? "text-[11px] leading-snug" : "text-sm"} ${accent ? "text-amber" : "text-bone/90"}`}>{v}</div>
    </div>
  );
}
