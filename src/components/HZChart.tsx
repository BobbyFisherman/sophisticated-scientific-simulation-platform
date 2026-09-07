import { useMemo, useState } from "react";
import { hzBounds, massToLuminosity, massToTeff, derive, spectralClass } from "../engine/astro";
import { PRESETS } from "../engine/presets";

/* =====================================================================================
   HABITABLE ZONE CHART — log-log, x = stellar mass (M☉), y = orbital distance (AU).
   Bands computed by sampling the Kopparapu et al. (2013) polynomial relations.
   Real worlds overplotted, coloured by their modelled water state.
   ===================================================================================== */

const W = 640, H = 470, P = { l: 62, r: 20, t: 26, b: 48 };
const X_MIN = 0.08, X_MAX = 3.2, Y_MIN = 0.01, Y_MAX = 8;

const X = (m: number) => P.l + ((Math.log10(m) - Math.log10(X_MIN)) / (Math.log10(X_MAX) - Math.log10(X_MIN))) * (W - P.l - P.r);
const Y = (a: number) => P.t + (1 - (Math.log10(a) - Math.log10(Y_MIN)) / (Math.log10(Y_MAX) - Math.log10(Y_MIN))) * (H - P.t - P.b);

const TONE: Record<string, string> = { ice: "#7fb6d9", teal: "#6fd3c7", amber: "#e3a94e", red: "#c9582e", dim: "#5c6572" };

export function HZChart({ interactive = true }: { interactive?: boolean }) {
  const bands = useMemo(() => {
    const N = 90;
    const pts: { m: number; rv: number; rg: number; mg: number; em: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const m = Math.pow(10, Math.log10(X_MIN) + (i / N) * (Math.log10(X_MAX) - Math.log10(X_MIN)));
      const b = hzBounds(massToLuminosity(m), massToTeff(m));
      pts.push({ m, rv: b.recentVenus, rg: b.runawayGH, mg: b.maximumGH, em: b.earlyMars });
    }
    return pts;
  }, []);

  const path = (key: "rv" | "rg" | "mg" | "em") =>
    bands.map((b, i) => `${i === 0 ? "M" : "L"}${X(b.m).toFixed(1)},${Y(b[key]).toFixed(1)}`).join(" ");
  const bandPath = (a: "rv" | "rg", b: "mg" | "em") =>
    `${path(a)} ${bands.slice().reverse().map((p) => `L${X(p.m).toFixed(1)},${Y(p[b]).toFixed(1)}`).join(" ")} Z`;

  const worlds = useMemo(() => PRESETS.map((p) => ({
    ...p,
    d: derive(p.inputs),
  })), []);

  const [hover, setHover] = useState<string | null>(null);
  const hovered = worlds.find((w) => w.id === hover);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {/* grid */}
        {[0.1, 0.3, 0.5, 1, 2, 3].map((m) => (
          <g key={`x${m}`}>
            <line x1={X(m)} x2={X(m)} y1={P.t} y2={H - P.b} stroke="rgba(236,231,219,0.05)" />
            <text x={X(m)} y={H - P.b + 18} textAnchor="middle" fill="rgba(236,231,219,0.4)" fontSize="10" fontFamily="'IBM Plex Mono',monospace">{m}</text>
          </g>
        ))}
        {[0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5].map((a) => (
          <g key={`y${a}`}>
            <line x1={P.l} x2={W - P.r} y1={Y(a)} y2={Y(a)} stroke="rgba(236,231,219,0.05)" />
            <text x={P.l - 8} y={Y(a) + 3} textAnchor="end" fill="rgba(236,231,219,0.4)" fontSize="10" fontFamily="'IBM Plex Mono',monospace">{a}</text>
          </g>
        ))}

        {/* star system reference lines */}
        <text x={X(0.387 / 0.387) - 1} y={0} />
        <line x1={P.l} x2={W - P.r} y1={Y(1)} y2={Y(1)} stroke="rgba(236,231,219,0.14)" strokeDasharray="1 4" />
        <text x={W - P.r - 4} y={Y(1) - 6} textAnchor="end" fill="rgba(236,231,219,0.4)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">Earth's distance</text>

        {/* optimistic + conservative bands */}
        <path d={bandPath("rv", "em")} fill="rgba(111,211,199,0.05)" />
        <path d={bandPath("rg", "mg")} fill="rgba(111,211,199,0.13)" />

        {/* boundary curves */}
        <path d={path("rv")} fill="none" stroke="rgba(201,88,46,0.35)" strokeWidth="1" />
        <path d={path("rg")} fill="none" stroke="rgba(201,88,46,0.75)" strokeWidth="1.3" />
        <path d={path("mg")} fill="none" stroke="rgba(111,211,199,0.75)" strokeWidth="1.3" />
        <path d={path("em")} fill="none" stroke="rgba(111,211,199,0.35)" strokeWidth="1" />

        {/* labels on curves */}
        <text x={X(1.35)} y={Y(0.55)} fill="rgba(201,88,46,0.95)" fontSize="10" fontFamily="'IBM Plex Mono',monospace" transform={`rotate(-8 ${X(1.35)} ${Y(0.55)})`}>runaway greenhouse (inner)</text>
        <text x={X(1.35)} y={Y(1.95)} fill="rgba(111,211,199,0.95)" fontSize="10" fontFamily="'IBM Plex Mono',monospace" transform={`rotate(-8 ${X(1.35)} ${Y(1.95)})`}>maximum greenhouse (outer)</text>
        <text x={X(0.28)} y={Y(0.024)} fill="rgba(201,88,46,0.5)" fontSize="9" fontFamily="'IBM Plex Mono',monospace" transform={`rotate(-10 ${X(0.28)} ${Y(0.024)})`}>recent Venus (optimistic)</text>
        <text x={X(0.24)} y={Y(0.14)} fill="rgba(111,211,199,0.55)" fontSize="9" fontFamily="'IBM Plex Mono',monospace" transform={`rotate(-10 ${X(0.24)} ${Y(0.14)})`}>early Mars (optimistic)</text>

        {/* worlds */}
        {worlds.map((wd) => {
          const cx = X(wd.inputs.starMass), cy = Y(wd.inputs.semiMajor);
          const col = TONE[wd.d.waterState.tone];
          const isH = hover === wd.id;
          return (
            <g key={wd.id}
              onMouseEnter={() => interactive && setHover(wd.id)}
              onMouseLeave={() => interactive && setHover(null)}
              style={{ cursor: interactive ? "pointer" : "default" }}>
              {isH && <circle cx={cx} cy={cy} r="14" fill="none" stroke={col} strokeOpacity="0.35" />}
              <circle cx={cx} cy={cy} r={isH ? 6 : 4.4} fill={col} fillOpacity={isH ? 1 : 0.85} stroke="#07090d" strokeWidth="1.2" />
              <text x={cx + 9} y={cy + 3.5} fill={isH ? col : "rgba(236,231,219,0.55)"} fontSize={isH ? 10.5 : 9.5}
                fontFamily="Inter, sans-serif" fontWeight={isH ? 500 : 400}>{wd.name}</text>
            </g>
          );
        })}
      </svg>

      {/* hover card */}
      {hovered && (
        <div className="absolute top-3 right-3 w-[240px] rounded-xl border border-line bg-ink/92 backdrop-blur p-4 pointer-events-none">
          <div className="font-display text-base">{hovered.name}</div>
          <div className="text-[10px] font-mono text-faint mt-0.5">{spectralClass(massToTeff(hovered.inputs.starMass))} · {hovered.inputs.starMass.toFixed(2)} M☉ · {hovered.inputs.semiMajor.toFixed(3)} AU</div>
          <div className="mt-3 space-y-1.5 text-[11px] font-mono text-mist">
            <div className="flex justify-between"><span>Flux</span><span className="text-bone">{hovered.d.S.toFixed(3)} S⊕</span></div>
            <div className="flex justify-between"><span>Surface T</span><span className="text-bone">{(hovered.d.Tsurf - 273.15).toFixed(0)}°C</span></div>
            <div className="flex justify-between"><span>H index</span><span style={{ color: TONE[hovered.d.waterState.tone] }}>{hovered.d.scores.H}/100</span></div>
            <div className="flex justify-between"><span>ESI</span><span className="text-bone">{hovered.d.esi.global.toFixed(3)}</span></div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 px-1 text-[10.5px] font-mono text-faint">
        <span className="flex items-center gap-2"><span className="w-3 h-[3px] bg-ember rounded" />inner boundary</span>
        <span className="flex items-center gap-2"><span className="w-3 h-[3px] bg-teal rounded" />outer boundary</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-teal/15 rounded-sm border border-teal/30" />conservative zone</span>
        <span className="ml-auto">dots = real worlds, coloured by modelled water state</span>
      </div>
    </div>
  );
}
