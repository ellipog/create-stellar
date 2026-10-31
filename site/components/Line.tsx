"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CHAPTER_EVENT, chapters, list, stellar, type QuestNode, type TieredChapter } from "@/lib/stellar";

/*
 * Each mechanism chapter drawn the way the quest book lays it out: the real
 * quest positions and dependencies. Hovering a step lights everything it
 * needs and everything it feeds.
 */

const KIND_LABEL = { step: "Automate", input: "Brought in", final: "The mechanism", start: "Chapter start" };
const FALLBACK = {
  final: "Everything above, running on its own. Then this.",
  input: "Comes from an earlier chapter or a line you already run.",
  start: "The chapter opens once the chapter before it is done.",
  step: "No hint in the quest book for this one. The recipe viewer has the answer.",
};

const wrapLabel = (name: string, max = 13) => {
  const lines = [""];
  for (const w of name.split(" ")) {
    const cur = lines[lines.length - 1];
    if (cur && `${cur} ${w}`.length > max && lines.length < 2) lines.push(w);
    else lines[lines.length - 1] = cur ? `${cur} ${w}` : w;
  }
  return lines;
};

const pt = (t: number, r: number) => `${(Math.cos(t) * r).toFixed(1)},${(Math.sin(t) * r).toFixed(1)}`;
const ring = (n: number, r: number, rot = 0) => Array.from({ length: n }, (_, i) => pt(rot + i * 2 * Math.PI / n, r)).join(" ");
const cog = (r: number, z = 10) => {
  const pts: string[] = [], P = 2 * Math.PI / z;
  for (let i = 0; i < z; i++) {
    const a = i * P - Math.PI / 2;
    pts.push(pt(a - .3 * P, r * .8), pt(a - .15 * P, r), pt(a + .15 * P, r), pt(a + .3 * P, r * .8));
  }
  return pts.join(" ");
};

function layout(ch: TieredChapter) {
  const nodes = ch.nodes, byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y), pad = 64;
  const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad;
  const w = Math.max(...xs) - x0 + pad, h = Math.max(...ys) - y0 + pad + 26;
  const depth: Record<string, number> = {};
  const d = (id: string): number => depth[id] ?? (depth[id] = byId[id].deps.length ? 1 + Math.max(...byId[id].deps.map(d)) : 0);
  nodes.forEach(n => d(n.id));
  const feeds: Record<string, QuestNode[]> = Object.fromEntries(nodes.map(n => [n.id, nodes.filter(m => m.deps.includes(n.id))]));
  const up = (id: string): string[] => [id, ...byId[id].deps.flatMap(up)];
  const down = (id: string): string[] => [id, ...feeds[id].flatMap(m => down(m.id))];
  return { nodes, byId, x0, y0, w, h, depth, feeds, up, down };
}

const delay = (d: number) => ({ "--d": d }) as CSSProperties;

export function Line() {
  const [key, setKey] = useState(chapters[0].key);
  const [focus, setFocus] = useState<string | null>(null);
  const ch = chapters.find(c => c.key === key)!;
  const L = useMemo(() => layout(ch), [ch]);
  const graph = useRef<SVGSVGElement>(null);
  const section = useRef<HTMLElement>(null);

  const show = (k: string, scroll = false) => {
    setKey(k);
    setFocus(null);
    if (scroll) section.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  useEffect(() => {
    const on = (e: Event) => show((e as CustomEvent<string>).detail, true);
    addEventListener(CHAPTER_EVENT, on);
    return () => removeEventListener(CHAPTER_EVENT, on);
  }, []);

  // Labels keep one on-screen size however far the drawing is scaled.
  useLayoutEffect(() => {
    const svg = graph.current!;
    const fit = () => svg.style.setProperty("--u", (L.w / svg.getBoundingClientRect().width || 1).toFixed(3));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(svg.parentElement!);
    return () => ro.disconnect();
  }, [L]);

  const lit = useMemo(() => (focus ? new Set([...L.up(focus), ...L.down(focus)]) : null), [focus, L]);
  const fn = focus ? L.byId[focus] : null;
  const inputs = ch.nodes.filter(n => n.kind === "input").map(n => n.name);

  return (
    <section id="line" className="rule" ref={section}>
      <div className="line-head">
        <div className="reveal">
          <div className="label mono">The progression line</div>
          <h2 className="display">Every mechanism is a factory you have to build.</h2>
        </div>
        <p className="lede reveal">
          This is the quest book&apos;s own layout. Each step is something you automate, and nothing below it unlocks until
          the lines feeding it run without you. Hover a step to trace what it needs and what it feeds.
        </p>
      </div>

      <div className="ladder reveal">
        {stellar.ladder.map(t => (
          <div className="tier" key={t.tier}>
            <span className="mono">Tier {t.tier}</span>
            {[t.main, ...t.branches].map((c, i) => (
              <button key={c.key} type="button" className={`pick${i ? "" : " main"}`} aria-pressed={c.key === key} onClick={() => show(c.key)}>
                <span>{c.number}</span>
                {c.title.replace(/ Mechanism$/, "")}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="board">
        <div className="graph-wrap reveal">
          <svg
            ref={graph}
            className={`graph${focus ? " focus" : ""}`}
            viewBox={`${L.x0} ${L.y0} ${L.w} ${L.h}`}
            style={{ aspectRatio: `${L.w} / ${L.h}`, width: `min(100%, ${Math.round(L.w * 1.45)}px)`, minWidth: Math.round(L.w * .82) }}
            role="img"
            aria-label={`Quest tree for the ${ch.title}`}
            onMouseLeave={() => setFocus(null)}
          >
            {/* Keyed by chapter so a new chapter mounts fresh and draws itself in. */}
            <g key={ch.key}>
              {(["edge", "flow"] as const).map(kind => (
                <g key={kind}>
                  {L.nodes.flatMap(n => n.deps.map(id => {
                    const a = L.byId[id], on = lit?.has(id) && lit.has(n.id);
                    return (
                      <path
                        key={`${id}>${n.id}`}
                        d={`M${a.x},${a.y} L${n.x},${n.y}`}
                        className={`${kind}${on ? " on" : ""}`}
                        pathLength={kind === "edge" ? 1 : undefined}
                        style={delay(kind === "edge" ? L.depth[id] : L.depth[n.id])}
                      />
                    );
                  }))}
                </g>
              ))}
              <g>
                {L.nodes.map(n => {
                  const r = n.kind === "final" ? 30 : 22;
                  const shape =
                    n.kind === "final" ? <polygon className="shape spin" points={cog(r)} />
                    : n.kind === "input" ? <circle className="shape" r={17} />
                    : n.kind === "start" ? <polygon className="shape" points={ring(4, 18)} />
                    : <polygon className="shape" points={ring(6, r, Math.PI / 6)} />;
                  return (
                    <g
                      key={n.id}
                      className={`node ${n.kind}${lit?.has(n.id) ? " on" : ""}`}
                      transform={`translate(${n.x},${n.y})`}
                      tabIndex={0}
                      style={delay(L.depth[n.id])}
                      onMouseEnter={() => setFocus(n.id)}
                      onFocus={() => setFocus(n.id)}
                      onClick={() => setFocus(n.id)}
                    >
                      <g className="pop">
                        {shape}
                        {n.kind === "final" && <circle r={7} fill="#0d0c0b" />}
                      </g>
                      <text y={r + 8}>
                        {wrapLabel(n.name).map((line, i) => (
                          <tspan key={i} x={0} dy={i ? "1.2em" : 0}>{line}</tspan>
                        ))}
                      </text>
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>
        </div>

        <aside className="caption" aria-live="polite">
          {fn ? (
            <>
              <div className="mono">{ch.title} · {KIND_LABEL[fn.kind]}</div>
              <h3>{fn.kind === "start" ? "Ready?" : fn.name}</h3>
              <p>{fn.hint || FALLBACK[fn.kind]}</p>
              <dl>
                <dt className="mono">Needs</dt>
                <dd>{fn.deps.length ? list(fn.deps.map(id => L.byId[id].name)) : "Nothing"}</dd>
                <dt className="mono">Feeds</dt>
                <dd>{L.feeds[fn.id].length ? list(L.feeds[fn.id].map(m => m.name)) : "Nothing. End of the line."}</dd>
              </dl>
            </>
          ) : (
            <>
              <div className="mono">Chapter {ch.number} · Tier {ch.tier}</div>
              <h3>{ch.title}</h3>
              <p>{ch.quests} quests and {ch.automate} production lines to automate before the mechanism comes together.</p>
              <dl>
                <dt className="mono">Brings in</dt>
                <dd>{inputs.length ? list(inputs) : "Nothing. Everything in this chapter starts from scratch."}</dd>
              </dl>
              <p className="tip">Hover or tap a step for its recipe hint.</p>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
