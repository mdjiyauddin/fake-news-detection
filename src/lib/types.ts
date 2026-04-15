export type NewsCategory =
  | "india"
  | "world"
  | "technology"
  | "business"
  | "politics";

export type NewsArticle = {
  article_id: string;
  title: string;
  link: string;
  description: string | null;
  content: string | null;
  pubDate: string;
  image_url: string | null;
  source_id: string | null;
  category?: string[];
  country?: string[];
};

export type NewsApiResponse = {
  status: string;
  totalResults: number;
  results: NewsArticle[];
  nextPage?: string;
};

export type SportEvent = {
  id: string;
  league: string;
  home: string;
  away: string;
  homeScore: string;
  awayScore: string;
  status: string;
  sport: string;
  dateEvent?: string;
};
