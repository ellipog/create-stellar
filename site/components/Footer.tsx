import { Wordmark } from "./Wordmark";
import { LINKS } from "@/lib/site";

export function Footer() {
  return (
    <footer>
      <div className="foot-top">
        <h2 className="display">The cobblestone isn&apos;t going to automate itself.</h2>
        <div className="foot-links">
          <a href={LINKS.curseforge}>CurseForge</a>
          <a href={LINKS.discord}>Discord</a>
          <a href={LINKS.github}>GitHub</a>
          <a href={LINKS.issues}>Report a bug</a>
        </div>
      </div>
      <Wordmark />
      <div className="legal">
        <span>Made by ellipog.</span>
        <span>Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.</span>
      </div>
    </footer>
  );
}
