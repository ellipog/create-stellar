import raw from "@/data/stellar.json";

/*
 * data/stellar.json is generated from the pack repo (versions, mod list and
 * each mechanism chapter's quest tree), so nothing on the page that describes
 * the pack is typed in by hand.
 */

export type NodeKind = "step" | "input" | "start" | "final";

export interface QuestNode {
  id: string;
  name: string;
  kind: NodeKind;
  hint: string;
  x: number;
  y: number;
  deps: string[];
}

export interface Chapter {
  key: string;
  title: string;
  number: string;
  quests: number;
  automate: number;
  nodes: QuestNode[];
}

export interface Tier {
  tier: number;
  main: Chapter;
  branches: Chapter[];
}

export interface Stellar {
  version: string;
  minecraft: string;
  neoforge: string;
  quests: number;
  chapters: number;
  ladder: Tier[];
  mods: string[];
}

export const stellar = raw as unknown as Stellar;

export type TieredChapter = Chapter & { tier: number };

export const chapters: TieredChapter[] = stellar.ladder.flatMap(t =>
  [t.main, ...t.branches].map(ch => ({ ...ch, tier: t.tier })),
);

/** "a", "a and b", "a, b and c". */
export const list = (xs: string[]) =>
  xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

/** Ask the progression section to show a chapter (the planet map uses it). */
export const CHAPTER_EVENT = "stellar:chapter";
