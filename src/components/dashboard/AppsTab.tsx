import { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal, Settings, Trash2, Check,
  Headphones, TrendingUp, Video, BarChart2, AlertTriangle, Cog,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppItem {
  id: string;
  name: string;
  description: string;
}

type AppType = "single" | "folder";

const APP_TYPE: Record<string, AppType> = {
  support: "single",
  presales: "single",
  media: "folder",
  insights: "single",
  escalation: "single",
  "marketing-os": "single",
};

// All apps use a Lucide icon for pixel-perfect size consistency
const APP_ICON_INFO: Record<string, { Icon: LucideIcon; iconColor: string; bg: string }> = {
  support:       { Icon: Headphones,    iconColor: "#3b82f6", bg: "#eff6ff" },
  presales:      { Icon: TrendingUp,    iconColor: "#ea580c", bg: "#fff7ed" },
  media:         { Icon: Video,         iconColor: "#d946a8", bg: "#fdf2f8" },
  insights:      { Icon: BarChart2,     iconColor: "#8b5cf6", bg: "#faf5ff" },
  escalation:    { Icon: AlertTriangle, iconColor: "#f59e0b", bg: "#fffbeb" },
  "marketing-os":{ Icon: Cog,           iconColor: "#64748b", bg: "#f8fafc" },
};

export const ALL_APPS: AppItem[] = [
  { id: "support", name: "Support", description: "AI-powered customer support & sales ops" },
  { id: "presales", name: "Sales", description: "Automate and accelerate sales workflows" },
  { id: "media", name: "Media", description: "SEO, Linkedin, WhatsApp and more" },
  { id: "insights", name: "Insights", description: "Data-driven business intelligence" },
  { id: "escalation", name: "Escalation", description: "Smart escalation & issue management" },
  { id: "marketing-os", name: "Service OS", description: "Full-stack service operations platform" },
];

interface AppsTabProps {
  myApps: AppItem[];
  onAppClick: (app: AppItem) => void;
  onConfigureApp: (app: AppItem) => void;
  onDeleteApp: (appId: string) => void;
  isSuperAdmin?: boolean;
}

export default function AppsTab({
  myApps,
  onAppClick,
  onConfigureApp,
  onDeleteApp,
  isSuperAdmin = false,
}: AppsTabProps) {
  const myAppIds = new Set(myApps.map((a) => a.id));
  const configuredMediaCount = myApps.filter((a) => a.id.startsWith("media-")).length;

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 20,
      }}
    >
      {ALL_APPS.map((app) => {
        const appType = APP_TYPE[app.id] ?? "single";
        const isConfigured =
          appType === "folder" ? configuredMediaCount > 0 : myAppIds.has(app.id);

        return (
          <AppCard
            key={app.id}
            app={app}
            appType={appType}
            isConfigured={isConfigured}
            configuredCount={appType === "folder" ? configuredMediaCount : 0}
            isSuperAdmin={isSuperAdmin}
            onOpen={() => onAppClick(app)}
            onConfigure={() => onConfigureApp(app)}
            onReset={() => onDeleteApp(app.id)}
          />
        );
      })}
    </div>
  );
}

function AppCard({
  app,
  appType,
  isConfigured,
  configuredCount,
  isSuperAdmin,
  onOpen,
  onConfigure,
  onReset,
}: {
  app: AppItem;
  appType: AppType;
  isConfigured: boolean;
  configuredCount: number;
  isSuperAdmin: boolean;
  onOpen: () => void;
  onConfigure: () => void;
  onReset: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const iconInfo = APP_ICON_INFO[app.id];

  const showMenu = isSuperAdmin && appType === "single" && isConfigured;

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  return (
    <div
      className="relative flex flex-col overflow-visible bg-white transition-shadow hover:shadow-md"
      style={{
        border: "1px solid #e7e7f0",
        borderRadius: 12,
        padding: "20px 16px",
        gap: 12,
      }}
    >
      {/* 3-dot kebab — absolutely positioned so it never narrows the text column */}
      {showMenu && (
        <div ref={menuRef} className="absolute z-10" style={{ top: 20, right: 16 }}>
          <button
            type="button"
            aria-label="App options"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className={cn(
              "flex size-6 items-center justify-center rounded-md text-[#737373] transition-colors",
              menuOpen ? "bg-[#f0f0f0]" : "hover:bg-[#f0f0f0]"
            )}
          >
            <MoreHorizontal className="size-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-[160px] overflow-hidden rounded-lg border border-[#e7e7f0] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onConfigure();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
                >
                  <Settings className="size-4 shrink-0 text-[#737373]" strokeWidth={1.5} />
                  Configure
                </button>
                <div className="mx-3 h-px bg-[#e7e7f0]" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onReset();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[#e11d48] transition-colors hover:bg-[#fff1f2]"
                >
                  <Trash2 className="size-4 shrink-0" strokeWidth={1.5} />
                  Delete &amp; Reset app
                </button>
              </div>
            )}
          </div>
        )}

      {/* Header row: badge + text (no 3-dot here — keeps full width for description) */}
      <div className="flex items-start" style={{ gap: 16 }}>
        {/* Icon badge */}
        <div
          className="flex shrink-0 items-center justify-center overflow-hidden"
          style={{ width: 48, height: 48, borderRadius: 14.77, background: iconInfo?.bg ?? "#f5f5f5" }}
        >
          {iconInfo && (
            <iconInfo.Icon
              style={{ width: 25.85, height: 25.85, color: iconInfo.iconColor }}
              strokeWidth={1.75}
            />
          )}
        </div>

        {/* Title + description — flex-1 gives full width, always 16px from card right */}
        <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 8 }}>
          <p
            className="truncate"
            style={{ fontSize: 16, fontWeight: 600, lineHeight: 1, color: "#36354c", paddingRight: showMenu ? 28 : 0 }}
          >
            {app.name}
          </p>
          <p
            className="line-clamp-2"
            style={{ fontSize: 14, fontWeight: 400, lineHeight: "1.4", color: "#5b5675" }}
          >
            {app.description}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#e7e7f0" }} />

      {/* Action row */}
      {appType === "folder" ? (
        // Folder type: status (if any configured) + View button
        <div className="flex items-center justify-between">
          {isConfigured ? (
            <div className="flex items-center" style={{ gap: 4 }}>
              <Check className="shrink-0 text-[#0fa457]" style={{ width: 18, height: 18 }} strokeWidth={2} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#0fa457", lineHeight: "1.4" }}>
                {configuredCount} {configuredCount === 1 ? "app" : "apps"} configured
              </span>
            </div>
          ) : (
            <span />
          )}
          <SecondaryButton label="View" onClick={onOpen} />
        </div>
      ) : isConfigured ? (
        // Single-type configured: primary Open button (right-aligned)
        <div className="flex justify-end">
          <PrimaryButton label="Open" onClick={onOpen} />
        </div>
      ) : (
        // Single-type not configured: secondary Configure button (right-aligned), no 3-dot
        <div className="flex justify-end">
          <SecondaryButton label="Configure" onClick={onConfigure} />
        </div>
      )}
    </div>
  );
}

function PrimaryButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center justify-center transition-opacity hover:opacity-90"
      style={{
        height: 32,
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 9999,
        border: "1px solid #8e7cf4",
        background: "#6841e6",
        color: "white",
        fontSize: 12,
        fontWeight: 500,
        lineHeight: "16px",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function SecondaryButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center justify-center transition-colors hover:bg-purple-50"
      style={{
        height: 32,
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 9999,
        border: "1px solid #6841e6",
        background: "white",
        color: "#6841e6",
        fontSize: 12,
        fontWeight: 500,
        lineHeight: "16px",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

