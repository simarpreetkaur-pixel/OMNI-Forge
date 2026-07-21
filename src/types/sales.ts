// ─── Shared field primitives ──────────────────────────────────────────────────

export type FieldType = "text" | "badge" | "number" | "date" | "link" | "boolean";

export interface SalesDataField {
  id: string;
  label: string;
  type: FieldType;
  jsonPath: string;   // dot-path into API response, e.g. "loan.outstanding"
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export interface SalesCampaign {
  id: string;
  name: string;         // e.g. "Fresh Lead", "Renewal", "Winback"
  description: string;
  color: string;        // hex for the campaign badge
}

const CAMPAIGN_COLORS = [
  "#7c3aed", "#2563eb", "#059669",
  "#d97706", "#dc2626", "#0891b2",
];
let colorIndex = 0;
export function nextCampaignColor(): string {
  return CAMPAIGN_COLORS[colorIndex++ % CAMPAIGN_COLORS.length];
}

// ─── Opening Call Context ─────────────────────────────────────────────────────
// The modal shown to the agent before they accept / begin the call.
// Data is fetched live from the company's API when the phone rings.

export type ContextFieldType = "text" | "badge" | "date" | "number" | "boolean";
export type ContextFieldSource = "leadRecord" | "api";

export interface OpeningContextField {
  id: string;
  key: string;               // stable identifier (used for prebuilt fields)
  label: string;
  type: ContextFieldType;
  source: ContextFieldSource;
  apiPath: string;           // JSON path when source = "api"
  enabled: boolean;
  isCustom: boolean;         // false for prebuilt fields, true for admin-added
}

export interface OpeningContextConfig {
  apiUrl: string;            // endpoint called when call rings
  apiAuthType: "none" | "bearer" | "apiKey";
  apiAuthValue: string;
  fields: OpeningContextField[];
}

/** The 9 prebuilt fields admin can toggle per campaign */
export const PREBUILT_CONTEXT_FIELDS: Omit<OpeningContextField, "enabled">[] = [
  { id: "ctx-customer-name",     key: "customer_name",      label: "Customer Name",              type: "text",    source: "leadRecord", apiPath: "", isCustom: false },
  { id: "ctx-language",          key: "language",            label: "Language",                   type: "badge",   source: "leadRecord", apiPath: "", isCustom: false },
  { id: "ctx-location",          key: "location",            label: "Location",                   type: "text",    source: "leadRecord", apiPath: "", isCustom: false },
  { id: "ctx-customer-type",     key: "customer_type",       label: "Customer Type",              type: "badge",   source: "leadRecord", apiPath: "", isCustom: false },
  { id: "ctx-campaign",          key: "campaign",            label: "Campaign",                   type: "badge",   source: "leadRecord", apiPath: "", isCustom: false },
  { id: "ctx-product-interest",  key: "product_interest",    label: "Product / Plan of Interest", type: "text",    source: "leadRecord", apiPath: "", isCustom: false },
  { id: "ctx-last-activity",     key: "last_activity",       label: "Last Activity",              type: "date",    source: "leadRecord", apiPath: "", isCustom: false },
  { id: "ctx-drop-off",          key: "drop_off_point",      label: "Drop-off Point",             type: "text",    source: "leadRecord", apiPath: "", isCustom: false },
  { id: "ctx-prev-call-summary", key: "prev_call_summary",   label: "Previous Call Summary",      type: "text",    source: "leadRecord", apiPath: "", isCustom: false },
];

export function defaultOpeningContext(): OpeningContextConfig {
  return {
    apiUrl: "",
    apiAuthType: "none",
    apiAuthValue: "",
    fields: PREBUILT_CONTEXT_FIELDS.map((f) => ({ ...f, enabled: true })),
  };
}

// ─── Customer 360 (left pane) ─────────────────────────────────────────────────

export interface SalesCustomSection {
  id: string;
  name: string;
  icon: string;        // lucide icon name
  enabled: boolean;
  apiUrl: string;
  apiAuthType: "none" | "bearer" | "apiKey";
  apiAuthValue: string;
  fields: SalesDataField[];
  campaignIds: string[];  // empty = visible in all campaigns; otherwise scoped
}

// ─── AI Copilot (per campaign) ────────────────────────────────────────────────

export interface CampaignCopilot {
  openingScript: string;
  objectionHandling: string;
  closingScript: string;
  predictiveCTAs: string[];  // buttons AI surfaces mid-call
  quickActions: string[];    // shortcuts agent fires from chat bar
}

export function defaultCopilot(): CampaignCopilot {
  return {
    openingScript: "",
    objectionHandling: "",
    closingScript: "",
    predictiveCTAs: [],
    quickActions: [],
  };
}

// ─── Power Tools (right pane, global) ────────────────────────────────────────

export interface PowerTool {
  id: string;
  name: string;         // e.g. "Quote Tool", "Policy Portal"
  icon: string;         // lucide icon name
  url: string;          // opens in new tab
  description: string;
}

// ─── Lead Source ──────────────────────────────────────────────────────────────

export type LeadSourceType = "none" | "csv" | "api" | "both";

export interface LeadSource {
  type: LeadSourceType;
  csvFileName: string;
  csvUploadedAt: number | null;
  apiUrl: string;
  apiAuthType: "none" | "bearer" | "apiKey";
  apiAuthValue: string;
}

// ─── Supporting types ─────────────────────────────────────────────────────────

export interface SalesProduct {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface SalesEmployee {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "agent";
  team: string;
}

export interface SalesKnowledgeFile {
  name: string;
  uploadedAt: number;
}

// ─── Main config ──────────────────────────────────────────────────────────────

export interface SalesConfig {
  // ① Lead Source
  leadSource: LeadSource;

  // ② Campaigns
  campaigns: SalesCampaign[];

  // ③ Opening Call Context — keyed by campaignId
  openingContext: Record<string, OpeningContextConfig>;

  // ④ Customer 360 — sections scoped to campaigns via campaignIds[]
  customSections: SalesCustomSection[];

  // ⑤ AI Copilot — keyed by campaignId
  copilot: Record<string, CampaignCopilot>;

  // ⑥ Power Tools (global)
  powerTools: PowerTool[];

  // ⑦ Dispositions (global)
  dispositions: string[];

  // ⑧ Knowledge Base (global)
  knowledgeFiles: SalesKnowledgeFile[];

  // Employees
  employees: SalesEmployee[];

  // Misc
  appUrl: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const EMPTY_SALES_CONFIG: SalesConfig = {
  leadSource: {
    type: "none",
    csvFileName: "",
    csvUploadedAt: null,
    apiUrl: "",
    apiAuthType: "none",
    apiAuthValue: "",
  },
  campaigns: [],
  openingContext: {},
  customSections: [],
  copilot: {},
  powerTools: [],
  dispositions: ["Converted", "Not Interested", "Callback Scheduled", "No Answer", "DND"],
  knowledgeFiles: [],
  employees: [],
  appUrl: "https://simarpreetkaur-pixel.github.io/OMNI-Presales-Design/",
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const DISPOSITION_SUGGESTIONS = [
  "Converted", "Not Interested", "Callback Scheduled",
  "No Answer", "DND", "Invalid Number", "Language Barrier",
  "Escalated to Manager", "Already Purchased", "No Budget",
];

export const PREDICTIVE_CTA_SUGGESTIONS = [
  "Resume Quote", "Compare Plans", "Previous Interaction Summary",
  "Send Proposal", "Escalate to Manager", "Check Payment Status",
  "View Interaction History", "Renew Now",
];

export const QUICK_ACTION_SUGGESTIONS = [
  "Create Quote", "Send Proposal via Email", "Schedule Callback",
  "Log a Note", "Check Payment Status", "Escalate to Manager", "Send SMS",
];

export const PRODUCT_CATEGORY_OPTIONS = [
  "Insurance Plan", "Financial Product", "Loan / Credit",
  "Software / SaaS", "Physical Product", "Service",
  "Subscription", "Real Estate", "Other",
];

export const FIELD_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: "text",    label: "Text" },
  { value: "badge",   label: "Badge / Status" },
  { value: "number",  label: "Number / Amount" },
  { value: "date",    label: "Date" },
  { value: "link",    label: "Link / URL" },
  { value: "boolean", label: "Yes / No" },
];

export const SECTION_ICON_OPTIONS = [
  "Home", "Car", "CreditCard", "Heart", "Briefcase", "Building2",
  "Package", "FileText", "Phone", "Mail", "Users", "BarChart2",
  "ShoppingCart", "DollarSign", "Activity", "Globe", "Database",
  "Layers", "Star", "Zap", "Settings", "TrendingUp",
];

export const POWER_TOOL_ICON_OPTIONS = [
  "ExternalLink", "Globe", "FileText", "Calculator", "CreditCard",
  "BarChart2", "BookOpen", "ClipboardList", "Headphones", "Zap",
  "Search", "DollarSign", "Phone", "Mail", "Building2",
];
