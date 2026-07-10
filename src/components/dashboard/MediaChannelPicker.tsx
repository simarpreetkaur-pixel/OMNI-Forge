import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft, ChevronRight, Search, Instagram, Linkedin, Twitter,
  MoreHorizontal, Settings, Trash2, Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Channel definitions ─────────────────────────────────────────────────────

interface Channel {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  bg: string;
  available: boolean;
}

const CHANNELS: Channel[] = [
  {
    id: "seo",
    label: "SEO",
    icon: Search,
    iconColor: "#8b5cf6",
    bg: "#f3e8ff",
    description: "AI-written articles optimised for search ranking",
    available: true,
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: Instagram,
    iconColor: "#ec4899",
    bg: "#fdf2f8",
    description: "Visual content & captions for Instagram",
    available: false,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    iconColor: "#0ea5e9",
    bg: "#f0f9ff",
    description: "Thought-leadership posts for LinkedIn",
    available: false,
  },
  {
    id: "x",
    label: "X",
    icon: Twitter,
    iconColor: "#64748b",
    bg: "#f8fafc",
    description: "Threads and posts for X (Twitter)",
    available: false,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface MediaChannelPickerProps {
  onBack: () => void;
  onSelectChannel: (channelId: string) => void;
  onOpenChannel: (channelId: string) => void;
  onResetChannel: (channelId: string) => void;
  configuredChannels?: string[];
  isSuperAdmin?: boolean;
}

// ─── Delete confirm modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({
  channelName,
  onCancel,
  onConfirm,
}: {
  channelName: string;
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
          Delete {channelName}?
        </p>
        <p style={{ fontSize: 14, color: "#737373", lineHeight: 1.5, margin: 0 }}>
          This will permanently remove the channel and all its configuration. This action cannot be undone.
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

// ─── Channel card ─────────────────────────────────────────────────────────────

function ChannelCard({
  channel,
  isConfigured,
  isSuperAdmin,
  onConfigure,
  onOpen,
  onReset,
}: {
  channel: Channel;
  isConfigured: boolean;
  isSuperAdmin: boolean;
  onConfigure: () => void;
  onOpen: () => void;
  onReset: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const showMenu = isSuperAdmin && isConfigured;

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

  const Icon = channel.icon;
  const iconColor = channel.available ? channel.iconColor : "#a0a0a0";
  const bg = channel.available ? channel.bg : "#f0f0f0";

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-visible bg-white transition-shadow",
        channel.available ? "hover:shadow-md" : "opacity-60"
      )}
      style={{
        border: "1px solid #e7e7f0",
        borderRadius: 12,
        padding: "20px 16px",
        gap: 12,
      }}
    >
      {/* 3-dot — absolutely positioned so it never narrows the text column */}
      {showMenu && (
        <div ref={menuRef} className="absolute z-10" style={{ top: 20, right: 16 }}>
          <button
            type="button"
            aria-label="Channel options"
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

      {confirmDelete && (
        <DeleteConfirmModal
          channelName={channel.label}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => { setConfirmDelete(false); onReset(); }}
        />
      )}

      {/* "Soon" badge for unavailable channels */}
      {!channel.available && (
        <span
          className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ background: "#f0f0f0", color: "#737373" }}
        >
          Soon
        </span>
      )}

      {/* Header: icon badge + title + description */}
      <div className="flex items-start" style={{ gap: 16 }}>
        <div
          className="flex shrink-0 items-center justify-center overflow-hidden"
          style={{ width: 48, height: 48, borderRadius: 14.77, background: bg }}
        >
          <Icon
            style={{ width: 25.85, height: 25.85, color: iconColor }}
            strokeWidth={1.75}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 8 }}>
          <p
            className="truncate"
            style={{
              fontSize: 16,
              fontWeight: 600,
              lineHeight: 1,
              color: channel.available ? "#36354c" : "#737373",
              paddingRight: showMenu ? 28 : 0,
            }}
          >
            {channel.label}
          </p>
          <p
            className="line-clamp-2"
            style={{ fontSize: 14, fontWeight: 400, lineHeight: "1.4", color: "#5b5675" }}
          >
            {channel.description}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#e7e7f0" }} />

      {/* Action row */}
      {!channel.available ? (
        // Soon — no action, keep row for consistent height
        <div className="flex justify-end" style={{ height: 32 }} />
      ) : isConfigured ? (
        // Configured — Open button (right-aligned)
        <div className="flex justify-end">
          <PrimaryButton label="Open" onClick={onOpen} />
        </div>
      ) : (
        // Available, not configured — Configure button
        <div className="flex justify-end">
          <SecondaryButton label="Configure" onClick={onConfigure} />
        </div>
      )}
    </div>
  );
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export default function MediaChannelPicker({
  onBack,
  onSelectChannel,
  onOpenChannel,
  onResetChannel,
  configuredChannels = [],
  isSuperAdmin = false,
}: MediaChannelPickerProps) {
  const configuredSet = new Set(configuredChannels);
  const configuredCount = configuredChannels.length;

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
        <span className="text-sm text-[#0a0a0a] leading-5">Media</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0a0a0a] tracking-tight leading-none mb-1.5">
            Media
          </h1>
          <p className="text-sm text-[#737373] leading-5">
            Choose a channel to create your campaign
          </p>
        </div>

        {configuredCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Check className="size-4 text-[#0fa457]" strokeWidth={2} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#0fa457" }}>
              {configuredCount} {configuredCount === 1 ? "channel" : "channels"} configured
            </span>
          </div>
        )}
      </div>

      {/* Channel cards — same grid & card style as dashboard */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
      >
        {CHANNELS.map((channel) => {
          const isConfigured = configuredSet.has(channel.id);
          return (
            <ChannelCard
              key={channel.id}
              channel={channel}
              isConfigured={isConfigured}
              isSuperAdmin={isSuperAdmin}
              onConfigure={() => onSelectChannel(channel.id)}
              onOpen={() => onOpenChannel(channel.id)}
              onReset={() => onResetChannel(channel.id)}
            />
          );
        })}
      </div>
    </main>
  );
}
