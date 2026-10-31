"use client";

import { useRef, useState } from "react";
import { stellar } from "@/lib/stellar";

const isCreate = (n: string) => /^create\b/i.test(n);
const total = stellar.mods.length;

function Name({ name, q }: { name: string; q: string }) {
  const i = q ? name.toLowerCase().indexOf(q) : -1;
  if (i < 0) return <>{name}</>;
  return <>{name.slice(0, i)}<mark>{name.slice(i, i + q.length)}</mark>{name.slice(i + q.length)}</>;
}

export function Mods() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "create">("all");
  const [open, setOpen] = useState(false);
  const section = useRef<HTMLElement>(null);

  const q = query.trim().toLowerCase();
  const shown = stellar.mods.filter(n => (filter === "all" || isCreate(n)) && (!q || n.toLowerCase().includes(q)));
  const groups: Record<string, string[]> = {};
  shown.forEach(n => (groups[/^[a-z]/i.test(n) ? n[0].toUpperCase() : "#"] ||= []).push(n));
  // The full list is collapsed until asked for; searching or filtering shows every match.
  const narrowed = !!q || filter !== "all";

  return (
    <section id="mods" className="rule" ref={section}>
      <div className="mods-head reveal">
        <div>
          <div className="label mono">Mod list</div>
          <h2 className="display">{total} mods.</h2>
        </div>
        <label className="find">
          <input
            type="search"
            placeholder="Search the mod list"
            autoComplete="off"
            spellCheck={false}
            aria-label="Search the mod list"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span className="mono">{shown.length} / {total}</span>
        </label>
      </div>
      <div className="filters mono reveal">
        <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All</button>
        <button type="button" aria-pressed={filter === "create"} onClick={() => setFilter("create")}>Create and addons</button>
      </div>
      <div className={`index-clip reveal${open || narrowed ? "" : " clamped"}`}>
        <div className="index">
          {Object.entries(groups).map(([letter, names]) => (
            <div className="letter" key={letter}>
              <h4>{letter}</h4>
              <ul>
                {names.map(n => (
                  <li key={n} className={isCreate(n) ? "create" : undefined}><Name name={n} q={q} /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {!narrowed && (
        <button
          className="more"
          type="button"
          aria-expanded={open}
          onClick={() => {
            if (open) section.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
            setOpen(!open);
          }}
        >
          {open ? "Show fewer" : `Show all ${total} mods →`}
        </button>
      )}
      {shown.length === 0 && <p className="empty">Nothing matches that. If you think it belongs in the pack, say so on Discord.</p>}
    </section>
  );
}
