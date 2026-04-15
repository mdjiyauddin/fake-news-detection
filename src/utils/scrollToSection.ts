/** Fixed header: nav pill + cyber ticker strip */
const OFFSET = 152;

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}
