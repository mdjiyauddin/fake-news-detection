export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 px-4 py-12 pb-28 md:px-8 md:pb-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center text-sm text-[#EAEAEA]/45 md:flex-row md:text-left">
        <p>
          © {new Date().getFullYear()} AI Powered Fake News Detection · Immersive
          situational awareness.
        </p>
        <p className="max-w-md">
          Data: NewsData.io · CoinGecko · TheSportsDB. Heuristic modules are demos —
          verify critical claims independently. Use the floating chat for n8n later.
        </p>
      </div>
    </footer>
  );
}
