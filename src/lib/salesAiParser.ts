import type {
  SalesConfig, SalesCampaign, SalesCustomSection, SalesDataField,
  CampaignCopilot, PowerTool, OpeningContextConfig,
} from "@/types/sales";
import {
  defaultOpeningContext, defaultCopilot, nextCampaignColor,
  PREBUILT_CONTEXT_FIELDS,
} from "@/types/sales";

export interface SalesAiParseResult {
  updates: Partial<SalesConfig>;
  /** Which top-level config keys changed */
  fieldsUpdated: (keyof SalesConfig)[];
  /** Which campaign was affected (for per-campaign changes) */
  affectedCampaignId?: string;
  /** Which section nav item to auto-navigate to */
  navigateTo?: string;
  response: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const QUESTION_STARTERS =
  /^(what|should|how|can|is|are|which|when|why|recommend|suggest|tell|help|give me|generate|best|do i need|will|does)/i;

function isQuestion(msg: string): boolean {
  return msg.includes("?") || QUESTION_STARTERS.test(msg.trim());
}

function b(text: string) { return `**${text}**`; }

function guessSectionIcon(name: string): string {
  const l = name.toLowerCase();
  if (l.includes("loan") || l.includes("credit") || l.includes("emi")) return "CreditCard";
  if (l.includes("propert") || l.includes("home"))       return "Home";
  if (l.includes("vehicle") || l.includes("car"))        return "Car";
  if (l.includes("subscript") || l.includes("plan") || l.includes("policy")) return "FileText";
  if (l.includes("family") || l.includes("member") || l.includes("dependent")) return "Users";
  if (l.includes("call") || l.includes("interaction") || l.includes("histor")) return "Phone";
  if (l.includes("order") || l.includes("purchase"))     return "ShoppingCart";
  if (l.includes("payment") || l.includes("invoice"))    return "DollarSign";
  if (l.includes("portfolio") || l.includes("invest"))   return "TrendingUp";
  if (l.includes("quote") || l.includes("deal"))         return "FileText";
  return "Database";
}

/** Split a comma/semicolon-and list into trimmed items */
function splitList(text: string): string[] {
  return text
    .replace(/\band\b/gi, ",")
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

/** Find a campaign by name (case-insensitive) */
function findCampaign(campaigns: SalesCampaign[], name: string): SalesCampaign | undefined {
  return campaigns.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

// ─── Handle questions ─────────────────────────────────────────────────────────

function handleQuestion(lower: string): SalesAiParseResult {
  if (lower.includes("campaign")) {
    return { updates: {}, fieldsUpdated: [], navigateTo: "campaigns", response: `Campaigns let you configure different scripts, left-panel data, and opening context per use case.\n\nExamples: ${b('"Add campaigns: Fresh Lead, Renewal, Winback"')} or ${b('"Create a Cross-sell campaign for existing customers"')}` };
  }
  if (lower.includes("opening") || lower.includes("pre-call") || lower.includes("before the call")) {
    return { updates: {}, fieldsUpdated: [], navigateTo: "call-context", response: `The ${b("Opening Call Context")} is the modal shown to the agent before they accept a call — giving them key info about the customer.\n\nSay which campaign you want to configure it for:\n${b('"For Fresh Lead, show customer name, product interest, and previous call summary"')}` };
  }
  if (lower.includes("left panel") || lower.includes("customer 360") || lower.includes("section")) {
    return { updates: {}, fieldsUpdated: [], navigateTo: "customer-360", response: `The ${b("Customer 360")} left panel shows the agent real-time data about the customer during a live call.\n\nPre-built sections (Basic Info, Call History) are always on. Add your own:\n${b('"Add a section called Loan Portfolio with API https://…"')}` };
  }
  if (lower.includes("power tool") || lower.includes("right pane") || lower.includes("shortcut")) {
    return { updates: {}, fieldsUpdated: [], navigateTo: "power-tools", response: `${b("Power Tools")} are shortcuts in the right pane that open tools agents use during a call.\n\nExample: ${b('"Add tool: Quote Portal → https://quote.company.com"')}\nOr: ${b('"Add: Policy Lookup → https://…, Claims Portal → https://…"')}` };
  }
  if (lower.includes("disposition") || lower.includes("outcome")) {
    return { updates: {}, fieldsUpdated: [], navigateTo: "dispositions", response: `${b("Dispositions")} are the outcomes an agent must select after every call.\n\nCurrent defaults: Converted, Not Interested, Callback Scheduled, No Answer, DND.\n\nAdd more: ${b('"Add disposition: Already Purchased, No Budget, Language Barrier"')}` };
  }
  if (lower.includes("script") || lower.includes("opening line")) {
    return { updates: {}, fieldsUpdated: [], navigateTo: "ai-copilot", response: `${b("Scripts")} are per campaign. Tell me which campaign and what to say:\n\n${b('"For Fresh Lead, opening script: Hi I\'m [Agent] from [Company]…"')}\nor\n${b('"Set Renewal objection handling to: I understand you\'re hesitant…"')}` };
  }
  return {
    updates: {}, fieldsUpdated: [],
    response: `I can configure any part of the Sales app. Just tell me what you need:\n\n• ${b('"Add campaigns: Fresh Lead, Renewal, Winback"')}\n• ${b('"For Renewal, set opening script to…"')}\n• ${b('"Show Loan Portfolio in the left panel for Fresh Lead"')}\n• ${b('"Add power tool: Quote Portal → https://…"')}\n• ${b('"Add disposition: No Budget"')}`,
  };
}

// ─── Main parser ──────────────────────────────────────────────────────────────

const FIELD_LABELS: Partial<Record<keyof SalesConfig, string>> = {
  leadSource: "Lead source",
  campaigns: "Campaigns",
  openingContext: "Opening call context",
  customSections: "Customer 360",
  copilot: "AI Copilot",
  powerTools: "Power tools",
  dispositions: "Dispositions",
};

export function parseSalesMessage(
  message: string,
  currentConfig: SalesConfig,
  selectedCampaignId?: string | null,
): SalesAiParseResult {
  const lower = message.toLowerCase();

  if (isQuestion(lower)) return handleQuestion(lower);

  const updates: Partial<SalesConfig> = {};
  const fieldsUpdated: (keyof SalesConfig)[] = [];
  let affectedCampaignId: string | undefined;
  let navigateTo: string | undefined;

  // ── ① Detect target campaign for per-campaign commands ────────────────────

  // "for [campaign name]" or "in [campaign] campaign" or use currently selected
  let targetCampaignId = selectedCampaignId ?? undefined;
  let targetCampaignName: string | undefined;

  const forMatch = message.match(/\b(?:for|in)\s+(?:the\s+)?([A-Za-z][A-Za-z0-9 ]{1,40}?)(?:\s+campaign)?\s*[,:-]/i);
  if (forMatch) {
    const name = forMatch[1].trim();
    const found = findCampaign(currentConfig.campaigns, name);
    if (found) { targetCampaignId = found.id; targetCampaignName = found.name; }
  }

  // ── ② Create campaigns ────────────────────────────────────────────────────

  // "add campaigns: X, Y, Z" | "create campaigns X and Y" | "campaigns: X, Y"
  const campaignCreateMatch = message.match(
    /(?:add|create|set up|new)\s+campaigns?\s*[:\-]?\s*(.+?)(?:\.|$)/i
  ) ?? message.match(/^campaigns?\s*[:\-]\s*(.+)/i);

  if (campaignCreateMatch) {
    const names = splitList(campaignCreateMatch[1]).filter((n) => n.length > 1);
    if (names.length > 0) {
      const newCampaigns: SalesCampaign[] = [];
      const newOpeningContext = { ...currentConfig.openingContext };
      const newCopilot = { ...currentConfig.copilot };

      for (const name of names) {
        if (findCampaign(currentConfig.campaigns, name)) continue; // skip duplicates
        const id = `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
        newCampaigns.push({ id, name: name.charAt(0).toUpperCase() + name.slice(1), description: "", color: nextCampaignColor() });
        newOpeningContext[id] = defaultOpeningContext();
        newCopilot[id] = defaultCopilot();
      }

      if (newCampaigns.length > 0) {
        updates.campaigns = [...currentConfig.campaigns, ...newCampaigns];
        updates.openingContext = newOpeningContext;
        updates.copilot = newCopilot;
        fieldsUpdated.push("campaigns", "openingContext", "copilot");
        navigateTo = "campaigns";
        affectedCampaignId = newCampaigns[0].id;
      }
    }
  }

  // ── ③ Opening script ──────────────────────────────────────────────────────

  const scriptMatch = message.match(
    /(?:opening\s*(?:script|line)?|script\s+(?:is|should be|to))\s*[:\-]?\s*[""]?(.{20,})/i
  );
  if (scriptMatch && targetCampaignId) {
    const script = scriptMatch[1].replace(/[""]$/, "").trim();
    updates.copilot = {
      ...currentConfig.copilot,
      [targetCampaignId]: { ...( currentConfig.copilot[targetCampaignId] ?? defaultCopilot()), openingScript: script },
    };
    fieldsUpdated.push("copilot");
    affectedCampaignId = targetCampaignId;
    navigateTo = "ai-copilot";
  }

  // ── ④ Objection handling ──────────────────────────────────────────────────

  const objMatch = message.match(/objection\s*(?:handling)?\s*[:\-]\s*[""]?(.{20,})/i);
  if (objMatch && targetCampaignId) {
    updates.copilot = {
      ...currentConfig.copilot,
      [targetCampaignId]: { ...(currentConfig.copilot[targetCampaignId] ?? defaultCopilot()), objectionHandling: objMatch[1].trim() },
    };
    fieldsUpdated.push("copilot");
    affectedCampaignId = targetCampaignId;
    navigateTo = "ai-copilot";
  }

  // ── ⑤ Closing script ──────────────────────────────────────────────────────

  const closingMatch = message.match(/closing\s*(?:script)?\s*[:\-]\s*[""]?(.{20,})/i);
  if (closingMatch && targetCampaignId) {
    updates.copilot = {
      ...currentConfig.copilot,
      [targetCampaignId]: { ...(currentConfig.copilot[targetCampaignId] ?? defaultCopilot()), closingScript: closingMatch[1].trim() },
    };
    fieldsUpdated.push("copilot");
    affectedCampaignId = targetCampaignId;
    navigateTo = "ai-copilot";
  }

  // ── ⑥ Predictive CTAs ────────────────────────────────────────────────────

  const ctaMatch = message.match(
    /(?:(?:predictive\s+)?ctas?|action\s+buttons?)\s*(?:for\s+\w+\s+)?(?:to\s+|:)\s*(.+?)(?:\.|$)/i
  );
  if (ctaMatch && targetCampaignId) {
    const ctas = splitList(ctaMatch[1]);
    if (ctas.length > 0) {
      const cur = currentConfig.copilot[targetCampaignId] ?? defaultCopilot();
      const merged = [...new Set([...cur.predictiveCTAs, ...ctas])];
      updates.copilot = { ...currentConfig.copilot, [targetCampaignId]: { ...cur, predictiveCTAs: merged } };
      fieldsUpdated.push("copilot");
      affectedCampaignId = targetCampaignId;
      navigateTo = "ai-copilot";
    }
  }

  // ── ⑦ Quick Actions ───────────────────────────────────────────────────────

  const qaMatch = message.match(/quick\s+actions?\s*[:\-]\s*(.+?)(?:\.|$)/i);
  if (qaMatch && targetCampaignId) {
    const qas = splitList(qaMatch[1]);
    if (qas.length > 0) {
      const cur = currentConfig.copilot[targetCampaignId] ?? defaultCopilot();
      const merged = [...new Set([...cur.quickActions, ...qas])];
      updates.copilot = { ...currentConfig.copilot, [targetCampaignId]: { ...cur, quickActions: merged } };
      fieldsUpdated.push("copilot");
      affectedCampaignId = targetCampaignId;
      navigateTo = "ai-copilot";
    }
  }

  // ── ⑧ Custom sections (Customer 360) ─────────────────────────────────────

  // "add a section called X with API https://…" | "show X in the left panel"
  const sectionMatch = message.match(
    /(?:add\s+a?\s*section\s+(?:called\s+)?|show\s+|left\s+panel[:\-]?\s+)([A-Za-z][A-Za-z0-9 ]{1,40}?)(?:\s+(?:with|section|for|in|,)|$)/i
  );
  if (sectionMatch) {
    const secName = sectionMatch[1].trim();
    const existing = currentConfig.customSections.find((s) => s.name.toLowerCase() === secName.toLowerCase());
    if (!existing) {
      // Detect API URL in message
      const apiUrlInMessage = message.match(/https?:\/\/[^\s"']+/i)?.[0] ?? "";
      const newSection: SalesCustomSection = {
        id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name: secName.charAt(0).toUpperCase() + secName.slice(1),
        icon: guessSectionIcon(secName),
        enabled: true,
        apiUrl: apiUrlInMessage,
        apiAuthType: "none",
        apiAuthValue: "",
        fields: [],
        campaignIds: targetCampaignId ? [targetCampaignId] : [],
      };
      updates.customSections = [...currentConfig.customSections, newSection];
      fieldsUpdated.push("customSections");
      navigateTo = "customer-360";
    }
  }

  // ── ⑨ Opening context fields ──────────────────────────────────────────────

  // "for Fresh Lead, show customer name, language, and product interest"
  if (targetCampaignId && (lower.includes("show") || lower.includes("enable") || lower.includes("display"))) {
    const ctx = currentConfig.openingContext[targetCampaignId] ?? defaultOpeningContext();
    const prebuiltKeys = PREBUILT_CONTEXT_FIELDS.map((f) => f.key);
    let ctxChanged = false;
    const updatedFields = ctx.fields.map((f) => {
      if (!f.isCustom && prebuiltKeys.includes(f.key)) {
        const lowerLabel = f.label.toLowerCase();
        if (lower.includes(lowerLabel) || lower.includes(f.key.replace(/_/g, " "))) {
          if (!f.enabled) { ctxChanged = true; return { ...f, enabled: true }; }
        }
      }
      return f;
    });
    if (ctxChanged) {
      updates.openingContext = { ...currentConfig.openingContext, [targetCampaignId]: { ...ctx, fields: updatedFields } };
      fieldsUpdated.push("openingContext");
      navigateTo = "call-context";
    }
  }

  // ── ⑩ Power Tools ────────────────────────────────────────────────────────

  // "add power tool: Quote Portal → https://…" | "add tool: X → https://…"
  const toolMatches = [
    ...message.matchAll(/(?:tool|tools?)\s*[:\-]?\s*([A-Za-z][A-Za-z0-9 ]{1,40}?)\s*(?:→|->|at|opens?\s+at|url\s*[:=])?\s*(https?:\/\/[^\s,;]+)/gi),
  ];
  if (toolMatches.length > 0) {
    const newTools: PowerTool[] = [];
    for (const m of toolMatches) {
      const name = m[1].trim();
      const url = m[2].trim();
      if (!currentConfig.powerTools.find((t) => t.name.toLowerCase() === name.toLowerCase())) {
        newTools.push({
          id: `tool-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          name,
          icon: "Globe",
          url,
          description: "",
        });
      }
    }
    if (newTools.length > 0) {
      updates.powerTools = [...currentConfig.powerTools, ...newTools];
      fieldsUpdated.push("powerTools");
      navigateTo = "power-tools";
    }
  }

  // ── ⑪ Dispositions ───────────────────────────────────────────────────────

  const dispositionMatch = message.match(
    /(?:add\s+disposition[s]?|disposition[s]?\s*[:\-])\s*(.+?)(?:\.|$)/i
  );
  if (dispositionMatch) {
    const newDisps = splitList(dispositionMatch[1]);
    if (newDisps.length > 0) {
      const merged = [...new Set([...currentConfig.dispositions, ...newDisps.map((d) => d.charAt(0).toUpperCase() + d.slice(1))])];
      updates.dispositions = merged;
      fieldsUpdated.push("dispositions");
      navigateTo = "dispositions";
    }
  }

  // ── ⑫ Lead Source — CSV ───────────────────────────────────────────────────

  if (/\b(csv|excel|spreadsheet|upload\s+a?\s*(?:lead|file|list))\b/i.test(message)) {
    const cur = currentConfig.leadSource;
    const newType = cur.type === "api" ? "both" : cur.type === "both" ? "both" : "csv";
    updates.leadSource = { ...cur, type: newType };
    fieldsUpdated.push("leadSource");
    navigateTo = "lead-source";
  }

  // ── ⑬ Lead Source — API URL ───────────────────────────────────────────────

  const apiUrlMatch = message.match(/https?:\/\/[^\s"']+/i);
  if (apiUrlMatch && !lower.includes("section") && !lower.includes("tool") && !lower.includes("portal")) {
    const cur = currentConfig.leadSource;
    if (!cur.apiUrl) {
      const newType = cur.type === "csv" ? "both" : "api";
      updates.leadSource = { ...cur, type: newType, apiUrl: apiUrlMatch[0] };
      fieldsUpdated.push("leadSource");
      navigateTo = "lead-source";
    }
  }

  // ── Build response ────────────────────────────────────────────────────────

  const unique = [...new Set(fieldsUpdated)] as (keyof SalesConfig)[];

  if (unique.length === 0) {
    return {
      updates, fieldsUpdated: unique, affectedCampaignId, navigateTo,
      response: `I couldn't extract a specific configuration from that. Try:\n\n• ${b('"Add campaigns: Fresh Lead, Renewal, Winback"')}\n• ${b('"For Renewal, set opening script to…"')}\n• ${b('"Add section: Loan Portfolio with API https://…"')}\n• ${b('"Add power tool: Quote Portal → https://…"')}\n• ${b('"Add disposition: No Budget"')}`,
    };
  }

  const labels = unique.map((k) => b(FIELD_LABELS[k] ?? String(k)));
  let suffix = " Done.";

  if (unique.includes("campaigns") && updates.campaigns) {
    const newNames = (updates.campaigns as SalesCampaign[])
      .filter((c) => !currentConfig.campaigns.find((x) => x.id === c.id))
      .map((c) => b(c.name))
      .join(", ");
    suffix = ` Created campaigns: ${newNames}. Now configure each one — select it from the campaign selector above.`;
  } else if (unique.includes("customSections")) {
    suffix = ` Section stub created — go to ${b("Customer 360")} to wire it to your API and define the fields.`;
  } else if (unique.includes("copilot") && targetCampaignName) {
    suffix = ` Updated for ${b(targetCampaignName)} campaign.`;
  } else if (unique.includes("powerTools")) {
    suffix = " Tool added — agents will see it in the right pane during calls.";
  }

  return {
    updates, fieldsUpdated: unique, affectedCampaignId, navigateTo,
    response: `Updated ${labels.join(", ")}.${suffix}`,
  };
}
