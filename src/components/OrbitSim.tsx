import { useEffect, useRef, useState } from "react";
import { SystemInputs, derive, eccentricAnomaly, equilibriumTemp, surfaceTemp } from "../engine/astro";

/* =====================================================================================
   ORBIT SIM — numerically integrates the planet's Keplerian orbit each frame:
   mean anomaly → eccentric anomaly (Newton–Raphson) → true anomaly → position.
   The star sits at the focus; habitable-zone annuli are drawn at Kopparapu distances.
   ===================================================================================== */

interface SimProps {
  inp: SystemInputs;
  playing: boolean;
  speed: number;         // orbits per 10 seconds
  phase: number;         // 0..1 scrub (mean anomaly fraction)
  onPhase?: (p: number) => void;
  onTick?: (live: LiveState) => void;
}

export interface LiveState {
  r: number; S: number; Teq: number; Ts: number; v: number; phaseFrac: number;
}

const TAU = Math.PI * 2;

function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export function OrbitSim({ inp, playing, speed, phase, onPhase, onTick }: SimProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef({ M: phase * TAU, trail: [] as { x: number; y: number }[] , rot: 0 });
  const ctl = useRef({ playing, speed, phase });
  ctl.current = { playing, speed, phase };
  const tickRef = useRef(onTick);
  tickRef.current = onTick;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0, w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const d = derive(inp);
    const rand = seeded(7);
    const blobs = Array.from({ length: 7 }, () => ({ a: rand() * TAU, r: rand() * 0.55, s: 0.22 + rand() * 0.4 }));

    let last = performance.now();
    let acc = 0;
    let phaseAcc = 0;

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = state.current;
      if (ctl.current.playing) {
        // one orbit = 10 s / speed
        const dM = (TAU / 10) * ctl.current.speed * dt;
        st.M = (st.M + dM) % TAU;
        st.rot += dt * 0.5;
        phaseAcc += dt;
        if (phaseAcc > 0.08) { phaseAcc = 0; onPhase?.(st.M / TAU); }
      } else {
        // scrubbing
        const target = ctl.current.phase * TAU;
        if (Math.abs(target - st.M) > 1e-4) { st.M = target; st.trail = []; }
      }

      const e = inp.eccentricity;
      const a = inp.semiMajor;
      const E = eccentricAnomaly(st.M, e);
      const r = a * (1 - e * Math.cos(E));
      const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));

      // ---- live physics at this orbital position
      const S = d.L / (r * r);
      const Teq = equilibriumTemp(S, inp.albedo);
      const Ts = surfaceTemp(Teq, d.tau);
      const v = 29.78 * Math.sqrt(Math.max(inp.starMass, 0.01) * (2 / r - 1 / a)); // vis-viva

      acc += dt;
      if (acc > 0.12) { acc = 0; tickRef.current?.({ r, S, Teq, Ts, v, phaseFrac: (st.M / TAU + 1) % 1 }); }

      // ---- layout
      const cx = w * 0.5, cy = h * 0.5;
      const fitAU = Math.max(d.hz.earlyMars * 1.14, a * (1 + e) * 1.15, 0.05);
      const scale = (Math.min(w, h) * 0.44) / fitAU;
      const px = cx + r * Math.cos(nu) * scale;
      const py = cy + r * Math.sin(nu) * scale;

      ctx.clearRect(0, 0, w, h);

      // ---- distance rings (0.5 AU grid)
      ctx.strokeStyle = "rgba(236,231,219,0.045)";
      ctx.lineWidth = 1;
      const ringStep = fitAU > 2.4 ? 1 : 0.25;
      for (let ring = ringStep; ring < fitAU; ring += ringStep) {
        ctx.setLineDash([2, 7]);
        ctx.beginPath();
        ctx.arc(cx, cy, ring * scale, 0, TAU);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      // 1 AU label
      if (1 < fitAU) {
        ctx.fillStyle = "rgba(236,231,219,0.25)";
        ctx.font = "10px 'IBM Plex Mono', monospace";
        ctx.fillText("1 AU", cx + scale + 6, cy - 6);
      }

      // ---- habitable zone annuli (optimistic = recent Venus → early Mars; conservative inner band)
      const annulus = (r1: number, r2: number, fill: string) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r2 * scale, 0, TAU);
        ctx.arc(cx, cy, r1 * scale, 0, TAU, true);
        ctx.fillStyle = fill;
        ctx.fill();
      };
      annulus(d.hz.recentVenus, d.hz.earlyMars, "rgba(111,211,199,0.045)");
      annulus(d.hz.runawayGH, d.hz.maximumGH, "rgba(111,211,199,0.075)");
      // boundary dashes
      const bound = (rad: number, col: string, label: string, dy: number) => {
        if (rad * scale < 8) return;
        ctx.setLineDash([3, 6]);
        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.arc(cx, cy, rad * scale, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = col;
        ctx.font = "9.5px 'IBM Plex Mono', monospace";
        ctx.fillText(label, cx + 8, cy - rad * scale + dy);
      };
      bound(d.hz.runawayGH, "rgba(201,88,46,0.55)", `runaway greenhouse · ${d.hz.runawayGH < 1 ? d.hz.runawayGH.toFixed(3) : d.hz.runawayGH.toFixed(2)} AU`, 14);
      bound(d.hz.maximumGH, "rgba(111,211,199,0.55)", `maximum greenhouse · ${d.hz.maximumGH < 1 ? d.hz.maximumGH.toFixed(3) : d.hz.maximumGH.toFixed(2)} AU`, 14);
      bound(d.hz.earlyMars, "rgba(127,182,217,0.45)", `early-Mars edge · ${d.hz.earlyMars < 1 ? d.hz.earlyMars.toFixed(3) : d.hz.earlyMars.toFixed(2)} AU`, -6);

      // ---- orbit path (true ellipse, focus on star)
      ctx.save();
      ctx.translate(cx - a * e * scale, cy);
      ctx.scale(1, Math.sqrt(1 - e * e));
      ctx.setLineDash([1, 5]);
      ctx.strokeStyle = "rgba(236,231,219,0.22)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, a * scale, 0, TAU);
      ctx.stroke();
      ctx.restore();
      ctx.setLineDash([]);

      // ---- trail
      st.trail.push({ x: px, y: py });
      if (st.trail.length > 120) st.trail.shift();
      if (st.trail.length > 2) {
        for (let i = 1; i < st.trail.length; i++) {
          const t = i / st.trail.length;
          ctx.strokeStyle = `rgba(236,231,219,${0.05 + t * 0.22})`;
          ctx.lineWidth = 1 + t * 1.2;
          ctx.beginPath();
          ctx.moveTo(st.trail[i - 1].x, st.trail[i - 1].y);
          ctx.lineTo(st.trail[i].x, st.trail[i].y);
          ctx.stroke();
        }
      }

      // ---- star (blackbody colour + layered glow)
      const starRpx = Math.max(7, Math.min(30, d.starR * 12 * Math.pow(fitAU, -0.2)));
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, starRpx * 6);
      glow.addColorStop(0, d.color.replace("rgb", "rgba").replace(")", ",0.5)"));
      glow.addColorStop(0.35, d.color.replace("rgb", "rgba").replace(")", ",0.12)"));
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(cx - starRpx * 6, cy - starRpx * 6, starRpx * 12, starRpx * 12);
      const core = ctx.createRadialGradient(cx - starRpx * 0.25, cy - starRpx * 0.25, 0, cx, cy, starRpx);
      core.addColorStop(0, "#ffffff");
      core.addColorStop(0.55, d.color);
      core.addColorStop(1, d.color);
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, starRpx, 0, TAU);
      ctx.fill();

      // ---- planet
      const R = Math.max(5, Math.min(26, 7 * Math.pow(inp.planetRadius, 0.85) * Math.pow(fitAU, -0.12)));
      drawPlanet(ctx, px, py, R, Ts, inp.albedo, d.waterState.code, inp.oceanCoverage, st.rot, d.locked, Math.atan2(cy - py, cx - px), inp.pressure, blobs);

      // ---- flux vector arrow (sunlight direction)
      const away = Math.atan2(py - cy, px - cx);
      ctx.strokeStyle = "rgba(227,169,78,0.5)";
      ctx.lineWidth = 1;
      const ax = px + Math.cos(away) * (R + 8), ay = py + Math.sin(away) * (R + 8);
      const bx = px + Math.cos(away) * (R + 26), by = py + Math.sin(away) * (R + 26);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx - 6 * Math.cos(away - 0.4), by - 6 * Math.sin(away - 0.4));
      ctx.moveTo(bx, by);
      ctx.lineTo(bx - 6 * Math.cos(away + 0.4), by - 6 * Math.sin(away + 0.4));
      ctx.stroke();
      ctx.fillStyle = "rgba(227,169,78,0.8)";
      ctx.font = "9.5px 'IBM Plex Mono', monospace";
      ctx.fillText(`${(S > 2 ? S.toFixed(1) : S.toFixed(2))} S⊕`, bx + 6, by + 3);

      // ---- r + v readout near planet
      ctx.fillStyle = "rgba(236,231,219,0.55)";
      ctx.font = "10px 'IBM Plex Mono', monospace";
      const labelY = py + R + 18;
      ctx.fillText(`r = ${r.toFixed(3)} AU · v = ${v.toFixed(1)} km/s`, Math.min(px - 40, w - 170), Math.min(labelY, h - 10));

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [inp, onPhase]);

  return <canvas ref={ref} className="w-full h-full block" />;
}

/* ---------------------------------------------------------------- planet painter */
function drawPlanet(
  ctx: CanvasRenderingContext2D, x: number, y: number, R: number, Ts: number, albedo: number,
  wCode: string, ocean: number, rot: number, locked: boolean, sunAngle: number, pressure: number,
  blobs: { a: number; r: number; s: number }[],
) {
  // base colour from surface temperature
  const base = (() => {
    if (Ts > 400) return ["#e8b56a", "#b35f36", "#7a3a24"];
    if (Ts > 330) return ["#f0c98a", "#c98a58", "#8a5a3a"];
    if (Ts > 295) return ["#9ec98a", "#4e8a6a", "#3a6a52"];
    if (Ts > 273) return ["#6fb5c9", "#3a7a9e", "#2a5a7a"];
    if (Ts > 252) return ["#9ec9e0", "#5a8ab5", "#96b8d0"];
    return ["#dce8f0", "#b5ccdd", "#8aa8c0"];
  })();

  const g = ctx.createRadialGradient(x - R * 0.4, y - R * 0.4, R * 0.1, x, y, R * 1.05);
  g.addColorStop(0, base[0]);
  g.addColorStop(0.6, base[1]);
  g.addColorStop(1, base[2]);
  ctx.beginPath();
  ctx.arc(x, y, R, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, R * 0.98, 0, TAU);
  ctx.clip();

  // continents (temperate worlds with exposed land)
  if ((wCode === "temperate" || wCode === "warm") && ocean < 0.95) {
    ctx.fillStyle = "rgba(96,128,72,0.55)";
    for (const b of blobs) {
      const bx = x + Math.cos(b.a + rot * 0.4) * b.r * R;
      const by = y + Math.sin(b.a * 1.7) * b.r * R * 0.8;
      ctx.beginPath();
      ctx.ellipse(bx, by, b.s * R, b.s * R * 0.6, b.a, 0, TAU);
      ctx.fill();
    }
  }

  // ice caps below freezing
  if (Ts < 273.15 || wCode === "frozen" || wCode === "deep-freeze") {
    const frac = Math.min(0.95, Math.max(0.18, (273.15 - Ts) / 70 + 0.15));
    ctx.fillStyle = "rgba(240,246,250,0.85)";
    ctx.beginPath();
    ctx.ellipse(x, y - R, R * 1.05, R * frac, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y + R, R * 1.05, R * frac, 0, 0, TAU);
    ctx.fill();
    if (frac > 0.8) {
      ctx.fillStyle = "rgba(240,246,250,0.5)";
      ctx.fillRect(x - R, y - R * 0.4, R * 2, R * 0.8);
    }
  }

  // cloud deck (scales with pressure & albedo)
  const cloudA = Math.min(0.4, 0.08 + pressure * 0.02 + albedo * 0.25);
  ctx.fillStyle = `rgba(255,255,255,${cloudA})`;
  for (let i = 0; i < 3; i++) {
    const ang = rot * (locked ? 0.06 : 0.4) + i * 2.1;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang * 0.1 + i);
    ctx.beginPath();
    ctx.ellipse(0, -R * (0.25 + i * 0.28), R * 1.1, R * 0.14, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // terminator — night side away from the star
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(sunAngle + Math.PI);
  const night = ctx.createLinearGradient(0, 0, -R, 0);
  night.addColorStop(0, "rgba(4,6,10,0.0)");
  night.addColorStop(0.5, "rgba(4,6,10,0.35)");
  night.addColorStop(0.75, "rgba(4,6,10,0.88)");
  ctx.fillStyle = night;
  ctx.fillRect(-R, -R, R, R * 2);
  ctx.restore();

  // tidal-lock marker — surface beacon faces the star when locked
  const mAng = locked ? sunAngle : rot * 1.7;
  const mx = x + Math.cos(mAng) * R * 0.72;
  const my = y + Math.sin(mAng) * R * 0.72;
  ctx.beginPath();
  ctx.arc(mx, my, Math.max(1.4, R * 0.07), 0, TAU);
  ctx.fillStyle = locked ? "rgba(227,169,78,0.95)" : "rgba(236,231,219,0.75)";
  ctx.fill();

  ctx.restore();

  // rim
  ctx.beginPath();
  ctx.arc(x, y, R, 0, TAU);
  ctx.strokeStyle = "rgba(236,231,219,0.25)";
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

/* =====================================================================================
   FLUX CHART — rolling strip of incident flux vs orbital phase with Kopparapu limits.
   ===================================================================================== */
export function FluxChart({ inp, phaseFrac, liveS }: { inp: SystemInputs; phaseFrac: number; liveS: number }) {
  const d = derive(inp);
  const W = 560, H = 130, P = { l: 46, r: 12, t: 12, b: 24 };

  const sRV = d.L / (d.hz.recentVenus * d.hz.recentVenus);
  const sRG = d.L / (d.hz.runawayGH * d.hz.runawayGH);
  const sMG = d.L / (d.hz.maximumGH * d.hz.maximumGH);
  const sEM = d.L / (d.hz.earlyMars * d.hz.earlyMars);

  const allS = [sRV, sRG, sMG, sEM, d.Speri, d.Sap, liveS];
  const lo = Math.log10(Math.min(...allS) * 0.6);
  const hi = Math.log10(Math.max(...allS) * 1.5);
  const Y = (s: number) => P.t + (1 - (Math.log10(Math.max(s, 1e-4)) - lo) / (hi - lo)) * (H - P.t - P.b);
  const X = (f: number) => P.l + f * (W - P.l - P.r);

  // analytic orbit flux curve for one full period
  const e = inp.eccentricity, a = inp.semiMajor;
  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const M = (i / 240) * TAU;
    const E = eccentricAnomaly(M, e);
    const r = a * (1 - e * Math.cos(E));
    const S = d.L / (r * r);
    pts.push(`${i === 0 ? "M" : "L"}${X(i / 240).toFixed(1)},${Y(S).toFixed(1)}`);
  }

  const lim = (s: number, col: string, label: string) => (
    <g key={label}>
      <line x1={P.l} x2={W - P.r} y1={Y(s)} y2={Y(s)} stroke={col} strokeDasharray="3 5" strokeWidth="1" />
      <text x={W - P.r} y={Y(s) - 4} textAnchor="end" fill={col} fontSize="9" fontFamily="'IBM Plex Mono',monospace">{label}</text>
    </g>
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <rect x={P.l} y={Y(sRG)} width={W - P.l - P.r} height={Y(sMG) - Y(sRG)} fill="rgba(111,211,199,0.07)" />
      <text x={P.l + 6} y={(Y(sRG) + Y(sMG)) / 2 + 3} fill="rgba(111,211,199,0.7)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">conservative HZ</text>
      {lim(sRG, "rgba(201,88,46,0.6)", "runaway GH")}
      {lim(sMG, "rgba(111,211,199,0.6)", "max GH")}
      <path d={pts.join(" ")} fill="none" stroke="rgba(236,231,219,0.55)" strokeWidth="1.4" />
      {/* current position */}
      <circle cx={X(phaseFrac)} cy={Y(liveS)} r="4" fill="#e3a94e" stroke="#07090d" strokeWidth="1.5" />
      {/* axes */}
      <line x1={P.l} x2={P.l} y1={P.t} y2={H - P.b} stroke="rgba(236,231,219,0.15)" />
      <line x1={P.l} x2={W - P.r} y1={H - P.b} y2={H - P.b} stroke="rgba(236,231,219,0.15)" />
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <text key={f} x={X(f)} y={H - 8} textAnchor="middle" fill="rgba(236,231,219,0.35)" fontSize="8.5" fontFamily="'IBM Plex Mono',monospace">{f === 0 ? "periastron" : f === 1 ? "" : f.toFixed(2)}</text>
      ))}
      <text x={6} y={P.t + 8} fill="rgba(236,231,219,0.4)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">S / S⊕</text>
    </svg>
  );
}

/* =====================================================================================
   ENERGY FLOW — photons in from the star, absorbed fraction, IR photons out, with the
   greenhouse optical depth delaying a share of the outgoing flux.
   ===================================================================================== */
export function EnergyFlow({ inp }: { inp: SystemInputs }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0, w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    interface Dot { x: number; y: number; vx: number; vy: number; kind: "in" | "out" | "trapped"; born: number }
    const dots: Dot[] = [];
    const d = derive(inp);
    const inRate = Math.min(26, 2 + d.S * 8);            // photons/sec in
    const blockFrac = Math.min(0.85, d.tau / (d.tau + 1.4)); // share of IR delayed by greenhouse

    let last = performance.now(), accum = 0;
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const px = w * 0.72, py = h * 0.5;
      accum += dt * inRate;
      while (accum >= 1) {
        accum -= 1;
        dots.push({ x: -6, y: py + (Math.random() - 0.5) * h * 0.55, vx: 70 + Math.random() * 40, vy: 0, kind: "in", born: now });
      }
      ctx.clearRect(0, 0, w, h);

      // planet
      const R = Math.min(26, h * 0.18);
      const g = ctx.createRadialGradient(px - R * 0.3, py - R * 0.3, 0, px, py, R);
      g.addColorStop(0, d.Tsurf > 320 ? "#d89a58" : d.Tsurf > 273 ? "#4e8a9e" : "#7aa8c4");
      g.addColorStop(1, "#141a24");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, R, 0, TAU); ctx.fill();
      // atmosphere shell scaled by pressure
      const shell = Math.min(18, 2 + Math.log10(Math.max(inp.pressure, 1e-3)) * 5 + 10);
      ctx.strokeStyle = "rgba(127,182,217,0.4)";
      ctx.lineWidth = shell;
      ctx.beginPath(); ctx.arc(px, py, R + shell / 2 + 2, 0, TAU); ctx.stroke();

      for (let i = dots.length - 1; i >= 0; i--) {
        const dt2 = (now - dots[i].born) / 1000;
        if (dots[i].kind === "in") {
          dots[i].x += dots[i].vx * dt;
          if (dots[i].x > px - R - shell) {
            dots[i].x = px - R - shell;
            // absorbed or reflected
            if (Math.random() > inp.albedo) {
              dots[i].kind = "trapped";
              dots[i].vx = 0; dots[i].vy = -(18 + Math.random() * 20);
              dots[i].born = now;
            } else { dots[i].kind = "out"; dots[i].vx = -(dots[i].vx * 0.7); dots[i].born = now; dots[i].y -= 4; }
          }
        } else if (dots[i].kind === "trapped") {
          dots[i].y += dots[i].vy * dt * 2; dots[i].x += Math.sin(dt2 * 5) * 3 * dt * 10;
          const age = dt2;
          if (age > (Math.random() < blockFrac ? 2.8 : 0.9)) { dots[i].kind = "out"; dots[i].vx = -(30 + Math.random() * 30); dots[i].born = now; }
          if (dots[i].y < py - R - shell - 14) { dots[i].kind = "out"; dots[i].vx = -(30 + Math.random() * 30); dots[i].born = now; }
        } else {
          dots[i].x += dots[i].vx * dt * 2;
          if (dots[i].x < -8) { dots.splice(i, 1); continue; }
        }
        if (dt2 > 14) { dots.splice(i, 1); continue; }
        const a = dots[i].kind === "trapped" ? "rgba(227,120,68,0.85)" : dots[i].kind === "in" ? "rgba(234,200,120,0.8)" : "rgba(201,98,64,0.55)";
        ctx.fillStyle = a;
        ctx.beginPath();
        ctx.arc(dots[i].x, dots[i].y, dots[i].kind === "in" ? 1.8 : 1.4, 0, TAU);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [inp]);

  return <canvas ref={ref} className="w-full h-full block" />;
}

/* Hook to hold live state for the simulation page */
export function useLiveState(): [LiveState, (l: LiveState) => void] {
  const [live, setLive] = useState<LiveState>({ r: 1, S: 1, Teq: 255, Ts: 288, v: 29.8, phaseFrac: 0 });
  return [live, setLive];
}
