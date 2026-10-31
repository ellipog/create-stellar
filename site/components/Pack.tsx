import { stellar } from "@/lib/stellar";

const ROWS: [string, string][] = [
  ["Airships", "Create Aeronautics, with its own three-chapter questline: Lift, Thrust and Flight."],
  ["Metallurgy", "Crush, wash and melt ores into molten metal, then cast it back into ingots in a basin."],
  ["Big Create", "Big Cannons, Crafts & Additions, Diesel Generators, Enchantment Industry, Alloyed, Copycats+, Deco and Slice & Dice."],
  ["The world", "Terralith, Oh The Biomes We've Gone, Biomes O' Plenty, Alex's Caves, Alex's Mobs, When Dungeons Arise and YUNG's structures."],
  ["Food and storage", "Farmer's Delight and its addons, Refined Storage, Sophisticated Storage and Backpacks, and Storage Drawers."],
  [
    "The quest book",
    `${stellar.quests} quests in ${stellar.chapters} chapters. It marks anything you've already automated, so you never build the same line twice. From Mystical on, the recipe viewer is your guide.`,
  ],
  ["Shaders", "Sodium, Iris and Complementary Reimagined come installed. Switch them on in the video settings."],
];

export function Pack() {
  return (
    <section id="pack" className="rule">
      <div className="reveal">
        <div className="label mono">The rest of the pack</div>
        <h2 className="display">Built around Create. Not only Create.</h2>
      </div>
      <div className="rows">
        {ROWS.map(([title, text]) => (
          <article className="row reveal" key={title}>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
