export interface SeoConfig {
  // Campaign basics
  campaignName: string;
  goal: string;
  industry: string;
  targetAudience: string;
  country: string;
  seedKeywords: string;

  // Content settings
  tone: string;
  contentTypes: string[];
  articleLength: string;
  publishingCadence: string;

  // SEO features
  competitorAnalysis: boolean;
  internalLinking: boolean;
  metaDescriptions: boolean;
  schemaMarkup: boolean;
  faqSections: boolean;
  featuredSnippets: boolean;

  // Publishing
  destination: string;
  outputFormat: string;

  // CTA
  ctaType: string;
  ctaText: string;
  ctaUrl: string;
}

export const EMPTY_SEO_CONFIG: SeoConfig = {
  campaignName: "",
  goal: "",
  industry: "",
  targetAudience: "",
  country: "",
  seedKeywords: "",
  tone: "",
  contentTypes: [],
  articleLength: "",
  publishingCadence: "",
  competitorAnalysis: false,
  internalLinking: false,
  metaDescriptions: false,
  schemaMarkup: false,
  faqSections: false,
  featuredSnippets: false,
  destination: "",
  outputFormat: "",
  ctaType: "",
  ctaText: "",
  ctaUrl: "",
};

export const GOAL_OPTIONS = [
  "Lead generation",
  "Brand awareness",
  "Product sign-ups",
  "Traffic growth",
  "Thought leadership",
];

export const TONE_OPTIONS = [
  "Professional",
  "Conversational",
  "Technical",
  "Friendly",
  "Authoritative",
];

export const CONTENT_TYPE_OPTIONS = [
  "Blog articles",
  "How-to guides",
  "Listicles",
  "Case studies",
  "Comparison articles",
  "News & updates",
];

export const ARTICLE_LENGTH_OPTIONS = [
  "Short (800 words)",
  "Medium (1,500 words)",
  "Long (2,500 words)",
  "Pillar (4,000+ words)",
];

export const CADENCE_OPTIONS = [
  "4 articles / month",
  "8 articles / month",
  "12 articles / month",
  "20 articles / month",
];

export const DESTINATION_OPTIONS = [
  "WordPress",
  "Webflow",
  "Notion",
  "Custom API",
  "Download only",
];

export const OUTPUT_FORMAT_OPTIONS = ["Markdown", "HTML", "Plain text"];

export const CTA_TYPE_OPTIONS = ["Book demo", "Free trial", "Contact us", "Custom"];
