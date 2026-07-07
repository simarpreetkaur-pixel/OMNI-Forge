import type { SeoConfig } from "@/types/seo";

function fmt(ts: number): string {
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function check(val: boolean): string {
  return val ? "[x]" : "[ ]";
}

function line(label: string, value: string | undefined): string | null {
  if (!value?.trim()) return null;
  return `- ${label}: ${value}`;
}

export function generateSkillFile(config: SeoConfig, updatedAt: number | null): string {
  const name = config.campaignName?.trim() || "Untitled Campaign";
  const lastUpdated = updatedAt ? fmt(updatedAt) : "Not yet saved";

  const sections: string[] = [];

  // Header
  sections.push(`# SEO Campaign: ${name}`);
  sections.push(`Last updated: ${lastUpdated}`);

  // Campaign basics
  const campaign = [
    line("Goal", config.goal),
    line("Industry", config.industry),
    line("Target audience", config.targetAudience),
    line("Country", config.country),
    line("Seed keywords", config.seedKeywords),
  ].filter(Boolean) as string[];

  if (campaign.length) {
    sections.push("\n## Campaign");
    sections.push(campaign.join("\n"));
  }

  // Content settings
  const contentTypes =
    config.contentTypes?.length ? config.contentTypes.join(", ") : undefined;

  const content = [
    line("Tone", config.tone),
    line("Content types", contentTypes),
    line("Article length", config.articleLength),
    line("Publishing cadence", config.publishingCadence),
  ].filter(Boolean) as string[];

  if (content.length) {
    sections.push("\n## Content Settings");
    sections.push(content.join("\n"));
  }

  // SEO features — always show this section once at least one campaign field is filled
  if (campaign.length || content.length) {
    sections.push("\n## SEO Features");
    sections.push(
      [
        `- ${check(config.competitorAnalysis)} Competitor analysis`,
        `- ${check(config.internalLinking)} Internal linking`,
        `- ${check(config.metaDescriptions)} Auto meta descriptions`,
        `- ${check(config.schemaMarkup)} Schema markup`,
        `- ${check(config.faqSections)} FAQ sections`,
        `- ${check(config.featuredSnippets)} Featured snippet optimisation`,
      ].join("\n")
    );
  }

  // Publishing
  const publishing = [
    line("Destination", config.destination),
    line("Output format", config.outputFormat),
  ].filter(Boolean) as string[];

  if (publishing.length) {
    sections.push("\n## Publishing");
    sections.push(publishing.join("\n"));
  }

  // CTA
  const cta = [
    line("Type", config.ctaType),
    line("Text", config.ctaText),
    line("URL", config.ctaUrl),
  ].filter(Boolean) as string[];

  if (cta.length) {
    sections.push("\n## CTA");
    sections.push(cta.join("\n"));
  }

  return sections.join("\n");
}

/** Returns true if the config has enough data to show a meaningful skill file. */
export function isSkillFileReady(config: SeoConfig): boolean {
  return !!(config.campaignName?.trim() || config.goal || config.industry);
}
