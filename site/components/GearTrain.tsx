"use client";

import { useEffect, useRef } from "react";

/*
 * The hero's gear train. Each gear sits on the pitch circle of the gear it
 * meshes with, and its angle is derived from the drive gear's, so the teeth
 * always line up. Drag any gear to turn the train; let go and it coasts back
 * to idle. The scroll wheel nudges it too.
 */

// parent, teeth, direction from the parent (degrees), finish
const PLAN: [number, number, number, "brass" | "steel"][] = [
  [-1, 44, 0, "brass"],
  [0, 18, 196, "steel"],
  [1, 30, 236, "brass"],
  [0, 14, 290, "steel"],
  [3, 26, 330, "brass"],
  [0, 22, 104, "steel"],
  [5, 34, 158, "brass"],
  [2, 12, 172, "steel"],
  [4, 16, 24, "steel"],
  [6, 20, 96, "steel"],
];
const BASE = 0.2; // idle speed, rad/s

interface Gear {
  z: number; r: number; m: number; tone: "brass" | "steel"; parent: number; depth: number;
  x: number; y: number; theta: number; skip: boolean; path: Path2D;
}

function toothPath(z: number, r: number, m: number) {
  const p = new Path2D(), P = 2 * Math.PI / z, rt = r + m, rr = r - 1.25 * m;
  for (let i = 0; i < z; i++) {
    const a = i * P;
    const pts: [number, number][] = [[rr, a - .3 * P], [rt, a - .15 * P], [rt, a + .15 * P], [rr, a + .3 * P], [rr, a + .7 * P]];
    pts.forEach(([rad, t], k) => {
      const x = Math.cos(t) * rad, y = Math.sin(t) * rad;
      if (i === 0 && k === 0) p.moveTo(x, y); else p.lineTo(x, y);
    });
  }
  p.closePath();
  return p;
}

export function GearTrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rpmRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!, ctx = canvas.getContext("2d")!, rpmOut = rpmRef.current!;
    const hero = canvas.parentElement!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let gears: Gear[] = [], W = 0, H = 0, dpr = 1, angle = 0, omega = BASE, boost = 0, visible = true, last = 0, raf = 0;

    const layout = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      const wide = W > 900;
      const m = wide ? Math.max(6, Math.min(H / 70, W / 64)) : Math.max(5, Math.min(W / 46, 9));
      const ox = wide ? W * .74 : W * .64, oy = wide ? H * .47 : 250;
      gears = [];
      PLAN.forEach(([p, z, dir, tone]) => {
        const g: Gear = { z, r: m * z / 2, m, tone, parent: p, depth: 0, x: ox, y: oy, theta: 0, skip: false, path: toothPath(z, m * z / 2, m) };
        if (p >= 0) {
          const q = gears[p], t = dir * Math.PI / 180, d = q.r + g.r;
          Object.assign(g, { x: q.x + Math.cos(t) * d, y: q.y + Math.sin(t) * d, theta: t, depth: q.depth + 1 });
        }
        // A gear that would collide with one already placed is left out, along with its children.
        g.skip = (p >= 0 && gears[p].skip) || gears.some((o, i) => !o.skip && i !== p && Math.hypot(o.x - g.x, o.y - g.y) < o.r + g.r + 2.6 * m);
        gears.push(g);
      });
      draw();
    };

    const angles = () => {
      const a: number[] = [];
      gears.forEach((g, i) => {
        if (g.parent < 0) { a[i] = angle; return; }
        const q = gears[g.parent];
        a[i] = g.theta + Math.PI - (0.5 - (g.theta - a[g.parent]) * q.z / (2 * Math.PI)) * 2 * Math.PI / g.z;
      });
      return a;
    };

    const family = getComputedStyle(canvas).fontFamily;
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const a = angles(), rpm = omega * 60 / (2 * Math.PI);
      ctx.font = `500 10px ${family}`;
      gears.forEach((g, i) => {
        if (g.skip) return;
        const brass = g.tone === "brass", ink = brass ? "rgba(226,169,63,.78)" : "rgba(196,189,176,.42)";
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.setLineDash([2, 6]);
        ctx.strokeStyle = "rgba(236,228,214,.09)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 0, g.r, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.rotate(a[i]);
        ctx.fillStyle = brass ? "#1c1710" : "#141414";
        ctx.fill(g.path);
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.3;
        ctx.stroke(g.path);
        const rim = g.r - 2.6 * g.m, hub = Math.max(g.m * 1.6, g.r * .2);
        if (g.z >= 20) {
          const n = g.z >= 34 ? 6 : 5;
          for (let s = 0; s < n; s++) {
            const t0 = s * 2 * Math.PI / n + .3, t1 = (s + 1) * 2 * Math.PI / n - .3;
            ctx.beginPath();
            ctx.arc(0, 0, rim, t0, t1);
            ctx.arc(0, 0, hub + g.m * 1.4, t1 - .1, t0 + .1, true);
            ctx.closePath();
            ctx.fillStyle = "#0d0c0b"; ctx.fill(); ctx.stroke();
          }
        } else {
          ctx.beginPath(); ctx.arc(0, 0, rim, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(0, 0, hub, 0, Math.PI * 2);
        ctx.fillStyle = "#0d0c0b"; ctx.fill(); ctx.stroke();
        ctx.fillStyle = ink;
        ctx.fillRect(-hub * .32, -hub * .32, hub * .64, hub * .64);
        ctx.restore();
        // Drawing callout: tooth count and this gear's speed.
        const gr = Math.abs(rpm * gears[0].z / g.z);
        ctx.fillStyle = "rgba(236,228,214,.3)";
        ctx.fillText(`z${g.z}  ${gr.toFixed(1)} rpm`, g.x + g.r * .7 + 10, g.y - g.r * .7 - 8);
      });
      rpmOut.textContent = `${Math.abs(rpm).toFixed(1)} RPM`;
    }

    let drag: { i: number; prev: number; t: number; v: number } | null = null;
    const local = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const gearAt = (x: number, y: number) => gears.findIndex(g => !g.skip && Math.hypot(x - g.x, y - g.y) < g.r + g.m);
    const ratio = (i: number) => (gears[i].depth % 2 ? -1 : 1) * gears[i].z / gears[0].z;
    const down = (e: PointerEvent) => {
      const [x, y] = local(e), i = gearAt(x, y);
      if (i < 0) return;
      drag = { i, prev: Math.atan2(y - gears[i].y, x - gears[i].x), t: performance.now(), v: omega };
      canvas.setPointerCapture(e.pointerId);
      canvas.classList.add("dragging");
    };
    const move = (e: PointerEvent) => {
      const [x, y] = local(e);
      if (!drag) { canvas.style.cursor = gearAt(x, y) >= 0 ? "grab" : ""; return; }
      const g = gears[drag.i], now = Math.atan2(y - g.y, x - g.x), t = performance.now();
      let d = now - drag.prev;
      if (d > Math.PI) d -= 2 * Math.PI; else if (d < -Math.PI) d += 2 * Math.PI;
      const da = d * ratio(drag.i), dt = Math.max(8, t - drag.t) / 1000;
      angle += da;
      drag.v = drag.v * .5 + (da / dt) * .5;
      drag.prev = now; drag.t = t;
      omega = drag.v;
      if (reduce) draw();
    };
    const release = () => {
      if (!drag) return;
      boost = Math.max(-12, Math.min(12, drag.v - BASE));
      drag = null;
      canvas.classList.remove("dragging");
    };
    const wheel = (e: WheelEvent) => { if (visible) boost = Math.max(-12, Math.min(12, boost + Math.sign(e.deltaY) * .06)); };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
    addEventListener("wheel", wheel, { passive: true });

    const tick = (t: number) => {
      const dt = Math.min(.05, (t - (last || t)) / 1000);
      last = t;
      if (!drag) { boost *= Math.pow(.4, dt); omega = BASE + boost; angle += omega * dt; }
      draw();
      if (visible) raf = requestAnimationFrame(tick);
    };
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was && !reduce) { last = 0; raf = requestAnimationFrame(tick); }
    });
    io.observe(hero);
    if (!reduce) raf = requestAnimationFrame(tick);
    document.fonts?.ready.then(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      removeEventListener("wheel", wheel);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", release);
      canvas.removeEventListener("pointercancel", release);
      visible = false;
    };
  }, []);

  return (
    <>
      <canvas className="gears" ref={canvasRef} aria-label="A train of meshing gears. Drag one to turn them all." />
      <div className="readout mono" aria-hidden="true">
        Drive shaft<b ref={rpmRef}>0.0 RPM</b>Drag a gear
      </div>
    </>
  );
}
