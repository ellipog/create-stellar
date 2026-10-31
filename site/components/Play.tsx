import { stellar } from "@/lib/stellar";
import { LINKS } from "@/lib/site";

export function Play() {
  return (
    <section id="play" className="rule">
      <div className="reveal">
        <div className="label mono">Play</div>
        <h2 className="display">Start the first line.</h2>
      </div>
      <div className="how">
        <div className="reveal">
          <div className="n">01</div>
          <h3>CurseForge app</h3>
          <p>
            Search for Create: Stellar in the app, or open the <a href={LINKS.curseforge}>CurseForge page</a> and click
            Install. Java 21 comes with it.
          </p>
        </div>
        <div className="reveal">
          <div className="n">02</div>
          <h3>Other launchers</h3>
          <p>Download the modpack zip from the Files tab and import it. Prism Launcher reads CurseForge zips directly.</p>
        </div>
        <div className="reveal">
          <div className="n">03</div>
          <h3>Run a server</h3>
          <p>Every release has a server pack under Additional Files, with a README for setup. Players and server need the same pack version.</p>
        </div>
      </div>
      <div className="reqs mono reveal">
        <span>Minecraft <b>{stellar.minecraft}</b></span>
        <span>NeoForge <b>{stellar.neoforge}</b></span>
        <span>Java <b>21</b></span>
        <span>RAM <b>6 GB</b>, 8 with shaders</span>
      </div>
    </section>
  );
}
