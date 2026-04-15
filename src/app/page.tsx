import { ParticleBackground } from "@/components/effects/ParticleBackground";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { Navbar } from "@/components/layout/Navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroSection } from "@/components/hero/HeroSection";
import { NewsSection } from "@/components/news/NewsSection";
import { CryptoSection } from "@/components/crypto/CryptoSection";
import { SportsSection } from "@/components/sports/SportsSection";
import { FakeNewsTool } from "@/components/truth/FakeNewsTool";
import { ImageDetector } from "@/components/media/ImageDetector";
import { DemoChat } from "@/components/chat/DemoChat";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0A0A0A] text-[#EAEAEA]">
      <ParticleBackground />
      <CursorGlow />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <NewsSection />
        <CryptoSection />
        <SportsSection />
        <FakeNewsTool />
        <ImageDetector />
      </main>
      <DemoChat />
      <SiteFooter />
    </div>
  );
}
