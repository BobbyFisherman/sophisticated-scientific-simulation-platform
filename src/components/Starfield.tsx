import { useEffect, useRef } from "react";

/* Procedural starfield — parallax layers of drifting stars with subtle twinkle. */
export function Starfield({ density = 140, className = "" }: { density?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    interface Star { x: number; y: number; z: number; r: number; ph: number; hue: number }
    let stars: Star[] = [];

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = rect?.width ?? window.innerWidth;
      h = rect?.height ?? window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.25 + Math.random() * 0.75,
        r: 0.3 + Math.random() * 1.15,
        ph: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.12 ? 38 : Math.random() < 0.2 ? 178 : 220,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    let mx = 0, my = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    const t0 = performance.now();
    const draw = (t: number) => {
      const dt = (t - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = 0.55 + 0.45 * Math.sin(dt * (0.6 + s.z) + s.ph);
        const px = (s.x - mx * 18 * s.z + w) % w;
        const py = (s.y - my * 12 * s.z + h) % h;
        ctx.beginPath();
        ctx.arc(px, py, s.r * s.z, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, ${s.hue === 220 ? 12 : 45}%, ${s.hue === 220 ? 82 : 72}%, ${0.28 * tw * s.z})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); };
  }, [density]);

  return <canvas ref={ref} className={`absolute inset-0 pointer-events-none ${className}`} />;
}
