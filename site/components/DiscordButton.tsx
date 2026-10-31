"use client";

import { useEffect, useState } from "react";
import { LINKS } from "@/lib/site";

/** The Discord link, with the server's live online count once the widget answers. */
export function DiscordButton() {
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    const ctl = new AbortController();
    fetch(LINKS.discordWidget, { signal: ctl.signal })
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { presence_count?: unknown }) => {
        if (typeof d.presence_count === "number") setOnline(d.presence_count);
      })
      .catch(() => {});
    return () => ctl.abort();
  }, []);

  return (
    <a className="btn" href={LINKS.discord}>
      Join the Discord
      {online !== null && (
        <small>
          <i className="live" />
          {online.toLocaleString("en")} online
        </small>
      )}
    </a>
  );
}
