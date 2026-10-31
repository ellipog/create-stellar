"use client";

import { useEffect, useRef, useState } from "react";
import { CHAPTER_EVENT, chapters, list } from "@/lib/stellar";

/*
 * The Ad Astra worlds and the chapters their stone and sand feed. Which
 * chapters a world feeds is read from the quest trees: any step named after
 * the world ("Moon Sand", "Mars Cobblestone") counts.
 */

interface Body {
  name: string; size: number; color: string;
  r?: number; speed?: number; phase?: number; far?: boolean;
}

const PLANETS: Body[] = [
  { name: "Mercury", r: 92, size: 8, color: "#a99f93", speed: 1.6, phase: .9 },
  { name: "Venus", r: 158, size: 14, color: "#e7b66c", speed: 1.15, phase: 3.7 },
  { name: "Earth", r: 236, size: 15, color: "#4f8fd6", speed: .85, phase: 1.95 },
  { name: "Mars", r: 322, size: 11, color: "#d05b33", speed: .62, phase: 5.2 },
  { name: "Glacio", r: 450, size: 12, color: "#a9dcf2", speed: .34, phase: 2.25, far: true },
];
const MOON: Body = { name: "Moon", size: 5.5, color: "#d6d1c6" };
const BODIES = [...PLANETS, MOON];
const CHIPS = ["Earth", "Moon", "Mercury", "Venus", "Mars", "Glacio"];
const CX = 500, CY = 310, TILT = .4, MOON_R = 34;

const feeding = (name: string) => chapters.filter(ch => ch.nodes.some(n => n.name.startsWith(`${name} `)));
const things = (name: string) => [...new Set(chapters.flatMap(ch => ch.nodes.filter(n => n.name.startsWith(`${name} `)).map(n => n.name)))];
const WORLDS = Object.fromEntries(BODIES.map(b => [b.name, { feeds: feeding(b.name), items: things(b.name) }]));

const NS = "http://www.w3.org/2000/svg";
const svg = (tag: string, attrs: Record<string, string | number> = {}, kids: (Node | string)[] = []) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  n.append(...kids);
  return n;
};

export function Space() {
  const [selected, setSelected] = useState("Moon");
  const orbits = useRef<SVGSVGElement>(null);
  const stars = useRef<HTMLCanvasElement>(null);
  const selectedRef = useRef(selected);
  const groups = useRef<Record<string, SVGGElement>>({});
  const redraw = useRef<() => void>(() => {});

  // The map is drawn imperatively: bodies move every frame and change layer
  // as they pass behind the sun, which React has no business re-rendering.
  useEffect(() => {
    const root = orbits.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.replaceChildren(svg("defs", {}, [
      svg("radialGradient", { id: "sun" }, [
        svg("stop", { offset: "0", "stop-color": "#fff1d2" }),
        svg("stop", { offset: ".2", "stop-color": "#f2b54b", "stop-opacity": ".75" }),
        svg("stop", { offset: ".42", "stop-color": "#e2a93f", "stop-opacity": ".3" }),
        svg("stop", { offset: ".7", "stop-color": "#c98a2c", "stop-opacity": ".08" }),
        svg("stop", { offset: "1", "stop-color": "#c98a2c", "stop-opacity": "0" }),
      ]),
      ...BODIES.map(p => svg("radialGradient", { id: `pl-${p.name}`, cx: "32%", cy: "30%", r: "80%" }, [
        svg("stop", { offset: "0", "stop-color": "#fff", "stop-opacity": ".7" }),
        svg("stop", { offset: ".3", "stop-color": p.color }),
        svg("stop", { offset: "1", "stop-color": "#04050a" }),
      ])),
    ]));
    PLANETS.forEach(p => root.append(svg("ellipse", { class: `orbit${p.far ? " far" : ""}`, cx: CX, cy: CY, rx: p.r!, ry: p.r! * TILT })));
    const back = svg("g"), front = svg("g"), route = svg("path", { class: "route" });
    const glow = svg("circle", { cx: CX, cy: CY, r: 150, fill: "url(#sun)" });
    root.append(back, svg("g", {}, [glow, svg("circle", { cx: CX, cy: CY, r: 24, fill: "#ffe6ad" })]), route, front);
    const moonOrbit = svg("ellipse", { class: "orbit", rx: MOON_R, ry: MOON_R * TILT });
    front.append(moonOrbit);
    const glowAnim = reduce ? null : glow.animate([{ opacity: .7 }, { opacity: 1 }], { duration: 3200, direction: "alternate", iterations: Infinity, easing: "ease-in-out" });

    const pos: Record<string, { x: number; y: number }> = {};
    const bodyScale: Record<string, SVGGElement> = {};
    BODIES.forEach(p => {
      // The body scales with depth; the label stays the same size.
      const body = svg("g", {}, [
        svg("circle", { r: p.size + 6, class: "ring" }),
        svg("circle", { r: p.size, fill: `url(#pl-${p.name})` }),
        svg("circle", { r: p.size + 14, fill: "transparent" }),
      ]) as SVGGElement;
      const label = p === MOON ? svg("text", { y: p.size + 20, "text-anchor": "middle" }, [p.name])
        : p.name === "Earth" ? svg("text", { x: -(p.size + 10), y: 5, "text-anchor": "end" }, [p.name])
        : svg("text", { x: p.size + 10, y: 5 }, [p.name]);
      const g = svg("g", { class: `planet${p.name === selectedRef.current ? " on" : ""}`, tabindex: 0, role: "button", "aria-label": p.name }, [body, label]) as SVGGElement;
      const pick = () => setSelected(p.name);
      g.addEventListener("mouseenter", pick);
      g.addEventListener("focus", pick);
      g.addEventListener("click", pick);
      groups.current[p.name] = g;
      bodyScale[p.name] = body;
      front.append(g);
    });

    // Bodies on the far side of an orbit pass behind the sun. A transfer arc
    // runs from Earth to whatever is selected.
    const place = (t: number) => {
      const s = t / 1000;
      PLANETS.forEach(p => {
        const a = p.phase! + s * p.speed! * .06;
        const x = CX + Math.cos(a) * p.r!, y = CY + Math.sin(a) * p.r! * TILT;
        pos[p.name] = { x, y };
        const g = groups.current[p.name];
        g.setAttribute("transform", `translate(${x.toFixed(1)},${y.toFixed(1)})`);
        bodyScale[p.name].setAttribute("transform", `scale(${(.84 + .16 * Math.sin(a)).toFixed(3)})`);
        const layer = Math.sin(a) < 0 ? back : front;
        if (g.parentNode !== layer) layer.append(g);
      });
      const e = pos.Earth, ma = s * .45;
      const m = { x: e.x + Math.cos(ma) * MOON_R, y: e.y + Math.sin(ma) * MOON_R * TILT };
      pos.Moon = m;
      moonOrbit.setAttribute("cx", e.x.toFixed(1));
      moonOrbit.setAttribute("cy", e.y.toFixed(1));
      groups.current.Moon.setAttribute("transform", `translate(${m.x.toFixed(1)},${m.y.toFixed(1)})`);
      const sel = pos[selectedRef.current];
      if (sel && selectedRef.current !== "Earth") {
        const dx = sel.x - e.x, dy = sel.y - e.y, len = Math.hypot(dx, dy);
        const lift = Math.min(160, len * .45);
        const mx = (e.x + sel.x) / 2 + dy / len * lift * .3, my = (e.y + sel.y) / 2 - lift;
        route.setAttribute("d", `M${e.x.toFixed(1)},${e.y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${sel.x.toFixed(1)},${sel.y.toFixed(1)}`);
        route.style.display = "";
      } else route.style.display = "none";
    };

    let run = false, raf = 0;
    const loop = (t: number) => { place(t); if (run) raf = requestAnimationFrame(loop); };
    place(0);
    // With reduced motion the map holds still, but the route still follows the selection.
    redraw.current = () => { if (reduce) place(0); };
    const io = new IntersectionObserver(([e]) => {
      const was = run;
      run = e.isIntersecting && !reduce;
      if (run && !was) raf = requestAnimationFrame(loop);
    });
    io.observe(root);

    return () => {
      run = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      glowAnim?.cancel();
      redraw.current = () => {};
      root.replaceChildren();
      groups.current = {};
    };
  }, []);

  useEffect(() => {
    selectedRef.current = selected;
    for (const [name, g] of Object.entries(groups.current)) g.classList.toggle("on", name === selected);
    redraw.current();
  }, [selected]);

  // A fixed scatter of stars, redrawn at the section's size.
  useEffect(() => {
    const c = stars.current!, x = c.getContext("2d")!;
    const ro = new ResizeObserver(() => {
      const r = c.getBoundingClientRect(), k = Math.min(devicePixelRatio || 1, 2);
      c.width = r.width * k; c.height = r.height * k;
      let seed = 1743150;
      const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
      for (let i = 0; i < r.width * r.height / 2400; i++) {
        x.fillStyle = `rgba(220,228,255,${(.12 + rnd() * .55).toFixed(2)})`;
        const s = (rnd() < .92 ? 1 : 1.7) * k;
        x.fillRect(rnd() * c.width, rnd() * c.height, s, s);
      }
    });
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  const w = WORLDS[selected];
  return (
    <section id="space" className="space">
      <canvas className="space-stars" ref={stars} aria-hidden="true" />
      <div className="space-copy reveal">
        <div className="label mono">Space</div>
        <h2 className="display">The later tiers come from other worlds.</h2>
        <p className="lede">
          Ad Astra rockets take the factory off the planet. Desh, ostrum and calorite each get their own mechanism, and
          the stone and sand of each world feed the chains that follow. Pick a planet.
        </p>
        <div className="worlds" role="group" aria-label="Planets">
          {CHIPS.map(name => (
            <button key={name} type="button" aria-pressed={name === selected} onClick={() => setSelected(name)}>{name}</button>
          ))}
        </div>
        <div className="world" aria-live="polite">
          <div className="mono">{w.feeds.length ? `Feeds chapter ${list(w.feeds.map(c => c.number))}` : "Where it starts"}</div>
          <h3>{selected}</h3>
          <p>
            {selected === "Earth"
              ? "Home. The early chapters run on what the overworld and the nether give you: cobblestone, wood, gravel, lava, soul sand."
              : `${list(w.items)} ${w.items.length > 1 ? "are steps" : "is a step"} in the ${list(w.feeds.map(c => c.title))} chain.`}
          </p>
          {w.feeds.map(c => (
            <button key={c.key} className="jump" type="button" onClick={() => dispatchEvent(new CustomEvent(CHAPTER_EVENT, { detail: c.key }))}>
              See the {c.title} chain →
            </button>
          ))}
        </div>
      </div>
      <svg className="orbits" ref={orbits} viewBox="0 0 1000 620" role="group" aria-label="Map of the planets and the chapters they feed" />
    </section>
  );
}
