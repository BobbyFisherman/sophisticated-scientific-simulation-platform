import { ReactNode, useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValueEvent } from "framer-motion";

// ---------------------------------------------------------------- Reveal on scroll
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-in")),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- section kicker
export function Kicker({ n, children, tone = "amber" }: { n?: string; children: ReactNode; tone?: "amber" | "teal" }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <span className={`h-1.5 w-1.5 rounded-full pulse-dot ${tone === "amber" ? "bg-amber" : "bg-teal"}`} />
      <span className="font-mono text-[11px] tracking-[0.32em] uppercase text-mist">
        {n && <span className={tone === "amber" ? "text-amber" : "text-teal"}>{n} — </span>}
        {children}
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

// ---------------------------------------------------------------- page hero
export function PageHero({ index, title, children }: { index: string; title: ReactNode; children: ReactNode }) {
  return (
    <header className="relative pt-40 pb-16 md:pt-52 md:pb-20 px-6 md:px-10 max-w-7xl mx-auto">
      <Kicker n={index}>Worldforge</Kicker>
      <h1 className="font-display text-[13.5vw] leading-[0.95] sm:text-6xl md:text-7xl lg:text-[5.2rem] tracking-tight text-bone max-w-5xl">
        {title}
      </h1>
      <div className="mt-8 max-w-2xl text-mist text-[15px] md:text-base leading-relaxed font-light">{children}</div>
    </header>
  );
}

// ---------------------------------------------------------------- slider
export interface SliderSpec {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  scale?: "linear" | "log";
  accent?: string;
  display?: string;
  hint?: string;
  onChange: (v: number) => void;
}

export function Slider({ label, value, min, max, scale = "linear", accent = "#e3a94e", display, hint, onChange }: SliderSpec) {
  const toPos = (v: number) => (scale === "log" ? (Math.log10(v) - Math.log10(min)) / (Math.log10(max) - Math.log10(min)) : (v - min) / (max - min));
  const fromPos = (t: number) => (scale === "log" ? Math.pow(10, Math.log10(min) + t * (Math.log10(max) - Math.log10(min))) : min + t * (max - min));
  const pos = Math.max(0, Math.min(1, toPos(value)));
  return (
    <div className="group/sl">
      <div className="flex items-baseline justify-between mb-0.5">
        <label className="text-[13px] text-mist font-light tracking-wide">{label}</label>
        <span className="font-mono text-[13px] tabular text-bone/90" style={{ color: undefined }}>{display ?? value}</span>
      </div>
      <input
        type="range"
        className="wf-range"
        style={{ ["--fill" as string]: `${pos * 100}%`, ["--track-color" as string]: accent }}
        min={0}
        max={1000}
        step={1}
        value={Math.round(pos * 1000)}
        aria-label={label}
        onChange={(e) => onChange(fromPos(Number(e.target.value) / 1000))}
      />
      {hint && <div className="text-[11px] text-faint font-light -mt-0.5 opacity-0 group-hover/sl:opacity-100 transition-opacity duration-500">{hint}</div>}
    </div>
  );
}

// ---------------------------------------------------------------- slider group card    export function
export function GroupCard({ icon, title, sub, children }: { icon?: ReactNode; title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-panel/70 backdrop-blur-sm p-6 md:p-7 border border-line-soft" style={{ borderWidth: 1 }}>
      <div className="flex items-center gap-3 mb-1.5">
        <span className="text-amber/90">{icon}</span>
        <h3 className="font-display text-lg text-bone tracking-tight">{title}</h3>
      </div>
      {sub && <p className="text-[11.5px] text-faint mb-5 leading-relaxed">{sub}</p>}
      <div className="space-y-5">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------- stat block
export function Stat({ label, value, unit, tone }: { label: string; value: string; unit?: string; tone?: string }) {
  return (
    <div className="border border-line-soft rounded-xl px-4 py-3.5 bg-abyss/40">
      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-faint mb-1.5">{label}</div>
      <div className="font-mono text-lg md:text-xl tabular" style={{ color: tone ?? "var(--color-bone)" }}>
        {value}
        {unit && <span className="text-[11px] text-faint ml-1.5">{unit}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- animated score dial
export function ScoreDial({ score, label, sub }: { score: number; label: string; sub: string }) {
  const spring = useSpring(0, { stiffness: 55, damping: 16 });
  const [shown, setShown] = useState(0);
  useEffect(() => { spring.set(score); }, [score, spring]);
  useMotionValueEvent(spring, "change", (v) => setShown(v));
  const R = 84;
  const C = 2 * Math.PI * R;
  const frac = Math.max(0.001, Math.min(1, shown / 100));
  const tone = score >= 70 ? "#6fd3c7" : score >= 40 ? "#e3a94e" : "#c9582e";
  return (
    <div className="relative w-[220px] h-[220px] mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(236,231,219,0.07)" strokeWidth="1.5" />
        <circle cx="100" cy="100" r={R - 9} fill="none" stroke="rgba(236,231,219,0.04)" strokeWidth="16" />
        {[...Array(48)].map((_, i) => {
          const a = (i / 48) * Math.PI * 2;
          const big = i % 12 === 0;
          return (
            <line key={i}
              x1={100 + Math.cos(a) * (R + 7)} y1={100 + Math.sin(a) * (R + 7)}
              x2={100 + Math.cos(a) * (R + (big ? 13 : 10))} y2={100 + Math.sin(a) * (R + (big ? 13 : 10))}
              stroke="rgba(236,231,219,0.18)" strokeWidth={big ? 1 : 0.5} />
          );
        })}
        <motion.circle
          cx="100" cy="100" r={R} fill="none" stroke={tone} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - frac)}
          style={{ filter: `drop-shadow(0 0 6px ${tone}55)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="font-mono text-6xl tabular text-bone leading-none">{Math.round(shown)}</div>
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-faint mt-2">{label}</div>
        <div className="font-display italic text-[15px] mt-1.5" style={{ color: tone }}>{sub}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- HZ position bar
export function HZBar({ flux, hz, L }: { flux: number; hz: { recentVenus: number; runawayGH: number; maximumGH: number; earlyMars: number }; L: number }) {
  // convert distance bounds back to flux: S = L/d^2
  const sRV = L / (hz.recentVenus * hz.recentVenus);
  const sRG = L / (hz.runawayGH * hz.runawayGH);
  const sMG = L / (hz.maximumGH * hz.maximumGH);
  const sEM = L / (hz.earlyMars * hz.earlyMars);
  const lo = Math.log10(Math.min(sEM, flux) * 0.55);
  const hi = Math.log10(Math.max(sRV, flux) * 1.9);
  const pos = (s: number) => `${((Math.log10(s) - lo) / (hi - lo)) * 100}%`;
  return (
    <div>
      <div className="relative h-8 rounded-lg overflow-hidden bg-abyss border border-line-soft">
        <div className="absolute top-0 bottom-0 bg-ember/25" style={{ left: 0, width: pos(sRV) }} />
        <div className="absolute top-0 bottom-0 bg-teal/15" style={{ left: pos(sRV), width: `calc(${pos(sEM)} - ${pos(sRV)})` }} />
        <div className="absolute top-0 bottom-0 bg-teal/30" style={{ left: pos(sRG), width: `calc(${pos(sMG)} - ${pos(sRG)})` }} />
        <div className="absolute top-0 bottom-0 bg-ice/15" style={{ left: pos(sEM), width: `calc(100% - ${pos(sEM)})` }} />
        <div className="absolute top-0 bottom-0 w-[3px] bg-bone -translate-x-1/2 rounded-full" style={{ left: pos(flux), boxShadow: "0 0 10px rgba(236,231,219,0.7)" }} />
      </div>
      <div className="flex justify-between mt-2 text-[10px] font-mono text-faint uppercase tracking-[0.18em]">
        <span className="text-ember/90">hot · inner edge</span>
        <span className="text-teal/90">conservative HZ</span>
        <span className="text-ice/90">cold · outer edge</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- equation block
export function Equation({ children, caption, source }: { children: ReactNode; caption?: string; source?: string }) {
  return (
    <div className="border border-line-soft rounded-2xl bg-panel/50 px-6 md:px-10 py-8 text-center">
      <div className="eq text-xl md:text-3xl text-bone leading-relaxed">{children}</div>
      {caption && <div className="mt-4 text-[13px] text-mist font-light max-w-xl mx-auto leading-relaxed font-sans">{caption}</div>}
      {source && <div className="mt-2 text-[10.5px] font-mono text-faint uppercase tracking-[0.2em]">{source}</div>}
    </div>
  );
}

// ---------------------------------------------------------------- callout
export function Callout({ tone = "amber", title, children }: { tone?: "amber" | "teal" | "ice"; title: string; children: ReactNode }) {
  const c = tone === "amber" ? "border-amber/30 text-amber" : tone === "teal" ? "border-teal/30 text-teal" : "border-ice/30 text-ice";
  return (
    <div className={`border-l-2 pl-5 py-1 ${c.split(" ")[0]}`}>
      <div className={`text-[11px] font-mono uppercase tracking-[0.24em] mb-2 ${c.split(" ")[1]}`}>{title}</div>
      <div className="text-mist text-sm md:text-[15px] leading-relaxed font-light max-w-3xl">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------- bar meter
export function Meter({ label, frac, tone, hint }: { label: string; frac: number; tone: string; hint?: string }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-faint">{label}</span>
        <span className="font-mono text-xs tabular text-bone/80">{Math.round(frac * 100)}<span className="text-faint">/100</span></span>
      </div>
      <div className="h-[3px] bg-bone/8 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.max(1, frac * 100)}%`, background: tone }} />
      </div>
      {hint && <div className="text-[10.5px] text-faint mt-1.5 font-light">{hint}</div>}
    </div>
  );
}

// ---------------------------------------------------------------- footer-style data row
export function DataRow({ k, v, accent }: { k: string; v: ReactNode; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2.5 border-b border-line-soft last:border-0">
      <span className="text-[13px] text-mist font-light">{k}</span>
      <span className={`font-mono text-[13px] tabular ${accent ? "text-amber" : "text-bone/85"}`}>{v}</span>
    </div>
  );
}
