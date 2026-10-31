"use client";

import { useEffect } from "react";

/** Fades each .reveal block in the first time it scrolls into view. */
export function Reveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
      { rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll<HTMLElement>(".reveal").forEach((n, i) => {
      n.style.transitionDelay = `${(i % 3) * 80}ms`;
      io.observe(n);
    });
    return () => io.disconnect();
  }, []);
  return null;
}
