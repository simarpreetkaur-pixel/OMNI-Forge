import { useState, useRef, useEffect } from "react";
import {
  Plus, MoreHorizontal, Trash2, Pencil, X, Check, Search, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types & seed data ────────────────────────────────────────────────────────

const ALL_APPS = ["Support", "Sales", "Media", "Insights", "Escalation", "Service OS"];

export interface HumanEmployee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: "Member" | "Admin";
  appAccess: string[];
}

const SEED: HumanEmployee[] = [
  {
    id: "he-1",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@acko.tech",
    employeeId: "EMP001",
    role: "Admin",
    appAccess: ["Support", "Media", "Insights"],
  },
  {
    id: "he-2",
    name: "Priya Sharma",
    email: "priya.sharma@acko.tech",
    employeeId: "EMP002",
    role: "Member",
    appAccess: ["Support", "Sales"],
  },
  {
    id: "he-3",
    name: "Arjun Mehta",
    email: "arjun.mehta@acko.tech",
    employeeId: "EMP003",
    role: "Member",
    appAccess: ["Media", "Service OS"],
  },
  {
    id: "he-4",
    name: "Divya Patel",
    email: "divya.patel@acko.tech",
    employeeId: "EMP004",
    role: "Member",
    appAccess: ["Support"],
  },
  {
    id: "he-5",
    name: "Ravi Iyer",
    email: "ravi.iyer@acko.tech",
    employeeId: "EMP005",
    role: "Member",
    appAccess: ["Insights", "Escalation"],
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

// ─── Row 3-dot menu ───────────────────────────────────────────────────────────

function RowMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
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
            Edit
          </button>
          <div className="mx-3 h-px bg-[#f0f0f0]" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="size-4 shrink-0" strokeWidth={1.5} />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

// ─── App access pills ─────────────────────────────────────────────────────────

function AppPills({ apps }: { apps: string[] }) {
  const show = apps.slice(0, 3);
  const rest = apps.length - show.length;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {show.map((a) => (
        <span
          key={a}
          className="rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700"
        >
          {a}
        </span>
      ))}
      {rest > 0 && (
        <span className="rounded-full bg-[#f0f0f0] px-2 py-0.5 text-[11px] font-medium text-[#737373]">
          +{rest} more
        </span>
      )}
    </div>
  );
}

// ─── Add / Edit modal ─────────────────────────────────────────────────────────

interface EmployeeForm {
  name: string;
  email: string;
  employeeId: string;
  role: "Member" | "Admin";
  appAccess: string[];
}

const EMPTY_FORM: EmployeeForm = {
  name: "",
  email: "",
  employeeId: "",
  role: "Member",
  appAccess: [],
};

function EmployeeModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: HumanEmployee | null;
  onSave: (form: EmployeeForm) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<EmployeeForm>(
    initial
      ? {
          name: initial.name,
          email: initial.email,
          employeeId: initial.employeeId,
          role: initial.role,
          appAccess: [...initial.appAccess],
        }
      : EMPTY_FORM
  );

  const isEdit = !!initial;
  const canSave = form.name.trim() && form.email.trim() && form.employeeId.trim();

  function toggle(app: string) {
    setForm((prev) => ({
      ...prev,
      appAccess: prev.appAccess.includes(app)
        ? prev.appAccess.filter((a) => a !== app)
        : [...prev.appAccess, app],
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-2xl">

        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0a0a0a]">
              {isEdit ? "Edit employee" : "Add human employee"}
            </h2>
            <p className="mt-0.5 text-[13px] text-[#737373]">
              {isEdit ? "Update this employee's details and access." : "Invite a new team member and configure their access."}
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

        <div className="flex flex-col gap-4">
          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-[#737373]">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Rajesh Kumar"
              className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-[14px] text-[#0a0a0a] outline-none placeholder:text-[#c0c0c0] focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors"
            />
          </div>

          {/* Email + Employee ID side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#737373]">
                Email ID <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="name@acko.tech"
                className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-[14px] text-[#0a0a0a] outline-none placeholder:text-[#c0c0c0] focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#737373]">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.employeeId}
                onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
                placeholder="e.g. EMP006"
                className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-[14px] text-[#0a0a0a] outline-none placeholder:text-[#c0c0c0] focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors"
              />
            </div>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-[#737373]">Role</label>
            <div className="flex gap-2">
              {(["Member", "Admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, role: r }))}
                  className={cn(
                    "flex-1 rounded-lg border py-2 text-[13px] font-medium transition-colors",
                    form.role === r
                      ? "border-purple-400 bg-purple-50 text-purple-700"
                      : "border-[#e5e5e5] bg-white text-[#737373] hover:bg-[#f5f5f5]"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* App access */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-[#737373]">
              App access
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ALL_APPS.map((app) => {
                const selected = form.appAccess.includes(app);
                return (
                  <button
                    key={app}
                    type="button"
                    onClick={() => toggle(app)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors",
                      selected
                        ? "border-purple-400 bg-purple-50 text-purple-700"
                        : "border-[#e5e5e5] bg-white text-[#737373] hover:bg-[#f5f5f5]"
                    )}
                  >
                    {app}
                    {selected && <Check className="size-3.5 shrink-0 text-purple-600" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-2.5">
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
            {isEdit ? "Save changes" : "Add employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HumanEmployeesPage() {
  const [employees, setEmployees] = useState<HumanEmployee[]>(SEED);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<HumanEmployee | null>(null);
  const [search, setSearch] = useState("");

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  function handleSave(form: EmployeeForm) {
    if (editTarget) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === editTarget.id ? { ...e, ...form } : e))
      );
    } else {
      const newEmp: HumanEmployee = {
        id: `he-${Date.now()}`,
        ...form,
      };
      setEmployees((prev) => [...prev, newEmp]);
    }
    setModalOpen(false);
    setEditTarget(null);
  }

  function handleEdit(emp: HumanEmployee) {
    setEditTarget(emp);
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }

  function openAdd() {
    setEditTarget(null);
    setModalOpen(true);
  }

  return (
    <>
      <main className="flex flex-1 flex-col overflow-hidden bg-[#fafafa]">
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-[900px]">

            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-semibold text-[#0a0a0a]">Human Employees</h1>
                <p className="mt-1 text-[14px] text-[#737373]">
                  Manage team members and their app access permissions
                </p>
              </div>
              <button
                type="button"
                onClick={openAdd}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#262626]"
              >
                <Plus className="size-4 shrink-0" strokeWidth={2} />
                Add employee
              </button>
            </div>

            {/* Search + count */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#a0a0a0]" strokeWidth={1.5} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email or ID…"
                  className="w-full rounded-lg border border-[#e5e5e5] bg-white py-2 pl-9 pr-3 text-[13px] text-[#0a0a0a] outline-none placeholder:text-[#a0a0a0] focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors"
                />
              </div>
              <span className="text-[13px] text-[#737373]">
                {filtered.length} employee{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-[#e7e7f0] bg-white">
              {/* Table head */}
              <div className="grid grid-cols-[2fr_2fr_1fr_2fr_auto] items-center gap-4 border-b border-[#f0f0f0] bg-[#fafafa] px-5 py-3">
                {["Name", "Email ID", "Employee ID", "App access", ""].map((h) => (
                  <span key={h} className="text-[11px] font-semibold uppercase tracking-wider text-[#a0a0a0]">
                    {h}
                  </span>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="px-5 py-12 text-center text-[13px] text-[#a0a0a0]">
                  {search ? "No employees match your search." : "No employees yet. Add one to get started."}
                </div>
              ) : (
                filtered.map((emp, idx) => (
                  <div
                    key={emp.id}
                    className={cn(
                      "grid grid-cols-[2fr_2fr_1fr_2fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-[#fafafa]",
                      idx < filtered.length - 1 && "border-b border-[#f0f0f0]"
                    )}
                  >
                    {/* Name + avatar */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                          AVATAR_COLOURS[idx % AVATAR_COLOURS.length]
                        )}
                      >
                        {initials(emp.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-medium text-[#0a0a0a]">{emp.name}</p>
                        <span
                          className={cn(
                            "mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none",
                            emp.role === "Admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-[#f0f0f0] text-[#737373]"
                          )}
                        >
                          {emp.role}
                        </span>
                      </div>
                    </div>

                    {/* Email */}
                    <p className="truncate text-[13px] text-[#737373]">{emp.email}</p>

                    {/* Employee ID */}
                    <p className="text-[13px] font-medium text-[#0a0a0a]">{emp.employeeId}</p>

                    {/* App access */}
                    <AppPills apps={emp.appAccess} />

                    {/* Menu */}
                    <RowMenu onEdit={() => handleEdit(emp)} onDelete={() => handleDelete(emp.id)} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {modalOpen && (
        <EmployeeModal
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
        />
      )}
    </>
  );
}
