import { ArrowLeft, FileText, PenLine, BarChart2, Clock, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SeoConfig } from "@/types/seo";

// ─── Article data ─────────────────────────────────────────────────────────────

type ArticleStatus = "published" | "draft" | "generating";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  status: ArticleStatus;
  date: string;
  wordCount: number;
  seoScore: number;
}

const ARTICLES_BY_INDUSTRY: Record<string, Article[]> = {
  fintech: [
    {
      id: "1",
      title: "10 Best Expense Management Software for Fintech Startups in 2026",
      excerpt: "Managing expenses is critical for growing fintech companies. We break down the top platforms by feature depth, pricing, and integration support.",
      status: "published",
      date: "Jul 2, 2026",
      wordCount: 1520,
      seoScore: 84,
    },
    {
      id: "2",
      title: "How to Automate Financial Reconciliation: A Step-by-Step Guide",
      excerpt: "Finance teams spend an average of 12 hours per week on manual reconciliation. Here's how automation changes the equation.",
      status: "published",
      date: "Jul 1, 2026",
      wordCount: 2100,
      seoScore: 91,
    },
    {
      id: "3",
      title: "Open Banking API Integration: What Developers Need to Know",
      excerpt: "A technical primer on connecting to open banking APIs — from auth flows to data parsing and error handling.",
      status: "published",
      date: "Jun 30, 2026",
      wordCount: 1680,
      seoScore: 78,
    },
    {
      id: "4",
      title: "Fintech Compliance 101: AML, KYC, and RBI Guidelines for Startups",
      excerpt: "Staying compliant in India's rapidly evolving fintech regulatory landscape. Key obligations every founder needs to understand.",
      status: "draft",
      date: "Jul 5, 2026",
      wordCount: 1900,
      seoScore: 72,
    },
    {
      id: "5",
      title: "B2B Fintech Sales: How to Reach CFOs and Finance Decision-Makers",
      excerpt: "Finance decision-makers are a notoriously difficult audience. This guide covers the channels, messaging frameworks, and timing that work.",
      status: "draft",
      date: "Jul 6, 2026",
      wordCount: 1400,
      seoScore: 65,
    },
    {
      id: "6",
      title: "The Complete Guide to Embedded Finance for SaaS Companies",
      excerpt: "Embedding financial services into your SaaS product can unlock new revenue streams and reduce churn.",
      status: "generating",
      date: "Jul 7, 2026",
      wordCount: 0,
      seoScore: 0,
    },
  ],
  insurance: [
    {
      id: "1",
      title: "Term Life vs Whole Life Insurance: Which Is Right for Your Family?",
      excerpt: "A clear, jargon-free comparison of the two most common life insurance types — what they cover, cost, and when to choose each.",
      status: "published",
      date: "Jul 2, 2026",
      wordCount: 1650,
      seoScore: 88,
    },
    {
      id: "2",
      title: "Health Insurance for Startups: A Founder's Guide to Group Plans",
      excerpt: "Providing health cover to your early team is now table stakes for talent. Here's how to set it up without burning runway.",
      status: "published",
      date: "Jul 1, 2026",
      wordCount: 1800,
      seoScore: 82,
    },
    {
      id: "3",
      title: "How to File a Motor Insurance Claim in India: Step-by-Step",
      excerpt: "Most claims get delayed because of incomplete paperwork. This guide walks you through every step, document by document.",
      status: "published",
      date: "Jun 28, 2026",
      wordCount: 1200,
      seoScore: 94,
    },
    {
      id: "4",
      title: "Top 7 Mistakes People Make When Buying Health Insurance",
      excerpt: "From underinsuring to ignoring waiting periods — these common mistakes can cost you dearly when you actually need coverage.",
      status: "draft",
      date: "Jul 5, 2026",
      wordCount: 1350,
      seoScore: 70,
    },
    {
      id: "5",
      title: "Cyber Insurance for SMBs: Why It's No Longer Optional",
      excerpt: "With data breaches rising 43% YoY, small businesses are increasingly in the crosshairs. Here's what cyber insurance actually covers.",
      status: "draft",
      date: "Jul 6, 2026",
      wordCount: 1550,
      seoScore: 68,
    },
    {
      id: "6",
      title: "Insurance Premium Calculator: How It Works and What Affects Your Rate",
      excerpt: "Demystifying the black box of premium calculations — age, claims history, coverage type, and more.",
      status: "generating",
      date: "Jul 7, 2026",
      wordCount: 0,
      seoScore: 0,
    },
  ],
  saas: [
    {
      id: "1",
      title: "The Ultimate Guide to SaaS Pricing Models in 2026",
      excerpt: "From freemium to usage-based pricing — how top SaaS companies structure their plans and why it affects growth.",
      status: "published",
      date: "Jul 2, 2026",
      wordCount: 2200,
      seoScore: 87,
    },
    {
      id: "2",
      title: "How to Reduce SaaS Churn: 12 Proven Strategies",
      excerpt: "Churn is the silent killer of SaaS growth. These 12 strategies are used by companies that keep annual churn below 5%.",
      status: "published",
      date: "Jul 1, 2026",
      wordCount: 1850,
      seoScore: 92,
    },
    {
      id: "3",
      title: "Product-Led Growth vs Sales-Led Growth: Which Works for Your Stage?",
      excerpt: "PLG and SLG are not mutually exclusive — but they require very different resource allocations and motion types.",
      status: "published",
      date: "Jul 3, 2026",
      wordCount: 1600,
      seoScore: 76,
    },
    {
      id: "4",
      title: "SaaS Onboarding Best Practices: Getting Users to That First Win",
      excerpt: "The first 7 days determine whether a user becomes a long-term customer or a churned trial. Here's how to get it right.",
      status: "draft",
      date: "Jul 5, 2026",
      wordCount: 1700,
      seoScore: 71,
    },
    {
      id: "5",
      title: "How to Build a B2B SaaS Content Strategy That Actually Drives Demos",
      excerpt: "Most SaaS blogs don't generate pipeline. This framework changes the equation — from topic selection to conversion architecture.",
      status: "draft",
      date: "Jul 6, 2026",
      wordCount: 2050,
      seoScore: 67,
    },
    {
      id: "6",
      title: "SaaS Metrics Glossary: MRR, ARR, NRR, CAC, LTV — Explained",
      excerpt: "A no-fluff reference for the metrics every SaaS founder, investor, and operator needs to understand.",
      status: "generating",
      date: "Jul 7, 2026",
      wordCount: 0,
      seoScore: 0,
    },
  ],
  default: [
    {
      id: "1",
      title: "10 SEO Best Practices That Drive Organic Growth in 2026",
      excerpt: "Search algorithms have changed — but these fundamentals still move the needle for any industry.",
      status: "published",
      date: "Jul 2, 2026",
      wordCount: 1600,
      seoScore: 85,
    },
    {
      id: "2",
      title: "How to Build a Content Strategy That Converts Visitors to Leads",
      excerpt: "Traffic without intent is just vanity. Here's how to align your content strategy with your conversion goals.",
      status: "published",
      date: "Jul 1, 2026",
      wordCount: 1900,
      seoScore: 80,
    },
    {
      id: "3",
      title: "Long-Tail Keywords: The Underrated Growth Lever for Growing Businesses",
      excerpt: "Head terms are competitive and expensive. Long-tail keywords are where the conversions actually happen.",
      status: "published",
      date: "Jun 30, 2026",
      wordCount: 1450,
      seoScore: 88,
    },
    {
      id: "4",
      title: "The Complete On-Page SEO Checklist for 2026",
      excerpt: "From title tags to internal linking — a field-tested checklist you can apply to every article you publish.",
      status: "draft",
      date: "Jul 5, 2026",
      wordCount: 1700,
      seoScore: 73,
    },
    {
      id: "5",
      title: "Competitor Analysis for SEO: How to Outrank Without Outspending",
      excerpt: "Understanding what your competitors are ranking for — and where their content falls short — is the most underutilised SEO tactic.",
      status: "draft",
      date: "Jul 6, 2026",
      wordCount: 1550,
      seoScore: 66,
    },
    {
      id: "6",
      title: "Schema Markup Guide: How Structured Data Wins Rich Snippets",
      excerpt: "Rich snippets improve click-through rates by up to 30%. Here's how to implement schema markup correctly.",
      status: "generating",
      date: "Jul 7, 2026",
      wordCount: 0,
      seoScore: 0,
    },
  ],
};

function getArticles(config: SeoConfig): Article[] {
  const industry = (config.industry || "").toLowerCase();
  if (industry.includes("fintech") || industry.includes("finance")) return ARTICLES_BY_INDUSTRY.fintech;
  if (industry.includes("insurance") || industry.includes("insurtech")) return ARTICLES_BY_INDUSTRY.insurance;
  if (industry.includes("saas") || industry.includes("software")) return ARTICLES_BY_INDUSTRY.saas;
  return ARTICLES_BY_INDUSTRY.default;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ArticleStatus }) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
        Published
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span className="inline-flex items-center rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[11px] font-medium text-[#737373]">
        Draft
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-600">
      <RefreshCw className="size-2.5 animate-spin" />
      Generating
    </span>
  );
}

// ─── SEO Score ring ───────────────────────────────────────────────────────────

function SeoScore({ score }: { score: number }) {
  if (score === 0) return <span className="text-[11px] text-[#c0c0c0]">—</span>;
  const color = score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-600" : "text-red-500";
  return (
    <span className={cn("text-[11px] font-semibold tabular-nums", color)}>
      {score}<span className="font-normal text-[#a0a0a0]">/100</span>
    </span>
  );
}

// ─── Article card ─────────────────────────────────────────────────────────────

function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-[#e7e7f0] bg-white p-4 transition-all hover:border-purple-200 hover:shadow-md">
      {/* Status + date */}
      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={article.status} />
        <span className="flex items-center gap-1 text-[11px] text-[#a0a0a0]">
          <Clock className="size-3 shrink-0" />
          {article.date}
        </span>
      </div>

      {/* Title */}
      <p className="text-[13px] font-semibold leading-[1.4] text-[#0a0a0a] line-clamp-2">
        {article.title}
      </p>

      {/* Excerpt */}
      <p className="line-clamp-2 text-[12px] leading-[1.5] text-[#737373]">
        {article.excerpt}
      </p>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-[#f0f0f0] pt-3">
        <div className="flex items-center gap-3">
          {article.wordCount > 0 ? (
            <span className="flex items-center gap-1 text-[11px] text-[#a0a0a0]">
              <PenLine className="size-3" />
              {article.wordCount.toLocaleString()} words
            </span>
          ) : null}
          <span className="flex items-center gap-1 text-[11px] text-[#a0a0a0]">
            <BarChart2 className="size-3" />
            <SeoScore score={article.seoScore} />
          </span>
        </div>
        {article.status !== "generating" && (
          <button
            type="button"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[#737373] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#f5f5f5]"
          >
            <ExternalLink className="size-3" />
            View
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SeoArticlesViewProps {
  appName: string;
  config: SeoConfig;
  onBack: () => void;
  onConfigure: () => void;
}

export default function SeoArticlesView({
  appName,
  config,
  onBack,
  onConfigure,
}: SeoArticlesViewProps) {
  const articles = getArticles(config);
  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.filter((a) => a.status === "draft").length;

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-[#fafafa]">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-[#e7e7f0] bg-white px-8 py-3.5">
        <button
          type="button"
          onClick={onBack}
          className="flex size-8 items-center justify-center rounded-md border border-[#e5e5e5] bg-white shadow-sm transition-colors hover:bg-[#f5f5f5]"
        >
          <ArrowLeft className="size-4 text-[#0a0a0a]" />
        </button>
        <span className="text-sm text-[#737373]">Apps</span>
        <span className="text-[#a0a0a0]">›</span>
        <span className="text-sm font-medium text-[#0a0a0a]">{appName}</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Page header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-[20px] font-semibold leading-none tracking-tight text-[#0a0a0a]">
              Generated articles
            </h1>
            <p className="mt-1.5 text-sm text-[#737373]">
              {published} published · {drafts} draft
              {config.industry ? ` · ${config.industry} campaign` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onConfigure}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-4 text-sm font-medium text-[#0a0a0a] shadow-sm transition-colors hover:bg-[#f5f5f5]"
            >
              <FileText className="size-3.5 shrink-0 text-[#737373]" />
              Configure
            </button>
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
            >
              <PenLine className="size-3.5 shrink-0" />
              Generate article
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: "Total articles", value: String(articles.length) },
            { label: "Avg. SEO score", value: `${Math.round(articles.filter(a => a.seoScore > 0).reduce((s, a) => s + a.seoScore, 0) / Math.max(1, articles.filter(a => a.seoScore > 0).length))}/100` },
            { label: "Total words published", value: articles.filter(a => a.status === "published").reduce((s, a) => s + a.wordCount, 0).toLocaleString() },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1 rounded-xl border border-[#e7e7f0] bg-white px-4 py-3"
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#a0a0a0]">
                {stat.label}
              </span>
              <span className="text-[20px] font-semibold leading-none text-[#0a0a0a]">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Article grid */}
        <div className="grid grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        <div className="h-8" />
      </div>
    </main>
  );
}
