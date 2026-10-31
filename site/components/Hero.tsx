import { GearTrain } from "./GearTrain";
import { DiscordButton } from "./DiscordButton";
import { stellar } from "@/lib/stellar";
import { LINKS } from "@/lib/site";

export function Hero() {
  const specs: [string, string | number][] = [
    ["Version", stellar.version],
    ["Minecraft", stellar.minecraft],
    ["NeoForge", stellar.neoforge],
    ["Quests", stellar.quests],
    ["Mods", stellar.mods.length],
  ];
  return (
    <section className="hero" id="top">
      <GearTrain />
      <div className="hero-copy">
        <div className="label mono">A Create modpack for Minecraft {stellar.minecraft}</div>
        <h1 className="display">
          Automate everything. <span>Then leave the planet.</span>
        </h1>
        <p className="lede">
          Twelve mechanisms, each one a chain of recipes. The quest book won&apos;t let you move on until every link of
          the chain runs on its own, from the first cobblestone to the rocket fuel.
        </p>
        <div className="actions">
          <a className="btn primary" href={LINKS.curseforge}>
            Download on CurseForge <span className="arrow">→</span>
          </a>
          <DiscordButton />
        </div>
      </div>
      <dl className="specs">
        {specs.map(([k, v]) => (
          <div key={k}>
            <dt className="mono">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
