"use client";

import { useEffect, useRef, useState } from "react";
import { Mark } from "./Mark";
import { LINKS } from "@/lib/site";

export function Nav() {
  const [solid, setSolid] = useState(false);
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    // The progress bar is written directly so scrolling never re-renders.
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setSolid(scrollY > 40);
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav${solid ? " solid" : ""}`}>
      <a className="wordmark" href="#top">
        <Mark />
        Create: Stellar
      </a>
      <nav aria-label="Sections">
        <a href="#line">The line</a>
        <a href="#space">Space</a>
        <a href="#pack">The pack</a>
        <a href="#mods">Mods</a>
        <a href="#play">Play</a>
      </nav>
      <a className="btn primary" href={LINKS.curseforge}>Download</a>
      <i className="progress" ref={bar} />
    </header>
  );
}
