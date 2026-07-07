import { useState, useRef, useEffect } from "react";
import { Plus, MoreHorizontal, Trash2, Pencil, X, Check, Bot, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Shared member catalogue ──────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  type: "human" | "virtual";
  role?: string;
}

const HUMAN_CATALOGUE: TeamMember[] = [
  { id: "he-1", name: "Rajesh Kumar", type: "human", role: "Admin" },
  { id: "he-2", name: "Priya Sharma", type: "human", role: "Member" },
  { id: "he-3", name: "Arjun Mehta", type: "human", role: "Member" },
  { id: "he-4", name: "Divya Patel", type: "human", role: "Member" },
  { id: "he-5", name: "Ravi Iyer", type: "human", role: "Member" },
];

const VIRTUAL_CATALOGUE: TeamMember[] = [
  { id: "ve-3", name: "Chat Bot Configurator", type: "virtual" },
  { id: "ve-4", name: "Operations Manager", type: "virtual" },
  { id: "ve-6", name: "Acko Triage & Resolve (ATR)", type: "virtual" },
  { id: "ve-7", name: "Content Manager", type: "virtual" },
  { id: "ve-9", name: "Health Claim Concierge", type: "virtual" },
  { id: "ve-10", name: "Software Developer", type: "virtual" },
  { id: "ve-11", name: "ACKO Content Creator", type: "virtual" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
}

const SEED_TEAMS: Team[] = [
  {
    id: "t-1",
    name: "Content Team",
    description: "Handles content creation and media publishing",
    members: [
      HUMAN_CATALOGUE[0],
      VIRTUAL_CATALOGUE.find((v) => v.id === "ve-7")!,
      VIRTUAL_CATALOGUE.find((v) => v.id === "ve-11")!,
    ],
  },
  {
    id: "t-2",
    name: "Support Team",
    description: "Customer support and escalation management",
    members: [
      HUMAN_CATALOGUE[1],
      HUMAN_CATALOGUE[2],
      VIRTUAL_CATALOGUE.find((v) => v.id === "ve-6")!,
    ],
  },
  {
    id: "t-3",
    name: "Ops Team",
    description: "Internal operations and task management",
    members: [
      HUMAN_CATALOGUE[3],
      VIRTUAL_CATALOGUE.find((v) => v.id === "ve-4")!,
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLOURS = [
  "bg-[#e8e4f3] text-[#5b4b8a]",
  "bg-[#e0f2fe] text-[#0369a1]",
  "bg-[#fef3c7] text-[#92400e]",
  "bg-[#dcfce7] text-[#166534]",
  "bg-[#fce7f3] text-[#9d174d]",
];

function MemberAvatar({ member, idx }: { member: TeamMember; idx: number }) {
  if (member.type === "virtual") {
    return (
      <div
        title={member.name}
        className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#f0f0f0]"
      >
        <Bot className="size-3.5 text-[#737373]" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <div
      title={member.name}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold",
        AVATAR_COLOURS[idx % AVATAR_COLOURS.length]
      )}
    >
      {initials(member.name)}
    </div>
  );
}

// ─── Row 3-dot menu ───────────────────────────────────────────────────────────

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className={cn(
          "flex size-7 items-center justify-center rounded-md text-[#a0a0a0] transition-colors hover:bg-[#f0f0f0] hover:text-[#0a0a0a]",
          open && "bg-[#f0f0f0] text-[#0a0a0a]"
        )}
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-[148px] overflow-hidden rounded-lg border border-[#e7e7f0] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
          >
            <Pencil className="size-4 shrink-0 text-[#737373]" strokeWidth={1.5} />
            Edit team
          </button>
          <div className="mx-3 h-px bg-[#f0f0f0]" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="size-4 shrink-0" strokeWidth={1.5} />
            Delete team
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Create / Edit modal ──────────────────────────────────────────────────────

interface TeamForm {
  name: string;
  description: string;
  members: TeamMember[];
}

function MemberPickerSection({
  title,
  catalogue,
  selected,
  onToggle,
}: {
  title: string;
  catalogue: TeamMember[];
  selected: TeamMember[];
  onToggle: (m: TeamMember) => void;
}) {
  const selectedIds = new Set(selected.map((m) => m.id));
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#a0a0a0]">{title}</p>
      <div className="flex flex-col gap-1">
        {catalogue.map((m, idx) => {
          const isSelected = selectedIds.has(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onToggle(m)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                isSelected
                  ? "border-purple-300 bg-purple-50"
                  : "border-[#f0f0f0] bg-white hover:bg-[#fafafa]"
              )}
            >
              {m.type === "virtual" ? (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0]">
                  <Bot className="size-3.5 text-[#737373]" strokeWidth={1.5} />
                </div>
              ) : (
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                    AVATAR_COLOURS[idx % AVATAR_COLOURS.length]
                  )}
                >
                  {initials(m.name)}
                </div>
              )}
              <span className={cn("flex-1 text-[13px]", isSelected ? "font-medium text-purple-700" : "text-[#0a0a0a]")}>
                {m.name}
              </span>
              {m.role && (
                <span className="text-[11px] text-[#a0a0a0]">{m.role}</span>
              )}
              {isSelected && <Check className="size-4 shrink-0 text-purple-600" strokeWidth={2.5} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TeamModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Team | null;
  onSave: (form: TeamForm) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<TeamForm>(
    initial
      ? { name: initial.name, description: initial.description, members: [...initial.members] }
      : { name: "", description: "", members: [] }
  );

  const isEdit = !!initial;
  const canSave = form.name.trim() && form.members.length > 0;

  function toggleMember(m: TeamMember) {
    setForm((prev) => ({
      ...prev,
      members: prev.members.some((x) => x.id === m.id)
        ? prev.members.filter((x) => x.id !== m.id)
        : [...prev.members, m],
    }));
  }

  const humanCount = form.members.filter((m) => m.type === "human").length;
  const virtualCount = form.members.filter((m) => m.type === "virtual").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-[560px] max-h-[85vh] flex-col rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#f0f0f0] px-6 py-5">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0a0a0a]">
              {isEdit ? "Edit team" : "Create team"}
            </h2>
            <p className="mt-0.5 text-[13px] text-[#737373]">
              Mix human employees and virtual agents in the same team.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#a0a0a0] transition-colors hover:bg-[#f5f5f5]"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#737373]">
                Team name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Content Team"
                className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-[14px] text-[#0a0a0a] outline-none placeholder:text-[#c0c0c0] focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#737373]">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="What does this team do?"
                className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-[14px] text-[#0a0a0a] outline-none placeholder:text-[#c0c0c0] focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors"
              />
            </div>

            {/* Members */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[#737373]">
                  Members <span className="text-red-500">*</span>
                </label>
                {form.members.length > 0 && (
                  <span className="text-[12px] text-[#737373]">
                    {humanCount} human · {virtualCount} virtual
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-4 rounded-xl border border-[#e5e5e5] p-4">
                <MemberPickerSection
                  title="Human employees"
                  catalogue={HUMAN_CATALOGUE}
                  selected={form.members}
                  onToggle={toggleMember}
                />
                <div className="h-px bg-[#f0f0f0]" />
                <MemberPickerSection
                  title="Virtual agents"
                  catalogue={VIRTUAL_CATALOGUE}
                  selected={form.members}
                  onToggle={toggleMember}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 gap-2.5 border-t border-[#f0f0f0] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#e5e5e5] bg-white py-2.5 text-[14px] font-medium text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onSave(form)}
            className="flex-1 rounded-lg bg-purple-600 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEdit ? "Save changes" : "Create team"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Team card ────────────────────────────────────────────────────────────────

function TeamCard({
  team,
  onEdit,
  onDelete,
}: {
  team: Team;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const humanMembers = team.members.filter((m) => m.type === "human");
  const virtualMembers = team.members.filter((m) => m.type === "virtual");
  const MAX_AVATARS = 5;
  const shown = team.members.slice(0, MAX_AVATARS);
  const overflow = team.members.length - MAX_AVATARS;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#e7e7f0] bg-white p-5 transition-shadow hover:shadow-sm">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
            <Users className="size-5 text-purple-600" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-[#0a0a0a]">{team.name}</p>
            {team.description && (
              <p className="mt-0.5 truncate text-[12px] text-[#737373]">{team.description}</p>
            )}
          </div>
        </div>
        <RowMenu onEdit={onEdit} onDelete={onDelete} />
      </div>

      {/* Member avatars */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {shown.map((m, i) => (
            <MemberAvatar key={m.id} member={m} idx={i} />
          ))}
          {overflow > 0 && (
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#f0f0f0] text-[10px] font-semibold text-[#737373]">
              +{overflow}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-[12px] text-[#a0a0a0]">
          {humanMembers.length > 0 && (
            <span className="flex items-center gap-1">
              <User className="size-3.5" strokeWidth={1.5} />
              {humanMembers.length} human
            </span>
          )}
          {virtualMembers.length > 0 && (
            <span className="flex items-center gap-1">
              <Bot className="size-3.5" strokeWidth={1.5} />
              {virtualMembers.length} virtual
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(SEED_TEAMS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Team | null>(null);

  function handleSave(form: TeamForm) {
    if (editTarget) {
      setTeams((prev) => prev.map((t) => (t.id === editTarget.id ? { ...t, ...form } : t)));
    } else {
      setTeams((prev) => [...prev, { id: `t-${Date.now()}`, ...form }]);
    }
    setModalOpen(false);
    setEditTarget(null);
  }

  function handleEdit(team: Team) {
    setEditTarget(team);
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    setTeams((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <>
      <main className="flex flex-1 flex-col overflow-hidden bg-[#fafafa]">
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-[900px]">

            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-semibold text-[#0a0a0a]">Teams</h1>
                <p className="mt-1 text-[14px] text-[#737373]">
                  Group human employees and virtual agents into collaborative teams
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setEditTarget(null); setModalOpen(true); }}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#262626]"
              >
                <Plus className="size-4 shrink-0" strokeWidth={2} />
                Create team
              </button>
            </div>

            {/* Count */}
            <p className="mb-4 text-[13px] text-[#737373]">
              {teams.length} team{teams.length !== 1 ? "s" : ""}
            </p>

            {teams.length === 0 ? (
              <div className="rounded-xl border border-[#e7e7f0] bg-white px-4 py-16 text-center">
                <Users className="mx-auto mb-3 size-8 text-[#d4d4d4]" strokeWidth={1.5} />
                <p className="text-[14px] text-[#a0a0a0]">No teams yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    onEdit={() => handleEdit(team)}
                    onDelete={() => handleDelete(team.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {modalOpen && (
        <TeamModal
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
        />
      )}
    </>
  );
}
