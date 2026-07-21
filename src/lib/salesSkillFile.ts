import type { SalesConfig } from "@/types/sales";

export function isSalesSkillFileReady(config: SalesConfig): boolean {
  return (
    config.campaigns.length > 0 ||
    config.leadSource.type !== "none" ||
    config.dispositions.length > 0
  );
}

function list(label: string, items: string[]): string | null {
  const filtered = items.filter((i) => i.trim());
  if (!filtered.length) return null;
  return `- ${label}: ${filtered.join(", ")}`;
}

export function generateSalesSkillFile(config: SalesConfig, updatedAt: number | null): string {
  const parts: string[] = [];

  parts.push("# OMNI Sales — Skill File");
  parts.push(`Generated: ${updatedAt ? new Date(updatedAt).toLocaleString() : "Draft — not yet saved"}`);
  parts.push("\n---\n");

  // ── Lead Source ───────────────────────────────────────────────────────────

  const ls = config.leadSource;
  if (ls.type !== "none") {
    const typeLabels: Record<string, string> = { csv: "CSV Upload", api: "API Feed", both: "CSV Upload + API Feed" };
    parts.push("## Lead Source");
    parts.push(`- Type: ${typeLabels[ls.type] ?? ls.type}`);
    if ((ls.type === "csv" || ls.type === "both") && ls.csvFileName) {
      parts.push(`- CSV file: ${ls.csvFileName}${ls.csvUploadedAt ? ` (uploaded ${new Date(ls.csvUploadedAt).toLocaleDateString()})` : ""}`);
    }
    if ((ls.type === "api" || ls.type === "both") && ls.apiUrl) {
      parts.push(`- API URL: ${ls.apiUrl}`);
      parts.push(`- Auth type: ${ls.apiAuthType}`);
    }
  }

  // ── Campaigns ─────────────────────────────────────────────────────────────

  if (config.campaigns.length > 0) {
    parts.push("\n## Campaigns");
    config.campaigns.forEach((c) => {
      parts.push(`\n### ${c.name}`);
      if (c.description) parts.push(`- Description: ${c.description}`);

      // Opening Context per campaign
      const ctx = config.openingContext[c.id];
      if (ctx) {
        const enabledFields = ctx.fields.filter((f) => f.enabled);
        if (enabledFields.length > 0 || ctx.apiUrl) {
          parts.push(`\n#### Opening Call Context`);
          if (ctx.apiUrl) {
            parts.push(`- API: ${ctx.apiUrl} (auth: ${ctx.apiAuthType})`);
          }
          if (enabledFields.length > 0) {
            parts.push(`- Fields shown: ${enabledFields.map((f) => f.label).join(", ")}`);
          }
        }
      }

      // AI Copilot per campaign
      const cop = config.copilot[c.id];
      if (cop) {
        const hasAI = cop.openingScript || cop.objectionHandling || cop.closingScript ||
          cop.predictiveCTAs.length || cop.quickActions.length;
        if (hasAI) {
          parts.push(`\n#### AI Copilot`);
          if (cop.openingScript) parts.push(`- Opening script: ${cop.openingScript}`);
          if (cop.objectionHandling) parts.push(`- Objection handling: ${cop.objectionHandling}`);
          if (cop.closingScript) parts.push(`- Closing script: ${cop.closingScript}`);
          const ctaLine = list("Predictive CTAs", cop.predictiveCTAs);
          const qaLine = list("Quick actions", cop.quickActions);
          if (ctaLine) parts.push(ctaLine);
          if (qaLine) parts.push(qaLine);
        }
      }
    });
  }

  // ── Customer 360 ──────────────────────────────────────────────────────────

  parts.push("\n## Customer 360 — Left Panel");
  parts.push("\n### Always-on sections (managed by OMNI)");
  parts.push("- **Basic Info** — name, phone, email, tags from lead record");
  parts.push("- **Call History** — all previous calls, notes, outcomes");

  if (config.customSections.length > 0) {
    parts.push("\n### Custom sections");
    config.customSections.forEach((s) => {
      parts.push(`\n#### ${s.name}`);
      parts.push(`- Enabled: ${s.enabled ? "Yes" : "No"}`);
      if (s.campaignIds.length > 0) {
        const names = s.campaignIds
          .map((id) => config.campaigns.find((c) => c.id === id)?.name ?? id)
          .join(", ");
        parts.push(`- Visible in campaigns: ${names}`);
      } else {
        parts.push("- Visible in: All campaigns");
      }
      if (s.apiUrl) {
        parts.push(`- API URL: ${s.apiUrl} (auth: ${s.apiAuthType})`);
      } else {
        parts.push("- Data source: Not configured");
      }
      if (s.fields.length > 0) {
        parts.push("- Fields:");
        s.fields.forEach((f) => parts.push(`  - ${f.label} | ${f.type} | ${f.jsonPath || "(path not set)"}`));
      }
    });
  }

  // ── Power Tools ───────────────────────────────────────────────────────────

  if (config.powerTools.length > 0) {
    parts.push("\n## Power Tools — Right Pane");
    config.powerTools.forEach((t) => {
      parts.push(`- ${t.name}${t.description ? ` — ${t.description}` : ""}: ${t.url}`);
    });
  }

  // ── Dispositions ──────────────────────────────────────────────────────────

  if (config.dispositions.length > 0) {
    parts.push("\n## Dispositions");
    config.dispositions.forEach((d, i) => parts.push(`${i + 1}. ${d}`));
  }

  // ── Knowledge Base ────────────────────────────────────────────────────────

  if (config.knowledgeFiles.length > 0) {
    parts.push("\n## Knowledge Base");
    config.knowledgeFiles.forEach((f) => {
      parts.push(`- ${f.name} (added ${new Date(f.uploadedAt).toLocaleDateString()})`);
    });
  }

  // ── Employees ─────────────────────────────────────────────────────────────

  if (config.employees.length > 0) {
    const admins   = config.employees.filter((e) => e.role === "admin");
    const managers = config.employees.filter((e) => e.role === "manager");
    const agents   = config.employees.filter((e) => e.role === "agent");
    parts.push("\n## Team Access");
    if (admins.length)   { parts.push(`\n### Admins`);   admins.forEach((e) => parts.push(`- ${e.name} <${e.email}>`)); }
    if (managers.length) { parts.push(`\n### Managers`); managers.forEach((e) => parts.push(`- ${e.name} <${e.email}>${e.team ? ` — ${e.team}` : ""}`)); }
    if (agents.length)   { parts.push(`\n### Agents`);   agents.forEach((e) => parts.push(`- ${e.name} <${e.email}>${e.team ? ` — ${e.team}` : ""}`)); }
  }

  return parts.join("\n");
}
