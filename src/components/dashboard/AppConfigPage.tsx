import { ArrowLeft, ChevronRight, Settings2, Users, Zap, Globe } from "lucide-react";
import type { AppItem } from "./AppsTab";

interface AppConfigPageProps {
  app: AppItem;
  onBack: () => void;
  onSave: () => void;
}

const CONFIG_SECTIONS = [
  { id: "general", icon: Settings2, title: "General Settings", description: "Configure name, branding, and basic settings." },
  { id: "team", icon: Users, title: "Team & Access", description: "Manage team members and virtual employee access." },
  { id: "automation", icon: Zap, title: "Automation Rules", description: "Set up triggers, escalation rules, and workflows." },
  { id: "integrations", icon: Globe, title: "Integrations", description: "Connect external tools, APIs, and data sources." },
];

export default function AppConfigPage({ app, onBack, onSave }: AppConfigPageProps) {
  return (
    <main className="flex flex-1 flex-col overflow-y-auto bg-[#fafafa] px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2.5">
        <button
          type="button"
          onClick={onBack}
          className="flex size-8 items-center justify-center rounded-md border border-[#e5e5e5] bg-white shadow-sm transition-colors hover:bg-[#f5f5f5]"
        >
          <ArrowLeft className="size-4 text-[#0a0a0a]" />
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-[#737373] leading-5 hover:text-[#0a0a0a] transition-colors"
        >
          Apps
        </button>
        <ChevronRight className="size-3.5 text-[#737373]" />
        <span className="text-sm text-[#0a0a0a] leading-5">{app.name}</span>
      </div>

      {/* App header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-xl bg-purple-100 text-3xl">
          {app.emoji}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#0a0a0a] tracking-tight">{app.name}</h1>
          <p className="text-sm text-[#737373] leading-5 mt-0.5">{app.description}</p>
        </div>
      </div>

      {/* Config cards */}
      <div className="grid grid-cols-2 gap-4 max-w-[640px]">
        {CONFIG_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="group flex flex-col items-start gap-3 rounded-xl border border-[#e7e7f0] bg-white p-5 text-left transition-all hover:border-purple-200 hover:shadow-md"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#f5f5f5] transition-colors group-hover:bg-purple-100">
              <s.icon className="size-4 text-[#0a0a0a] transition-colors group-hover:text-purple-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0a0a0a] leading-none mb-1">{s.title}</p>
              <p className="text-xs text-[#737373] leading-[1.4]">{s.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onSave}
          className="h-9 rounded-md bg-[#8b5cf6] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#7c3aed]"
        >
          Save configuration
        </button>
        <button
          type="button"
          onClick={onBack}
          className="h-9 rounded-md border border-[#e5e5e5] bg-white px-5 text-sm font-medium text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
        >
          Cancel
        </button>
      </div>
    </main>
  );
}
