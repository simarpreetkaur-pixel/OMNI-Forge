import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Trash2, Settings, Search, Instagram, Linkedin, Twitter, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppItem {
  id: string;
  name: string;
  description: string;
}

// Badge images for primary app cards
const APP_BADGES: Record<string, string> = {
  support: "/badge-support.png",
  presales: "/badge-sales.png",
  media: "/badge-media.png",
  insights: "/badge-insights.png",
  escalation: "/badge-escalation.png",
  "marketing-os": "/badge-service-os.png",
};

// Lucide icons for channel-level apps (media-seo etc.)
const APP_ICONS: Record<string, LucideIcon> = {
  "media-seo": Search,
  "media-instagram": Instagram,
  "media-linkedin": Linkedin,
  "media-x": Twitter,
};

export const ALL_APPS: AppItem[] = [
  { id: "support", name: "Support", description: "AI-powered customer support & sales ops" },
  { id: "presales", name: "Sales", description: "Automate and accelerate sales workflows" },
  { id: "media", name: "Media", description: "Content creation and media automation" },
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

export default function AppsTab({ myApps, onAppClick, onConfigureApp, onDeleteApp, isSuperAdmin = false }: AppsTabProps) {
  const myAppIds = new Set(myApps.map((a) => a.id));
  const availableApps = ALL_APPS.filter((a) => !myAppIds.has(a.id));
  const rows = chunk(availableApps, 3);

  return (
    <div className="flex flex-col animate-fade-in" style={{ gap: 24 }}>

      {/* My apps */}
      {myApps.length > 0 && (
        <section className="flex flex-col" style={{ gap: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1, color: "#000" }}>My apps</p>
          <div className="flex flex-wrap" style={{ gap: 20 }}>
            {myApps.map((app) => (
              <MyAppCard
                key={app.id}
                app={app}
                isSuperAdmin={isSuperAdmin}
                onClick={() => onAppClick(app)}
                onConfigure={() => onConfigureApp(app)}
                onDelete={() => onDeleteApp(app.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Create another app */}
      {availableApps.length > 0 && (
        <section className="flex flex-col" style={{ gap: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1, color: "#000" }}>Create another app</p>
          <div className="flex flex-col" style={{ gap: 24 }}>
            {rows.map((row, ri) => (
              <div key={ri} className="flex" style={{ gap: 20 }}>
                {row.map((app) => (
                  <AppCard key={app.id} app={app} onClick={() => onAppClick(app)} />
                ))}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MyAppCard({
  app,
  isSuperAdmin,
  onClick,
  onConfigure,
  onDelete,
}: {
  app: AppItem;
  isSuperAdmin: boolean;
  onClick: () => void;
  onConfigure: () => void;
  onDelete: () => void;
}) {
  const badge = APP_BADGES[app.id];
  const Icon = APP_ICONS[app.id];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      className="relative flex flex-col items-center justify-center overflow-visible bg-white transition-shadow hover:shadow-md group"
      style={{
        width: 302,
        height: 160,
        border: "1px solid #e7e7f0",
        borderRadius: 12,
        padding: 16,
        gap: 10,
        flexShrink: 0,
      }}
    >
      {/* 3-dot menu button — super admins only */}
      {isSuperAdmin && (
      <div ref={menuRef} className="absolute top-2.5 right-2.5 z-10">
        <button
          type="button"
          aria-label="App options"
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          className={cn(
            "flex size-6 items-center justify-center rounded-md text-[#737373] transition-colors",
            menuOpen && "opacity-100 bg-[#f0f0f0]",
            "hover:bg-[#f0f0f0]"
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
                onDelete();
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-cerise-600 transition-colors hover:bg-cerise-50"
            >
              <Trash2 className="size-4 shrink-0" strokeWidth={1.5} />
              Delete app
            </button>
          </div>
        )}
      </div>
      )}

      {/* Card body — clickable */}
      <button
        type="button"
        onClick={onClick}
        className="flex w-full flex-1 flex-col items-center justify-center gap-2.5 outline-none"
      >
        {badge ? (
          <img src={badge} alt={app.name} className="size-10 object-contain" />
        ) : app.id.startsWith("media-") && APP_BADGES["media"] ? (
          <img src={APP_BADGES["media"]} alt={app.name} className="size-10 object-contain" />
        ) : Icon ? (
          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
            <Icon className="size-5 text-purple-600" strokeWidth={1.5} />
          </div>
        ) : null}
        <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1, color: "#000", whiteSpace: "nowrap" }}>
          {app.name}
        </p>
      </button>
    </div>
  );
}

function AppCard({ app, onClick }: { app: AppItem; onClick: () => void }) {
  const badge = APP_BADGES[app.id];
  const Icon = APP_ICONS[app.id];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center overflow-hidden bg-white transition-all hover:shadow-md hover:border-purple-200"
      style={{
        width: 302,
        height: 160,
        border: "1px solid #e7e7f0",
        borderRadius: 12,
        padding: 16,
        gap: 12,
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {badge ? (
        <img src={badge} alt={app.name} className="size-10 object-contain" />
      ) : Icon ? (
        <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
          <Icon className="size-5 text-purple-600" strokeWidth={1.5} />
        </div>
      ) : null}
      <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1, color: "#000", whiteSpace: "nowrap" }}>
        {app.name}
      </p>
    </button>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
