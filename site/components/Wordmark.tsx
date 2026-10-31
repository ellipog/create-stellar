"use client";

import { useEffect, useRef } from "react";

/** The footer's outline STELLAR, sized to span the full content width. */
export function Wordmark() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const g = ref.current!, box = g.parentElement!;
    const fit = () => {
      g.style.fontSize = "200px";
      const pad = getComputedStyle(box);
      const avail = box.clientWidth - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight);
      g.style.fontSize = `${(200 * avail / g.scrollWidth).toFixed(1)}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, []);

  return <div className="giant" ref={ref} aria-hidden="true">STELLAR</div>;
}
