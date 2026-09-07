import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Sun, Compass, Globe2, CloudRainWind, RotateCcw, Telescope, AlertTriangle, CheckCircle2, Info, XCircle, ArrowRight, FlaskConical } from "lucide-react";
import { useSystem } from "../engine/store";
import { derive, describe, verdict, fmt, fmtC, fmtGyr, fmtPct } from "../engine/astro";
import { PRESETS } from "../engine/presets";
import { Slider, GroupCard, Stat, ScoreDial, HZBar, Meter, DataRow, Kicker } from "../components/ui";

const NOTE_ICON = { good: CheckCircle2, warn: AlertTriangle, bad: XCircle, info: Info };
const NOTE_TONE = { good: "text-teal", warn: "text-amber", bad: "text-ember", info: "text-mist" };
const WATER_TONE: Record<string, string> = {
  ice: "border-ice/40 text-ice", teal: "border-teal/40 text-teal", amber: "border-amber/40 text-amber",
  red: "border-ember/40 text-ember", dim: "border-faint/40 text-mist",
};

export default function Observatory() {
  const { inp, set, load, reset, activePreset, setActivePreset } = useSystem();
  const d = useMemo(() => derive(inp), [inp]);
  const notes = useMemo(() => describe(inp, d), [inp, d]);
  const v = verdict(d.scores.H);

  return (
    <div className="pt-28 md:pt-36 pb-10">
      <div className="max-w-[1500px] mx-auto px-5 md:px-10">
        {/* ------------------------------------------------ header */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <Kicker n="01">The Observatory</Kicker>
            <h1 className="font-display text-4xl md:text-6xl tracking-tight">
              Design a <span className="italic text-amber">world</span>.
            </h1>
            <p className="text-mist text-[15px] mt-4 leading-relaxed font-light">
              Twelve physical levers, twenty-four computed quantities, one verdict. Move a slider and the engine
              re-derives the star, the orbit, the climate physics and the atmosphere in real time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Telescope size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
              <select
                value={activePreset}
                onChange={(e) => {
                  const pr = PRESETS.find((p) => p.id === e.target.value);
                  if (pr) { load(pr.inputs); setActivePreset(pr.id); }
                }}
                className="appearance-none bg-panel border border-line rounded-full pl-9 pr-8 py-2.5 text-[13px] text-bone/90 focus:outline-none focus:border-amber/50 cursor-pointer"
              >
                <option value="custom">Custom system</option>
                <optgroup label="Load a known world">
                  {PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </optgroup>
              </select>
            </div>
            <button onClick={reset} className="p-2.5 rounded-full border border-line text-mist hover:text-bone hover:border-bone/30 transition-all" title="Reset to Earth">
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-6 items-start">
          {/* ------------------------------------------------ controls */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <GroupCard icon={<Sun size={16} />} title="The Star" sub="Mass sets almost everything: light, colour, size, lifetime, flaring.">
              <Slider label="Stellar mass" value={inp.starMass} min={0.08} max={3} accent="#e3a94e"
                display={`${fmt(inp.starMass, 2)} M☉ · ${d.spectral}`} hint="Main sequence; luminosity auto-updates via M–L relation"
                onChange={(starMass) => set({ starMass })} />
              <Slider label="Luminosity" value={inp.luminosity} min={0.0001} max={63} scale="log" accent="#e3a94e"
                display={`${fmt(inp.luminosity, inp.luminosity < 0.01 ? 4 : 3)} L☉`} hint="Fine-tune directly — e.g. evolved or unusually faint stars"
                onChange={(luminosity) => set({ luminosity })} />
            </GroupCard>

            <GroupCard icon={<Compass size={16} />} title="The Orbit" sub="Where the planet sits determines how much starlight arrives — the master control of climate.">
              <Slider label="Semi-major axis" value={inp.semiMajor} min={0.01} max={5} scale="log" accent="#6fd3c7"
                display={`${fmt(inp.semiMajor, 3)} AU`} hint={`Year length: ${d.periodDays < 365 ? fmt(d.periodDays, 1) + " days" : fmt(d.period, 2) + " yr"}`}
                onChange={(semiMajor) => set({ semiMajor })} />
              <Slider label="Eccentricity" value={inp.eccentricity} min={0} max={0.6} accent="#6fd3c7"
                display={fmt(inp.eccentricity, 3)} hint="How stretched the orbit is; 0 = perfect circle"
                onChange={(eccentricity) => set({ eccentricity })} />
            </GroupCard>

            <GroupCard icon={<Globe2 size={16} />} title="The World" sub="Size and iron content fix mass, gravity and how hard the planet grips its air.">
              <Slider label="Radius" value={inp.planetRadius} min={0.3} max={3.5} accent="#7fb6d9"
                display={`${fmt(inp.planetRadius, 2)} R⊕`} hint={`Mass (Chen–Kipping 2017): ${fmt(d.Mp, 2)} M⊕ · ${(d.gravity / 9.81).toFixed(2)} g`}
                onChange={(planetRadius) => set({ planetRadius })} />
              <Slider label="Iron fraction" value={inp.ironFraction} min={0} max={0.65} accent="#7fb6d9"
                display={fmtPct(inp.ironFraction)} hint="0.32 = Earth · 0 = ocean/ice world · 0.65 = stripped core like Mercury"
                onChange={(ironFraction) => set({ ironFraction })} />
              <Slider label="Ocean coverage" value={inp.oceanCoverage} min={0} max={1} accent="#7fb6d9"
                display={fmtPct(inp.oceanCoverage)} hint="Fraction of surface under water — if temperature allows"
                onChange={(oceanCoverage) => set({ oceanCoverage })} />
              <Slider label="Magnetic moment" value={inp.magneticMoment} min={0} max={2} accent="#7fb6d9"
                display={`${fmt(inp.magneticMoment, 2)} ℳ⊕`} hint="Dynamo shielding against stellar wind stripping; Earth = 1"
                onChange={(magneticMoment) => set({ magneticMoment })} />
            </GroupCard>

            <GroupCard icon={<CloudRainWind size={16} />} title="The Atmosphere" sub="The blanket: how much starlight is reflected, trapped, and retained.">
              <Slider label="Bond albedo" value={inp.albedo} min={0.02} max={0.8} accent="#b99ce8"
                display={fmt(inp.albedo, 2)} hint="Fraction of starlight reflected to space; Earth 0.30, Venus 0.75"
                onChange={(albedo) => set({ albedo })} />
              <Slider label="Surface pressure" value={inp.pressure} min={0.0001} max={100} scale="log" accent="#b99ce8"
                display={`${inp.pressure < 0.01 ? inp.pressure.toExponential(1) : fmt(inp.pressure, 3)} atm`} hint="Mass of atmosphere per area; Mars 0.006, Venus 92"
                onChange={(pressure) => set({ pressure })} />
              <Slider label="Greenhouse index" value={inp.ghgIndex} min={0} max={5} accent="#b99ce8"
                display={`${fmt(inp.ghgIndex, 2)}×`} hint="1.0 = modern Earth gas mix · ~5 = pure CO₂ · sets optical depth τ"
                onChange={(ghgIndex) => set({ ghgIndex })} />
            </GroupCard>
          </div>

          {/* ------------------------------------------------ results */}
          <div className="space-y-4 min-w-0">
            {/* score + verdict */}
            <div className="rounded-2xl border border-line bg-panel/60 backdrop-blur-sm p-6 md:p-8 grid md:grid-cols-[240px_1fr] gap-8 items-center">
              <ScoreDial score={d.scores.H} label="Habitability index" sub={v.label} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h2 className="font-display text-3xl md:text-4xl tracking-tight">{v.label}</h2>
                  <span className="font-mono text-xs text-faint">ESI {d.esi.global.toFixed(3)}</span>
                </div>
                <p className="text-mist text-[14.5px] mt-3 leading-relaxed font-light max-w-xl">{v.text}</p>
                <div className={`mt-5 inline-flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[12.5px] leading-relaxed max-w-xl ${WATER_TONE[d.waterState.tone]}`}>
                  <FlaskConical size={14} className="mt-0.5 shrink-0" />
                  <span><span className="font-medium">{d.waterState.label}.</span> {d.waterState.detail}</span>
                </div>
              </div>
            </div>

            {/* HZ bar + meters */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-line bg-panel/60 p-6">
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="font-display text-lg">Habitable-zone position</h3>
                  <span className="font-mono text-xs text-faint">{fmt(d.S, 3)} S⊕</span>
                </div>
                <HZBar flux={d.S} hz={d.hz} L={d.L} />
                <p className="text-[12px] text-faint mt-4 leading-relaxed font-light">
                  {d.hzPosition}. Kopparapu et al. (2013) boundaries at T<sub>eff</sub> = {Math.round(d.Teff)} K —
                  inner edge {fmt(d.hz.runawayGH, 3)} AU, outer {fmt(d.hz.maximumGH, 3)} AU.
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-panel/60 p-6 space-y-5">
                <h3 className="font-display text-lg">Sub-scores</h3>
                <Meter label="Temperature fit" frac={d.scores.tempFit} tone="#6fd3c7" hint={`${fmtC(d.Tsurf)} vs 15°C reference`} />
                <Meter label="Water availability" frac={d.scores.waterScore} tone="#7fb6d9" hint={d.waterState.label} />
                <Meter label="Atmosphere quality" frac={d.scores.atmScore} tone="#b99ce8" hint={`τ = ${fmt(d.tau, 2)} · retention ${fmt(d.scores.retention, 2)}`} />
                <Meter label="Stellar stability" frac={d.scores.stability} tone="#e3a94e" hint={`Main-sequence lifetime ${fmtGyr(d.lifetimeGyr)}`} />
              </div>
            </div>

            {/* numbers */}
            <div className="rounded-2xl border border-line bg-panel/60 p-6">
              <h3 className="font-display text-lg mb-5">The ledger</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                <Stat label="Surface temp" value={fmtC(d.Tsurf)} tone={d.Tsurf > 373 ? "#c9582e" : d.Tsurf >= 273 && d.Tsurf < 320 ? "#6fd3c7" : "#7fb6d9"} />
                <Stat label="Equilibrium temp" value={fmtC(d.Teq)} />
                <Stat label="Greenhouse ΔT" value={d.deltaG.toFixed(1)} unit="K" />
                <Stat label="Greenhouse τ" value={fmt(d.tau, 3)} />
                <Stat label="Incident flux" value={fmt(d.S, 3)} unit="S⊕" tone={d.inConservative ? "#6fd3c7" : "#e3a94e"} />
                <Stat label="Orbital period" value={d.periodDays < 365 ? fmt(d.periodDays, 1) : fmt(d.period, 2)} unit={d.periodDays < 365 ? "days" : "yr"} />
                <Stat label="Surface gravity" value={(d.gravity / 9.81).toFixed(2)} unit="g" />
                <Stat label="Escape velocity" value={d.vesc.toFixed(1)} unit="km/s" />
                <Stat label="Bulk density" value={d.densityGcc.toFixed(2)} unit="g/cm³" />
                <Stat label="Water boiling pt" value={d.Tboil > 500 ? "—" : fmtC(d.Tboil)} />
                <Stat label="Tidal lock" value={d.locked ? "locked" : fmtGyr(d.lockGyr)} tone={d.locked ? "#e3a94e" : undefined} />
                <Stat label="Jeans λ (N₂)" value={d.lambdaN2.toFixed(0)} />
                <Stat label="Transit depth" value={d.transitPpm < 10 ? d.transitPpm.toFixed(2) : d.transitPpm.toFixed(0)} unit="ppm" />
                <Stat label="Transit odds" value={fmt(d.transitProbPct, 2)} unit="%" />
                <Stat label="Doppler RV K" value={d.rvK < 1 ? fmt(d.rvK, 3) : d.rvK.toFixed(2)} unit="m/s" />
                <Stat label="Star T_eff" value={`${Math.round(d.Teff)}`} unit="K" tone={d.color} />
              </div>
            </div>

            {/* interpretation */}
            <div className="rounded-2xl border border-line bg-panel/60 p-6 md:p-7">
              <h3 className="font-display text-lg mb-1">What the physics says</h3>
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-faint mb-5">auto-generated from model outputs</p>
              <ul className="space-y-4">
                {notes.map((n, i) => {
                  const Icon = NOTE_ICON[n.tone];
                  return (
                    <li key={i} className="flex gap-3.5 items-start">
                      <Icon size={15} className={`mt-[3px] shrink-0 ${NOTE_TONE[n.tone]}`} strokeWidth={1.8} />
                      <span className="text-[13.5px] text-bone/75 leading-relaxed font-light">{n.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Link to="/simulation" className="group rounded-2xl border border-teal/25 bg-teal/5 hover:bg-teal/10 transition-colors p-6 md:p-7 flex items-center justify-between gap-6">
              <div>
                <h3 className="font-display text-2xl tracking-tight">Watch it <span className="italic text-teal">orbit</span></h3>
                <p className="text-mist text-[13px] mt-2 font-light">Fly this exact configuration through its year — Keplerian motion, live flux, energy balance.</p>
              </div>
              <span className="grid place-items-center w-12 h-12 rounded-full border border-teal/40 text-teal group-hover:translate-x-1.5 transition-transform duration-500 shrink-0">
                <ArrowRight size={18} />
              </span>
            </Link>
          </div>
        </div>

        {/* ESI detail strip */}
        <div className="mt-6 rounded-2xl border border-line bg-panel/40 p-6 md:p-8">
          <div className="grid md:grid-cols-[220px_1fr] gap-8 items-start">
            <div>
              <h3 className="font-display text-lg">Earth Similarity Index</h3>
              <div className="font-mono text-3xl tabular text-teal mt-2">{d.esi.global.toFixed(3)}</div>
              <p className="text-[11px] text-faint mt-2 font-light">Schulze-Makuch et al. 2011 · weighted geometric mean, Earth = 1.000</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-10">
              <DataRow k="Radius term (w = 0.57)" v={d.esi.radius.toFixed(3)} />
              <DataRow k="Density term (w = 1.07)" v={d.esi.density.toFixed(3)} />
              <DataRow k="Escape-velocity term (w = 0.70)" v={d.esi.vesc.toFixed(3)} />
              <DataRow k="Surface-temperature term (w = 5.58)" v={d.esi.temp.toFixed(3)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
