export interface DetectionResult {
  verdict: "REAL" | "MISLEADING" | "FAKE";
  confidenceScore: number; // 0-100, higher = more likely real
  breakdown: {
    credibility: number;
    sensationalism: number;
    emotional: number;
    consistency: number;
  };
  flags: string[];
  explanation: string;
}

const CLICKBAIT_PHRASES = [
  "you won't believe",
  "shocking",
  "breaking",
  "exposed",
  "they don't want you to know",
  "the truth about",
  "what really happened",
  "this will change everything",
  "doctors hate",
  "one weird trick",
];

const SUPERLATIVES = [
  "best ever",
  "worst ever",
  "biggest in history",
  "most incredible",
  "unbelievable",
  "never seen before",
  "of all time",
];

const FEAR_WORDS = [
  "danger",
  "threat",
  "attack",
  "crisis",
  "catastrophe",
  "collapse",
  "war",
  "emergency",
  "deadly",
  "terror",
];

const ANGER_WORDS = [
  "outrage",
  "furious",
  "disgusting",
  "shameful",
  "corrupt",
  "traitor",
  "scandal",
  "lies",
  "liar",
];

const CONSPIRACY_WORDS = [
  "secret",
  "hidden",
  "coverup",
  "deep state",
  "agenda",
  "they don't want",
  "censored",
  "wake up",
  "false flag",
];

const POLARIZATION_WORDS = [
  "enemy",
  "radical",
  "extremist",
  "patriot",
  "anti-national",
  "traitorous",
  "propaganda",
  "fake media",
];

const CREDIBLE_DOMAINS = new Set([
  "bbc.com",
  "reuters.com",
  "apnews.com",
  "npr.org",
  "theguardian.com",
  "nytimes.com",
  "washingtonpost.com",
  "wsj.com",
  "ft.com",
  "economist.com",
  "aljazeera.com",
  "ndtv.com",
  "thehindu.com",
  "indianexpress.com",
  "hindustantimes.com",
  "timesofindia.indiatimes.com",
]);

const LOW_TRUST_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz"];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function safeLower(s: string | undefined | null) {
  return (s || "").toLowerCase();
}

function words(s: string) {
  return s
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}'-]+/gu, ""))
    .filter(Boolean);
}

function countMatches(haystackLower: string, needles: string[]) {
  let count = 0;
  for (const n of needles) {
    if (haystackLower.includes(n)) count += 1;
  }
  return count;
}

function extractHostname(link?: string) {
  if (!link) return null;
  try {
    const u = link.startsWith("http") ? new URL(link) : new URL(`https://${link}`);
    return u.hostname.toLowerCase();
  } catch {
    return null;
  }
}

function baseDomain(hostname: string) {
  const h = hostname.replace(/^www\./, "");
  const parts = h.split(".").filter(Boolean);
  if (parts.length <= 2) return h;
  return parts.slice(-2).join(".");
}

function jaccardSimilarity(a: string, b: string) {
  const A = new Set(words(a.toLowerCase()));
  const B = new Set(words(b.toLowerCase()));
  if (A.size === 0 && B.size === 0) return 1;
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter += 1;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

function seededNoise(seedStr: string) {
  // Deterministic ±5 noise per article (stable per content/link).
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i += 1) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const r = (h >>> 0) / 2 ** 32; // 0..1
  return Math.round((r * 10 - 5) * 10) / 10; // -5..+5 with 0.1 steps
}

export function detectNews(article: {
  title: string;
  description?: string;
  content?: string;
  source_id?: string;
  creator?: string[];
  pubDate?: string;
  link?: string;
}): DetectionResult {
  const title = (article.title || "").trim();
  const description = (article.description || "").trim();
  const content = (article.content || "").trim();
  const combined = `${title}\n${description}\n${content}`.trim();
  const lowerCombined = combined.toLowerCase();
  const flags: string[] = [];

  // --- Sensationalism (higher = more sensational) ---
  let sensationalism = 10;
  const allCapsWords = (title.match(/\b[A-Z]{2,}\b/g) || []).length;
  if (allCapsWords >= 3) {
    sensationalism += clamp(allCapsWords * 7, 10, 35);
    flags.push("Heavy ALL-CAPS emphasis in headline");
  }

  const clickbaitHits = countMatches(safeLower(title), CLICKBAIT_PHRASES);
  if (clickbaitHits > 0) {
    sensationalism += clamp(18 + clickbaitHits * 6, 12, 40);
    flags.push("Clickbait-style phrasing detected");
  }

  const punctHits = (title.match(/!{2,}|\?{2,}/g) || []).length;
  if (punctHits > 0) {
    sensationalism += clamp(10 + punctHits * 8, 10, 30);
    flags.push("Excessive punctuation in headline");
  }

  const superlativeHits = countMatches(safeLower(title), SUPERLATIVES);
  if (superlativeHits > 0) {
    sensationalism += clamp(10 + superlativeHits * 7, 10, 25);
    flags.push("Superlative-heavy framing");
  }

  sensationalism = clamp(Math.round(sensationalism), 0, 100);

  // --- Credibility (higher = more credible) ---
  let credibility = 45;
  const host = extractHostname(article.link || undefined);
  if (host) {
    const bd = baseDomain(host);
    if (CREDIBLE_DOMAINS.has(host) || CREDIBLE_DOMAINS.has(bd)) {
      credibility += 22;
      flags.push("Source domain matches trusted outlets list");
    } else if (LOW_TRUST_TLDS.some((tld) => host.endsWith(tld))) {
      credibility -= 18;
      flags.push("Uncommon/low-trust domain TLD");
    }
  }

  if (article.creator && article.creator.filter(Boolean).length > 0) {
    credibility += 10;
    flags.push("Author/creator present");
  } else {
    credibility -= 6;
    flags.push("No author/creator listed");
  }

  if (article.pubDate && article.pubDate.trim().length >= 8) {
    credibility += 8;
    flags.push("Publication date present");
  } else {
    credibility -= 6;
    flags.push("No publication date provided");
  }

  const bodyLen = (description || content).length;
  if (bodyLen >= 160) {
    credibility += 10;
    flags.push("Has substantive description/content");
  } else if (bodyLen > 0 && bodyLen < 100) {
    credibility -= 12;
    flags.push("Very short description/content");
  } else if (bodyLen === 0) {
    credibility -= 16;
    flags.push("Missing description/content");
  }

  if (article.source_id && article.source_id.trim().length > 0) {
    credibility += 4;
  }

  credibility = clamp(Math.round(credibility), 0, 100);

  // --- Emotional manipulation (higher = more manipulative) ---
  let emotional = 12;
  const fearHits = countMatches(lowerCombined, FEAR_WORDS);
  const angerHits = countMatches(lowerCombined, ANGER_WORDS);
  const conspiracyHits = countMatches(lowerCombined, CONSPIRACY_WORDS);
  const polarizationHits = countMatches(lowerCombined, POLARIZATION_WORDS);

  if (fearHits > 0) {
    emotional += clamp(10 + fearHits * 7, 10, 35);
    flags.push("Fear-based language detected");
  }
  if (angerHits > 0) {
    emotional += clamp(8 + angerHits * 6, 8, 28);
    flags.push("Anger/outrage language detected");
  }
  if (conspiracyHits > 0) {
    emotional += clamp(14 + conspiracyHits * 7, 14, 40);
    flags.push("Conspiracy framing / hidden-truth cues");
  }
  if (polarizationHits > 0) {
    emotional += clamp(8 + polarizationHits * 5, 8, 25);
    flags.push("Polarizing/partisan framing");
  }

  emotional = clamp(Math.round(emotional), 0, 100);

  // --- Consistency (higher = more consistent) ---
  let consistency = 70;
  const align = description ? jaccardSimilarity(title, description) : null;
  if (align !== null) {
    if (align < 0.12) {
      consistency -= 28;
      flags.push("Headline and description seem weakly aligned");
    } else if (align < 0.22) {
      consistency -= 16;
      flags.push("Headline/description alignment is modest");
    } else if (align > 0.42) {
      consistency += 6;
    }
  } else {
    consistency -= 10;
  }

  if (title.trim().endsWith("?")) {
    consistency -= 10;
    flags.push("Headline ends with a question (engagement bait pattern)");
  }

  const vagueCues = ["someone", "many people", "experts say", "sources say", "they say", "it is believed"];
  const vagueHits = countMatches(lowerCombined, vagueCues);
  if (vagueHits > 0) {
    consistency -= clamp(6 + vagueHits * 3, 6, 18);
    flags.push("Vague attribution (“sources say/experts say”) without specifics");
  }

  const hasNumbers = /\b\d{2,}\b/.test(combined);
  if (!hasNumbers && words(combined).length > 18) {
    consistency -= 6;
    flags.push("Few concrete specifics (numbers/dates) in the text");
  }

  consistency = clamp(Math.round(consistency), 0, 100);

  // Convert sensationalism/emotional to "realness" contributions.
  const sensationalRealness = 100 - sensationalism;
  const emotionalRealness = 100 - emotional;

  let confidenceScore =
    credibility * 0.35 +
    sensationalRealness * 0.25 +
    emotionalRealness * 0.25 +
    consistency * 0.15;

  // Small deterministic noise so cards don't look cloned.
  const noise = seededNoise(`${title}::${description}::${article.link || ""}::${article.pubDate || ""}`);
  confidenceScore = clamp(Math.round(confidenceScore + noise), 0, 100);

  const verdict: DetectionResult["verdict"] =
    confidenceScore > 65 ? "REAL" : confidenceScore >= 40 ? "MISLEADING" : "FAKE";

  const topFlags = Array.from(new Set(flags)).slice(0, 7);
  const explanationParts: string[] = [];
  explanationParts.push(
    verdict === "REAL"
      ? "Signals lean toward credible reporting, with fewer manipulation markers."
      : verdict === "MISLEADING"
        ? "Mixed signals: some credible cues, but also attention-grabbing or vague framing."
        : "Multiple red flags suggest sensational/manipulative framing or weak sourcing cues."
  );

  if (host) explanationParts.push(`Source: ${host.replace(/^www\./, "")}.`);
  if (align !== null) explanationParts.push(`Title/description alignment: ${Math.round(align * 100)}%.`);

  return {
    verdict,
    confidenceScore,
    breakdown: {
      credibility,
      sensationalism,
      emotional,
      consistency,
    },
    flags: topFlags,
    explanation: explanationParts.join(" "),
  };
}

