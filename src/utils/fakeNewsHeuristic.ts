const SENSATIONAL = [
  "shocking",
  "you won't believe",
  "doctors hate",
  "one weird trick",
  "miracle cure",
  "breaking:",
  "urgent:",
  "guaranteed",
  "100% free",
  "click here",
  "limited time",
  "act now",
  "conspiracy",
  "they don't want you to know",
  "secret exposed",
];

const HATE_OR_ABUSIVE = [
  "kill yourself",
  "go die",
  "worthless",
  "subhuman",
  "exterminate",
  "gas the",
  "rape",
  "lynch",
  "terrorist scum",
  "filthy",
  "vermin",
  "inferior race",
  "ethnic cleansing",
  "hate all",
  "deserve to die",
];

const MANIPULATION = [
  "pass this on",
  "share before",
  "facebook is deleting",
  "mainstream media won't",
  "wake up sheeple",
  "do your own research",
  "big pharma",
  "they're lying to you",
  "only i know",
  "you've been fooled",
  "open your eyes",
  "fake news says",
  "censored truth",
];

const TRUSTED_HOST_HINTS = [
  "reuters.com",
  "apnews.com",
  "bbc.",
  "theguardian.com",
  "nytimes.com",
  "washingtonpost.com",
  "economist.com",
  "npr.org",
  "republicworld.com",
  "ndtv.com",
  "thehindu.com",
  "indianexpress.com",
];

const SUSPICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz"];

function extractHostname(input: string): string | null {
  try {
    const u = input.startsWith("http") ? new URL(input) : new URL(`https://${input}`);
    return u.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export type FakeAnalysis = {
  fakeProbability: number;
  authenticityScore: number;
  hateSpeechPercent: number;
  manipulationPercent: number;
  label: "Real" | "Fake" | "Uncertain";
  explanation: string;
};

export function analyzeNewsText(text: string, url?: string | null): FakeAnalysis {
  const raw = text.trim();
  const t = raw.toLowerCase();

  if (raw.length < 24) {
    return {
      fakeProbability: 50,
      authenticityScore: 50,
      hateSpeechPercent: 0,
      manipulationPercent: 12,
      label: "Uncertain",
      explanation:
        "The sample is very short. Reliable automated checks need more context (full article body and source).",
    };
  }

  let fakeScore = 18;
  let hateScore = 4;
  let manipScore = 10;
  const reasons: string[] = [];

  const exclam = (raw.match(/!/g) || []).length;
  if (exclam > 3) {
    fakeScore += 12;
    manipScore += 8;
    reasons.push("Many exclamation marks often correlate with sensational framing.");
  }

  const capsWords = (raw.match(/\b[A-Z]{4,}\b/g) || []).length;
  if (capsWords > 4) {
    fakeScore += 10;
    manipScore += 6;
    reasons.push("Heavy use of ALL-CAPS words can indicate clickbait-style emphasis.");
  }

  for (const w of SENSATIONAL) {
    if (t.includes(w)) {
      fakeScore += 9;
      manipScore += 5;
      reasons.push(`Contains sensational phrasing (“${w}”).`);
      break;
    }
  }

  for (const w of HATE_OR_ABUSIVE) {
    if (t.includes(w)) {
      hateScore += 22;
      fakeScore += 6;
      reasons.push("Language patterns resemble abusive or dehumanizing rhetoric (heuristic).");
      break;
    }
  }

  for (const w of MANIPULATION) {
    if (t.includes(w)) {
      manipScore += 14;
      fakeScore += 5;
      reasons.push(`Contains persuasion / manipulation cues (“${w.slice(0, 28)}…”).`);
      break;
    }
  }

  const numClaims = (t.match(/\b\d{2,}%/g) || []).length;
  if (numClaims > 2) {
    fakeScore += 8;
    manipScore += 7;
    reasons.push("Multiple precise percentage claims without citations can be a red flag.");
  }

  if (url) {
    const host = extractHostname(url);
    if (host) {
      if (TRUSTED_HOST_HINTS.some((h) => host.includes(h))) {
        fakeScore -= 22;
        manipScore -= 6;
        reasons.push("Domain resembles established news organizations (heuristic boost).");
      }
      if (SUSPICIOUS_TLDS.some((d) => host.endsWith(d))) {
        fakeScore += 15;
        manipScore += 8;
        reasons.push("Uncommon TLDs are sometimes used by low-trust aggregators.");
      }
    }
  }

  fakeScore = Math.max(5, Math.min(96, Math.round(fakeScore)));
  hateScore = Math.max(0, Math.min(98, Math.round(hateScore)));
  manipScore = Math.max(5, Math.min(96, Math.round(manipScore)));

  const authenticityScore = Math.max(4, Math.min(96, 100 - fakeScore));

  const label: FakeAnalysis["label"] =
    fakeScore >= 62 ? "Fake" : fakeScore <= 38 ? "Real" : "Uncertain";

  const explanation =
    reasons.length > 0
      ? `${reasons.slice(0, 3).join(" ")} Heuristic preview only — verify with primary sources and professional moderation tools for hate speech.`
      : "No strong heuristic signals detected. Still verify claims with independent reputable outlets.";

  return {
    fakeProbability: fakeScore,
    authenticityScore,
    hateSpeechPercent: hateScore,
    manipulationPercent: manipScore,
    label,
    explanation,
  };
}
