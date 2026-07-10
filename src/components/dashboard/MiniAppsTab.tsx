import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, MoreHorizontal, Settings, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MiniApp {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

// Per-app deep-link URLs opened in a new tab when "Open" is clicked
const MINI_APP_URLS: Record<string, string> = {
  "vitamin-ai": "https://vitaminai.club",
};

// Pastel badge background colors, cycled by app index
const BADGE_COLORS = [
  "#eff6ff", // blue-50
  "#faf5ff", // purple-50
  "#fff7ed", // orange-50
  "#ecfdf5", // emerald-50
  "#fdf2f8", // pink-50
  "#fffbeb", // yellow-50
];

function getBadgeColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
  }
  return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length];
}

interface MiniAppsTabProps {
  myMiniApps: MiniApp[];
  onCreate: () => void;
  onDeleteMiniApp: (miniAppId: string) => void;
  isSuperAdmin?: boolean;
}

export default function MiniAppsTab({
  myMiniApps,
  onCreate,
  onDeleteMiniApp,
  isSuperAdmin = false,
}: MiniAppsTabProps) {
  return (
    <div
      className="animate-fade-in"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 20,
      }}
    >
      {myMiniApps.map((item) => (
        <MiniAppCard
          key={item.id}
          app={item}
          isSuperAdmin={isSuperAdmin}
          onDelete={() => onDeleteMiniApp(item.id)}
        />
      ))}
      <CreateCard onClick={onCreate} />
    </div>
  );
}

function DeleteConfirmModal({
  appName,
  onCancel,
  onConfirm,
}: {
  appName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onMouseDown={(e) => { e.stopPropagation(); onCancel(); }}
    >
      <div
        className="flex flex-col bg-white"
        style={{ borderRadius: 16, padding: "28px 28px 24px", width: 380, gap: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-center"
          style={{ width: 44, height: 44, borderRadius: 12, background: "#fff1f2", marginBottom: 4 }}
        >
          <Trash2 className="size-5 text-[#e11d48]" strokeWidth={1.75} />
        </div>

        <p style={{ fontSize: 16, fontWeight: 600, color: "#0a0a0a", lineHeight: 1.3, margin: 0 }}>
          Delete {appName}?
        </p>
        <p style={{ fontSize: 14, color: "#737373", lineHeight: 1.5, margin: 0 }}>
          This will permanently remove the mini app and all its configuration. This action cannot be undone.
        </p>

        <div className="flex items-center justify-end" style={{ gap: 8, marginTop: 16 }}>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center transition-colors hover:bg-[#f5f5f5]"
            style={{ height: 36, paddingLeft: 16, paddingRight: 16, borderRadius: 8, border: "1px solid #e5e5e5", background: "white", fontSize: 14, fontWeight: 500, color: "#0a0a0a", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center justify-center transition-opacity hover:opacity-90"
            style={{ height: 36, paddingLeft: 16, paddingRight: 16, borderRadius: 8, background: "#e11d48", fontSize: 14, fontWeight: 500, color: "white", cursor: "pointer", border: "none" }}
          >
            Delete app
          </button>
        </div>
      </div>
    </div>,
    document.body
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const bgColor = getBadgeColor(app.id);

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
      {/* Header row: badge + text + 3-dot */}
      <div className="flex items-start" style={{ gap: 16 }}>
        {/* Emoji badge */}
        <div
          className="flex shrink-0 items-center justify-center overflow-hidden"
          style={{ width: 48, height: 48, borderRadius: 14.77, background: bgColor }}
        >
          <span style={{ fontSize: 22, lineHeight: 1 }}>{app.emoji}</span>
        </div>

        {/* Title + description */}
        <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 8 }}>
          <p
            className="truncate"
            style={{ fontSize: 16, fontWeight: 600, lineHeight: 1, color: "#36354c" }}
          >
            {app.name}
          </p>
          <p className="line-clamp-2" style={{ fontSize: 14, fontWeight: 400, lineHeight: "1.4", color: "#5b5675" }}>
            {app.description || "Custom mini app"}
          </p>
        </div>

        {/* 3-dot kebab — super admins only */}
        {isSuperAdmin && (
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              aria-label="Mini app options"
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
                    setConfirmDelete(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[#e11d48] transition-colors hover:bg-[#fff1f2]"
                >
                  <Trash2 className="size-4 shrink-0" strokeWidth={1.5} />
                  Delete app
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {confirmDelete && (
        <DeleteConfirmModal
          appName={app.name}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => { setConfirmDelete(false); onDelete(); }}
        />
      )}

      {/* Divider */}
      <div style={{ height: 1, background: "#e7e7f0" }} />

      {/* Action row: Open button (right-aligned) */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            const url = MINI_APP_URLS[app.id];
            if (url) window.open(url, "_blank", "noopener,noreferrer");
          }}
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
          Open
        </button>
      </div>
    </div>
  );
}

function CreateCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 bg-white transition-all hover:border-purple-400 hover:bg-purple-50"
      style={{
        border: "1.5px dashed #d4d4d4",
        borderRadius: 12,
        padding: "20px 16px",
        cursor: "pointer",
        minHeight: 130,
      }}
    >
      <div
        className="flex items-center justify-center rounded-full bg-[#f5f5f5]"
        style={{ width: 40, height: 40 }}
      >
        <Plus className="size-5 text-[#737373]" strokeWidth={1.75} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1, color: "#0a0a0a" }}>
        Create mini app
      </p>
    </button>
  );
}

