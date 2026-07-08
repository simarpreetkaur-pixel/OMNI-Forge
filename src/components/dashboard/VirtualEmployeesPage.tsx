import { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal, Trash2, Bot, ArrowLeft, Pencil, Copy, Check,
  RefreshCw, Play, Square, Zap, X, Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrg } from "@/context/OrgContext";
import type { VirtualEmployee } from "@/types/virtualEmployee";

// ─── List row ──────────────────────────────────────────────────────────────────

function EmployeeRow({
  employee,
  onClick,
  onDelete,
}: {
  employee: VirtualEmployee;
  onClick: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isConnected = employee.status.some((s) => s === "connected");

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
    <div className="flex items-center gap-4 border-b border-[#f0f0f0] px-4 py-0 last:border-b-0 hover:bg-[#fafafa] transition-colors group">
      <button
        type="button"
        onClick={onClick}
        className="flex flex-1 items-center gap-4 py-4 text-left outline-none min-w-0"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#e7e7f0] bg-white">
          <Bot className="size-5 text-[#737373]" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[#0a0a0a]">{employee.name}</span>
            <span className="rounded-full bg-[#f0f0f0] px-2 py-0.5 text-[11px] font-medium text-[#737373]">
              {employee.role}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[13px] text-[#737373]">{employee.description}</p>
        </div>
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            isConnected ? "bg-green-500" : "bg-[#d4d4d4]"
          )}
        />
      </button>

      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          aria-label="Employee options"
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          className={cn(
            "flex size-7 items-center justify-center rounded-md text-[#a0a0a0] transition-colors hover:bg-[#f0f0f0] hover:text-[#0a0a0a]",
            menuOpen && "bg-[#f0f0f0] text-[#0a0a0a]"
          )}
        >
          <MoreHorizontal className="size-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 w-[148px] overflow-hidden rounded-lg border border-[#e7e7f0] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(); }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="size-4 shrink-0" strokeWidth={1.5} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Detail view ──────────────────────────────────────────────────────────────

type DetailTab = "notifications" | "schedules" | "agents-md" | "skills" | "terminal" | "usage";
type NotifTab = "pending" | "consumed";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
      className="flex size-7 items-center justify-center rounded-md text-[#a0a0a0] transition-colors hover:bg-[#f0f0f0] hover:text-[#0a0a0a]"
      aria-label="Copy"
    >
      {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
    </button>
  );
}

function EmployeeDetail({
  employee,
  onBack,
  onUpdateDescription,
}: {
  employee: VirtualEmployee;
  onBack: () => void;
  onUpdateDescription: (desc: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("notifications");
  const [notifTab, setNotifTab] = useState<NotifTab>("pending");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(employee.description);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const isConnected = employee.status.some((s) => s === "connected");

  // Keep draft in sync when employee updates (after save)
  useEffect(() => {
    if (!editingDesc) setDescDraft(employee.description);
  }, [employee.description, editingDesc]);

  useEffect(() => {
    if (editingDesc) descRef.current?.focus();
  }, [editingDesc]);

  function handleSaveDesc() {
    const trimmed = descDraft.trim();
    if (trimmed && trimmed !== employee.description) {
      onUpdateDescription(trimmed);
    }
    setEditingDesc(false);
  }

  function handleCancelDesc() {
    setDescDraft(employee.description);
    setEditingDesc(false);
  }

  const cliCommand = `neo-cli config set-key ${employee.apiKey} --url https://api.omniackodev.com --org ${employee.orgId}`;
  const curlCommand = `curl -X POST https://api.omniackodev.com/api/neo/virtual-employees/PkT45mZDmIvVm8N6M22lD/notifications \\\n  -H "authorization: Bearer ${employee.apiKey}" \\\n  -H "x-organization-id: ${employee.orgId}HlymA1vz" \\\n  -H "content-type: application/json" \\\n  -d '{"description":"Review the latest customer escalation and decide next steps.","trigger":"manual"}'`;

  const DETAIL_TABS: { id: DetailTab; label: string }[] = [
    { id: "notifications", label: "Notifications" },
    { id: "schedules", label: "Schedules" },
    { id: "agents-md", label: "AGENTS.md" },
    { id: "skills", label: "Skills" },
    { id: "terminal", label: "Terminal" },
    { id: "usage", label: "Usage" },
  ];

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-[#fafafa]">
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-[#e7e7f0] bg-white px-8 py-3.5">
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
          className="text-sm text-[#737373] transition-colors hover:text-[#0a0a0a]"
        >
          Virtual Employees
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-[820px]">

          {/* Header */}
          <div className="mb-6 flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-[#e7e7f0] bg-white">
              <Bot className="size-7 text-[#737373]" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-[20px] font-semibold text-[#0a0a0a]">{employee.name}</h1>

                  {/* Editable description */}
                  {editingDesc ? (
                    <div className="mt-1.5">
                      <textarea
                        ref={descRef}
                        value={descDraft}
                        onChange={(e) => setDescDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveDesc(); }
                          if (e.key === "Escape") handleCancelDesc();
                        }}
                        rows={3}
                        className="w-full resize-none rounded-lg border border-purple-400 bg-white px-3 py-2 text-[14px] text-[#0a0a0a] outline-none ring-2 ring-purple-100"
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSaveDesc}
                          className="flex items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#262626]"
                        >
                          <Save className="size-3 shrink-0" strokeWidth={2} />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelDesc}
                          className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-[12px] font-medium text-[#737373] transition-colors hover:bg-[#f5f5f5]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group/desc mt-0.5 flex items-start gap-2">
                      <p className="flex-1 text-[14px] text-[#737373]">{employee.description}</p>
                      <button
                        type="button"
                        onClick={() => { setDescDraft(employee.description); setEditingDesc(true); }}
                        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-[#c0c0c0] transition-colors hover:bg-[#f0f0f0] hover:text-[#737373]"
                        title="Edit description"
                      >
                        <Pencil className="size-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Status badges */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#f0f0f0] px-2.5 py-1 text-[12px] font-medium text-[#737373]">
                  {employee.role}
                </span>
                {employee.status.map((s) => (
                  <span
                    key={s}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[12px] font-medium",
                      s === "connected"
                        ? "bg-green-50 text-green-700"
                        : s === "runtime · active"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-[#fff3e0] text-[#e65100]"
                    )}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {!isConnected && (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#262626]"
                  >
                    <Zap className="size-3.5 shrink-0" strokeWidth={2} />
                    Provision runtime
                  </button>
                )}
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] font-medium text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
                >
                  <RefreshCw className="size-3.5 shrink-0" strokeWidth={1.5} />
                  Reload context
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] font-medium text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
                >
                  <Play className="size-3.5 shrink-0" strokeWidth={1.5} />
                  Start agent
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[13px] font-medium text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
                >
                  <Square className="size-3.5 shrink-0" strokeWidth={1.5} />
                  Stop agent
                </button>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="mb-6 flex flex-col gap-4">

            {/* API Key */}
            <div className="rounded-xl border border-[#e7e7f0] bg-white p-4">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[#a0a0a0]">
                API Key
              </p>
              <div className="flex items-center justify-between gap-3">
                <code className="flex-1 truncate font-mono text-[13px] text-[#0a0a0a]">
                  {employee.apiKey}
                </code>
                <div className="flex items-center gap-2">
                  <CopyButton text={employee.apiKey} />
                  <button
                    type="button"
                    className="text-[13px] font-medium text-purple-600 transition-colors hover:text-purple-700"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            </div>

            {/* Configure CLI */}
            <div className="rounded-xl border border-[#e7e7f0] bg-white p-4">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[#a0a0a0]">
                Configure CLI
              </p>
              <div className="flex items-start justify-between gap-2 rounded-lg bg-[#f5f5f5] px-3 py-3">
                <code className="flex-1 break-all font-mono text-[12px] leading-[1.6] text-[#0a0a0a]">
                  {cliCommand}
                </code>
                <CopyButton text={cliCommand} />
              </div>
            </div>

            {/* Send notification */}
            <div className="rounded-xl border border-[#e7e7f0] bg-white p-4">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[#a0a0a0]">
                Send notification
              </p>
              <div className="flex items-start justify-between gap-2 rounded-lg bg-[#f5f5f5] px-3 py-3">
                <pre className="flex-1 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[12px] leading-[1.6] text-[#0a0a0a]">
                  {curlCommand}
                </pre>
                <CopyButton text={curlCommand} />
              </div>
              <p className="mt-3 text-[12px] text-[#737373]">
                Change the description to the work you want this VE to handle.
              </p>
            </div>
          </div>

          {/* Detail tabs */}
          <div className="overflow-hidden rounded-xl border border-[#e7e7f0] bg-white">
            <div className="flex border-b border-[#e7e7f0]">
              {DETAIL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative px-4 py-3 text-[13px] transition-colors",
                    activeTab === tab.id
                      ? "font-semibold text-[#0a0a0a] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0a0a0a]"
                      : "font-medium text-[#737373] hover:text-[#0a0a0a]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "notifications" && (
              <div>
                <div className="flex border-b border-[#e7e7f0] px-4">
                  {(["pending", "consumed"] as NotifTab[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNotifTab(t)}
                      className={cn(
                        "relative px-3 py-2.5 text-[13px] capitalize transition-colors",
                        notifTab === t
                          ? "font-semibold text-[#0a0a0a] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0a0a0a]"
                          : "font-medium text-[#737373] hover:text-[#0a0a0a]"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="px-4 py-8 text-center">
                  <p className="text-[13px] text-[#a0a0a0]">
                    No {notifTab} notifications.
                  </p>
                </div>
              </div>
            )}

            {activeTab !== "notifications" && (
              <div className="px-4 py-8 text-center">
                <p className="text-[13px] text-[#a0a0a0] capitalize">
                  No {DETAIL_TABS.find((t) => t.id === activeTab)?.label.toLowerCase()} data yet.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}

// ─── Page root ─────────────────────────────────────────────────────────────────

export default function VirtualEmployeesPage() {
  const { activeOrgId, getVirtualEmployees, removeVirtualEmployee, updateVirtualEmployee } = useOrg();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const orgId = activeOrgId ?? "";
  const employees = getVirtualEmployees(orgId);
  const selected = employees.find((e) => e.id === selectedId) ?? null;

  function handleDelete(id: string) {
    removeVirtualEmployee(orgId, id);
    if (selectedId === id) setSelectedId(null);
  }

  if (selected) {
    return (
      <EmployeeDetail
        employee={selected}
        onBack={() => setSelectedId(null)}
        onUpdateDescription={(desc) => updateVirtualEmployee(orgId, selected.id, { description: desc })}
      />
    );
  }

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-[#fafafa]">
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-[820px]">

          {/* Page header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-semibold text-[#0a0a0a]">Virtual Employees</h1>
              <p className="mt-1 text-[14px] text-[#737373]">
                AI agents that can be assigned to issues in your organisation
              </p>
            </div>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#262626]"
            >
              <X className="size-4 shrink-0 rotate-45" strokeWidth={2} />
              Create virtual employee
            </button>
          </div>

          {/* Count */}
          <p className="mb-4 text-[13px] font-medium text-[#0a0a0a]">
            {employees.length} virtual employee{employees.length !== 1 ? "s" : ""}
          </p>

          {/* List */}
          {employees.length === 0 ? (
            <div className="rounded-xl border border-[#e7e7f0] bg-white px-4 py-16 text-center">
              <Bot className="mx-auto mb-3 size-8 text-[#d4d4d4]" strokeWidth={1.5} />
              <p className="text-[14px] text-[#a0a0a0]">No virtual employees yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#e7e7f0] bg-white">
              {employees.map((emp) => (
                <EmployeeRow
                  key={emp.id}
                  employee={emp}
                  onClick={() => setSelectedId(emp.id)}
                  onDelete={() => handleDelete(emp.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
