import type { SeoConfig } from "@/types/seo";

export interface AiParseResult {
  updates: Partial<SeoConfig>;
  fieldsUpdated: (keyof SeoConfig)[];
  response: string;
}

const QUESTION_STARTERS =
  /^(what|should|how|can|is|are|which|when|why|recommend|suggest|tell|help|give me|generate a better|best|do i need|will|does)/i;

function isQuestion(msg: string): boolean {
  return msg.includes("?") || QUESTION_STARTERS.test(msg.trim());
}

function bold(text: string) {
  return `**${text}**`;
}

function handleQuestion(lower: string, config: SeoConfig): AiParseResult {
  if (
    lower.includes("tone") &&
    (lower.includes("b2b") ||
      lower.includes("saas") ||
      lower.includes("business") ||
      lower.includes("enterprise"))
  ) {
    return {
      updates: {},
      fieldsUpdated: [],
      response: `For B2B SaaS, ${bold("Professional")} or ${bold("Authoritative")} tone performs best with decision-makers. If you're targeting technical buyers like developers or CTOs, ${bold("Technical")} works well. Avoid casual or friendly tones for enterprise audiences — they can reduce perceived credibility.`,
    };
  }

  if (lower.includes("tone")) {
    return {
      updates: {},
      fieldsUpdated: [],
      response: `Tone depends on your audience:\n• ${bold("Professional")} — B2B, enterprise, finance, insurance\n• ${bold("Conversational")} — SMBs, consumer apps, early-stage SaaS\n• ${bold("Technical")} — Developer tools, APIs, DevOps\n• ${bold("Authoritative")} — Research, healthcare, legal\n• ${bold("Friendly")} — Startups, lifestyle brands\n\nWhat industry are you targeting?`,
    };
  }

  if (
    lower.includes("competitor analysis") ||
    (lower.includes("competitor") &&
      (lower.includes("should") || lower.includes("enable") || lower.includes("need")))
  ) {
    return {
      updates: {},
      fieldsUpdated: [],
      response: `Yes — enabling competitor analysis is ${bold("highly recommended")}. It identifies keywords your competitors rank for that you don't, reveals content gaps, and helps produce articles designed to outrank existing content. Especially valuable in competitive industries like fintech, SaaS, and insurance.`,
    };
  }

  if (
    (lower.includes("cta") || lower.includes("call to action")) &&
    (lower.includes("better") || lower.includes("generate") || lower.includes("suggest"))
  ) {
    const goal = config.goal;
    let ctaText = "Book a Free Demo";
    if (goal === "Free trial" || goal === "Product sign-ups") ctaText = "Start Your Free Trial";
    if (config.industry?.toLowerCase().includes("insurance")) ctaText = "Get a Free Quote";
    return {
      updates: { ctaText },
      fieldsUpdated: ["ctaText"],
      response: `Based on your goal and industry, I'd recommend: ${bold(`"${ctaText}"`)} — specific, action-oriented, and low-friction. I've updated your CTA text. You can always edit it directly in the form.`,
    };
  }

  if (
    lower.includes("cta") ||
    (lower.includes("call to action") && lower.includes("best"))
  ) {
    return {
      updates: {},
      fieldsUpdated: [],
      response: `Effective CTAs match the user's intent:\n• ${bold("Lead gen")}: 'Book a Free Demo', 'Get a Custom Quote'\n• ${bold("Trial")}: 'Start Free Trial', 'Try for Free'\n• ${bold("Awareness")}: 'Download the Guide', 'Read the Report'\n• ${bold("Contact")}: 'Talk to an Expert'\n\nWhat's your primary conversion goal?`,
    };
  }

  if (
    lower.includes("article length") ||
    lower.includes("word count") ||
    (lower.includes("how long") && lower.includes("article"))
  ) {
    return {
      updates: {},
      fieldsUpdated: [],
      response: `For competitive SEO:\n• ${bold("800 words")} — Specific long-tail queries, low competition\n• ${bold("1,500 words")} — Most informational queries; sweet spot for conversions\n• ${bold("2,500 words")} — Competitive head terms, cornerstone content\n• ${bold("4,000+ words")} — Pillar pages, topic cluster hubs\n\nFor most SaaS blogs I'd start with ${bold("1,500 words")}.`,
    };
  }

  if (
    lower.includes("cadence") ||
    lower.includes("how many") ||
    lower.includes("articles per month") ||
    lower.includes("frequency") ||
    lower.includes("how often")
  ) {
    return {
      updates: {},
      fieldsUpdated: [],
      response: `Publishing cadence depends on quality bar and team size:\n• ${bold("4/month")} — Starting out, prioritise quality\n• ${bold("8/month")} — Growth phase, balanced approach\n• ${bold("12/month")} — Scaling up, established process\n• ${bold("20/month")} — Aggressive growth, needs full editorial pipeline\n\nConsistency matters more than volume. Google rewards regular publishing.`,
    };
  }

  if (lower.includes("schema")) {
    return {
      updates: {},
      fieldsUpdated: [],
      response: `Schema markup is worth enabling. It helps Google understand your content structure and can produce ${bold("rich snippets")} (FAQ dropdowns, article dates, star ratings) in search results. Rich snippets increase click-through rates by ${bold("20–30%")} on average. Highly recommended.`,
    };
  }

  if (lower.includes("featured snippet") || lower.includes("position zero")) {
    return {
      updates: {},
      fieldsUpdated: [],
      response: `Featured snippets appear ${bold("above all organic results")} (position zero). Winning them requires direct answers (40–60 words), clear heading structure, and numbered steps. Enabling this feature structures your articles to target snippet opportunities for your seed keywords.`,
    };
  }

  if (lower.includes("internal link")) {
    return {
      updates: {},
      fieldsUpdated: [],
      response: `Internal linking is essential. It distributes page authority across your site, helps Google discover all your content, and keeps readers engaged longer. I'd recommend enabling this — the system will suggest relevant internal links within each article based on your existing content library.`,
    };
  }

  if (lower.includes("seed keyword") || lower.includes("keyword")) {
    return {
      updates: {},
      fieldsUpdated: [],
      response: `Seed keywords are the core topics your content will target. Good examples:\n• ${bold("Fintech SaaS")}: 'expense management software', 'accounts payable automation'\n• ${bold("Insurance")}: 'term life insurance comparison', 'health insurance for startups'\n• ${bold("HR Tech")}: 'employee engagement platform', 'performance management software'\n\nAim for 5–8 seed keywords that reflect your product categories.`,
    };
  }

  if (lower.includes("destination") || lower.includes("cms") || lower.includes("publish to")) {
    return {
      updates: {},
      fieldsUpdated: [],
      response: `Publishing destination options:\n• ${bold("WordPress")} — Most common, direct post creation via API\n• ${bold("Webflow")} — CMS collections, ideal for design-heavy sites\n• ${bold("Notion")} — Good for internal drafts and review workflows\n• ${bold("Custom API")} — Your own endpoint receives the article as JSON\n• ${bold("Download only")} — Receive articles as Markdown or HTML files\n\nWhich platform does your website run on?`,
    };
  }

  return {
    updates: {},
    fieldsUpdated: [],
    response: `I can help you configure your SEO campaign. Describe your goals, audience, and tone in natural language and I'll update the configuration automatically — or ask me about any specific setting. For example: ${bold('"What\u2019s the best article length for a fintech blog targeting CTOs?"')}`,
  };
}

const FIELD_LABELS: Partial<Record<keyof SeoConfig, string>> = {
  goal: "Campaign goal",
  industry: "Industry",
  targetAudience: "Target audience",
  country: "Country",
  tone: "Tone",
  contentTypes: "Content types",
  articleLength: "Article length",
  publishingCadence: "Publishing cadence",
  competitorAnalysis: "Competitor analysis",
  schemaMarkup: "Schema markup",
  faqSections: "FAQ sections",
  internalLinking: "Internal linking",
  metaDescriptions: "Meta descriptions",
  featuredSnippets: "Featured snippets",
  ctaType: "CTA type",
  ctaText: "CTA text",
  destination: "Publishing destination",
};

export function parseMessage(message: string, currentConfig: SeoConfig): AiParseResult {
  const lower = message.toLowerCase();

  if (isQuestion(lower)) {
    return handleQuestion(lower, currentConfig);
  }

  const updates: Partial<SeoConfig> = {};
  const fieldsUpdated: (keyof SeoConfig)[] = [];

  // Goal
  if (lower.includes("lead gen") || lower.includes("lead generation")) {
    updates.goal = "Lead generation";
    fieldsUpdated.push("goal");
  } else if (lower.includes("brand awareness") || lower.includes("awareness campaign")) {
    updates.goal = "Brand awareness";
    fieldsUpdated.push("goal");
  } else if (
    lower.includes("sign-up") ||
    lower.includes("signup") ||
    lower.includes("sign up")
  ) {
    updates.goal = "Product sign-ups";
    fieldsUpdated.push("goal");
  } else if (lower.includes("traffic") && !lower.includes("paid traffic")) {
    updates.goal = "Traffic growth";
    fieldsUpdated.push("goal");
  } else if (lower.includes("thought leadership") || lower.includes("thought leader")) {
    updates.goal = "Thought leadership";
    fieldsUpdated.push("goal");
  } else if (
    lower.includes("seo blog") ||
    lower.includes("seo article") ||
    lower.includes("generate blog") ||
    lower.includes("blog for") ||
    lower.includes("content for")
  ) {
    updates.goal = "Lead generation";
    fieldsUpdated.push("goal");
  }

  // Industry
  if (lower.includes("fintech") || lower.includes("fin-tech")) {
    updates.industry = "Fintech";
    fieldsUpdated.push("industry");
  } else if (lower.includes(" saas") || lower.includes("software as a service")) {
    updates.industry = "SaaS";
    fieldsUpdated.push("industry");
  } else if (
    lower.includes("healthcare") ||
    lower.includes("health care") ||
    lower.includes("medtech")
  ) {
    updates.industry = "Healthcare";
    fieldsUpdated.push("industry");
  } else if (
    lower.includes("ecommerce") ||
    lower.includes("e-commerce") ||
    lower.includes("e commerce")
  ) {
    updates.industry = "E-commerce";
    fieldsUpdated.push("industry");
  } else if (lower.includes("insurance") || lower.includes("insurtech")) {
    updates.industry = "Insurance";
    fieldsUpdated.push("industry");
  } else if (lower.includes("hrtech") || lower.includes("hr tech")) {
    updates.industry = "HR Tech";
    fieldsUpdated.push("industry");
  } else if (lower.includes("edtech") || lower.includes("education tech")) {
    updates.industry = "EdTech";
    fieldsUpdated.push("industry");
  }

  // Tone
  if (lower.includes("professional")) {
    updates.tone = "Professional";
    fieldsUpdated.push("tone");
  } else if (
    lower.includes("casual") ||
    lower.includes("easy to understand") ||
    lower.includes("simple language") ||
    lower.includes("conversational")
  ) {
    updates.tone = "Conversational";
    fieldsUpdated.push("tone");
  } else if (lower.includes("technical") && !lower.includes("non-technical")) {
    updates.tone = "Technical";
    fieldsUpdated.push("tone");
  } else if (lower.includes("friendly") || lower.includes("approachable")) {
    updates.tone = "Friendly";
    fieldsUpdated.push("tone");
  } else if (lower.includes("authoritative") || lower.includes("expert tone")) {
    updates.tone = "Authoritative";
    fieldsUpdated.push("tone");
  }

  // Country
  if (
    lower.includes(" india ") ||
    lower.includes(" india.") ||
    lower.includes(" india,") ||
    lower.includes("in india") ||
    lower.includes("indian market")
  ) {
    updates.country = "India";
    fieldsUpdated.push("country");
  } else if (
    lower.includes("united states") ||
    lower.includes("usa") ||
    lower.includes("us market") ||
    lower.includes("american market")
  ) {
    updates.country = "United States";
    fieldsUpdated.push("country");
  } else if (
    lower.includes("uk ") ||
    lower.includes("united kingdom") ||
    lower.includes("british")
  ) {
    updates.country = "United Kingdom";
    fieldsUpdated.push("country");
  } else if (
    lower.includes("global") ||
    lower.includes("worldwide") ||
    lower.includes("international")
  ) {
    updates.country = "Global";
    fieldsUpdated.push("country");
  }

  // Target audience
  if (lower.includes("fintech startup")) {
    updates.targetAudience = "Fintech startup founders and CTOs";
    fieldsUpdated.push("targetAudience");
  } else if (lower.includes("startup founder") || lower.includes("ceo") || lower.includes("founder")) {
    updates.targetAudience = "Startup founders and C-suite executives";
    fieldsUpdated.push("targetAudience");
  } else if (lower.includes("b2b") || lower.includes("business to business")) {
    updates.targetAudience = "B2B decision-makers";
    fieldsUpdated.push("targetAudience");
  } else if (
    lower.includes("developer") ||
    lower.includes("engineers") ||
    lower.includes("engineering team")
  ) {
    updates.targetAudience = "Software developers and engineers";
    fieldsUpdated.push("targetAudience");
  } else if (
    lower.includes("hr manager") ||
    lower.includes("people ops") ||
    lower.includes("hr professional")
  ) {
    updates.targetAudience = "HR managers and People Ops teams";
    fieldsUpdated.push("targetAudience");
  } else if (lower.includes("smb") || lower.includes("small business")) {
    updates.targetAudience = "Small and medium business owners";
    fieldsUpdated.push("targetAudience");
  }

  // SEO feature flags
  if (
    lower.includes("competitor analysis") ||
    lower.includes("analyze competitor") ||
    lower.includes("analyse competitor")
  ) {
    updates.competitorAnalysis = true;
    fieldsUpdated.push("competitorAnalysis");
  }
  if (lower.includes("schema markup") || (lower.includes("schema") && lower.includes("generate"))) {
    updates.schemaMarkup = true;
    fieldsUpdated.push("schemaMarkup");
  }
  if (lower.includes("faq") || lower.includes("faqs") || lower.includes("frequently asked")) {
    updates.faqSections = true;
    fieldsUpdated.push("faqSections");
  }
  if (lower.includes("internal link")) {
    updates.internalLinking = true;
    fieldsUpdated.push("internalLinking");
  }
  if (lower.includes("meta description")) {
    updates.metaDescriptions = true;
    fieldsUpdated.push("metaDescriptions");
  }
  if (lower.includes("featured snippet") || lower.includes("position zero")) {
    updates.featuredSnippets = true;
    fieldsUpdated.push("featuredSnippets");
  }

  // CTA
  if (
    lower.includes("book a demo") ||
    lower.includes("book demo") ||
    lower.includes("schedule a demo") ||
    lower.includes("cta to book") ||
    lower.includes("cta: book")
  ) {
    updates.ctaType = "Book demo";
    updates.ctaText = "Book a Free Demo";
    fieldsUpdated.push("ctaType", "ctaText");
  } else if (lower.includes("free trial") || lower.includes("start trial")) {
    updates.ctaType = "Free trial";
    updates.ctaText = "Start Free Trial";
    fieldsUpdated.push("ctaType", "ctaText");
  } else if (lower.includes("contact us") || lower.includes("get in touch")) {
    updates.ctaType = "Contact us";
    updates.ctaText = "Get in Touch";
    fieldsUpdated.push("ctaType", "ctaText");
  }

  // Article length from word count mention
  const wordMatch = lower.match(/(\d[\d,]*)\s*(?:word|words|w\b)/);
  if (wordMatch) {
    const count = parseInt(wordMatch[1].replace(/,/g, ""), 10);
    if (count <= 1000) updates.articleLength = "Short (800 words)";
    else if (count <= 2000) updates.articleLength = "Medium (1,500 words)";
    else if (count <= 3000) updates.articleLength = "Long (2,500 words)";
    else updates.articleLength = "Pillar (4,000+ words)";
    fieldsUpdated.push("articleLength");
  }

  // Content types
  const newTypes: string[] = [...(currentConfig.contentTypes ?? [])];
  if (lower.includes("how-to") || lower.includes("how to guide")) {
    if (!newTypes.includes("How-to guides")) newTypes.push("How-to guides");
  }
  if (lower.includes("listicle") || lower.includes("list article")) {
    if (!newTypes.includes("Listicles")) newTypes.push("Listicles");
  }
  if (lower.includes("case study") || lower.includes("case studies")) {
    if (!newTypes.includes("Case studies")) newTypes.push("Case studies");
  }
  if (lower.includes("comparison") || lower.includes("vs article")) {
    if (!newTypes.includes("Comparison articles")) newTypes.push("Comparison articles");
  }
  if (
    lower.includes("blog article") ||
    lower.includes("blog post") ||
    lower.includes("blog content")
  ) {
    if (!newTypes.includes("Blog articles")) newTypes.push("Blog articles");
  }
  if (newTypes.length > (currentConfig.contentTypes?.length ?? 0)) {
    updates.contentTypes = newTypes;
    fieldsUpdated.push("contentTypes");
  }

  // Deduplicate fields
  const unique = [...new Set(fieldsUpdated)] as (keyof SeoConfig)[];

  if (unique.length === 0) {
    return {
      updates,
      fieldsUpdated: unique,
      response: `I couldn't identify specific configuration values from your message. Try describing your campaign — goals, audience, industry, or tone — or ask me a question like ${bold('"What tone works best for B2B SaaS?"')}`,
    };
  }

  const labels = unique.map((k) => bold(FIELD_LABELS[k] ?? String(k)));
  const suffix =
    unique.length >= 5
      ? " Great start — keep describing your campaign to fill more fields, or edit any value directly in the form."
      : unique.length >= 2
      ? " Feel free to continue or ask me any configuration questions."
      : " Let me know if you'd like to adjust this or configure additional settings.";

  return {
    updates,
    fieldsUpdated: unique,
    response: `Updated ${labels.join(", ")} based on your input.${suffix}`,
  };
}
