import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Line } from "@/components/Line";
import { Space } from "@/components/Space";
import { Pack } from "@/components/Pack";
import { Mods } from "@/components/Mods";
import { Play } from "@/components/Play";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Line />
        <Space />
        <Pack />
        <Mods />
        <Play />
      </main>
      <Footer />
      <Reveal />
    </>
  );
}
