import { useState, useRef, useEffect } from "react";
import { Plus, MoreHorizontal, Settings, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MiniApp {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

interface MiniAppsTabProps {
  myMiniApps: MiniApp[];
  onCreate: () => void;
  onDeleteMiniApp: (miniAppId: string) => void;
  isSuperAdmin?: boolean;
}

export default function MiniAppsTab({ myMiniApps, onCreate, onDeleteMiniApp, isSuperAdmin = false }: MiniAppsTabProps) {
  return (
    <div className="flex flex-col animate-fade-in" style={{ gap: 24 }}>

      {/* My mini apps */}
      {myMiniApps.length > 0 && (
        <section className="flex flex-col" style={{ gap: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1, color: "#000" }}>My mini apps</p>
          <div className="flex flex-wrap" style={{ gap: 20 }}>
            {myMiniApps.map((app) => (
              <MiniAppCard
                key={app.id}
                app={app}
                isSuperAdmin={isSuperAdmin}
                onDelete={() => onDeleteMiniApp(app.id)}
              />
            ))}
            <CreateCard onClick={onCreate} />
          </div>
        </section>
      )}

      {/* Empty state */}
      {myMiniApps.length === 0 && (
        <div className="flex" style={{ gap: 20 }}>
          <CreateCard onClick={onCreate} />
        </div>
      )}
    </div>
  );
}

function MiniAppCard({
  app,
  isSuperAdmin,
  onDelete,
}: {
  app: MiniApp;
  isSuperAdmin: boolean;
  onDelete: () => void;
}) {
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
        gap: 8,
        flexShrink: 0,
      }}
    >
      {/* 3-dot menu — super admins only */}
      {isSuperAdmin && (
        <div ref={menuRef} className="absolute top-2.5 right-2.5 z-10">
          <button
            type="button"
            aria-label="Mini app options"
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

      <span style={{ fontSize: 28 }}>{app.emoji}</span>
      <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1, color: "#000", whiteSpace: "nowrap" }}>
        {app.name}
      </p>
    </div>
  );
}

function CreateCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center overflow-hidden bg-white transition-all hover:border-purple-400 hover:bg-purple-50"
      style={{
        width: 302,
        height: 160,
        border: "1px dashed #d4d4d4",
        borderRadius: 12,
        padding: 16,
        gap: 6,
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <Plus style={{ width: 20, height: 20, color: "#000" }} />
      <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1, color: "#000", whiteSpace: "nowrap" }}>
        Create mini app
      </p>
    </button>
  );
}
