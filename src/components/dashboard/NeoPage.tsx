import { useState, useRef, useEffect } from "react";
import {
  Plus, ChevronDown, X, Circle, Clock, Zap, HelpCircle,
  GitPullRequest, CheckCircle2, XCircle, LayoutList, LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type IssueStatus = "backlog" | "todo" | "in-progress" | "needs-context" | "in-review" | "done" | "cancelled";
type ViewMode = "list" | "kanban";

interface Project {
  id: string;
  name: string;
  key: string;
}

interface Issue {
  id: string;
  projectId: string;
  title: string;
  status: IssueStatus;
  assigneeId: string | null;
  createdBy: string;
  createdAt: number;
  priority: "urgent" | "high" | "medium" | "low";
}

const STATUSES: { id: IssueStatus; label: string; icon: React.ElementType; colour: string }[] = [
  { id: "backlog",        label: "Backlog",       icon: Circle,        colour: "text-[#a0a0a0]" },
  { id: "todo",           label: "Todo",          icon: Circle,        colour: "text-[#737373]" },
  { id: "in-progress",    label: "In Progress",   icon: Zap,           colour: "text-[#f59e0b]" },
  { id: "needs-context",  label: "Needs Context", icon: HelpCircle,    colour: "text-[#8b5cf6]" },
  { id: "in-review",      label: "In Review",     icon: GitPullRequest,colour: "text-[#3b82f6]" },
  { id: "done",           label: "Done",          icon: CheckCircle2,  colour: "text-[#22c55e]" },
  { id: "cancelled",      label: "Cancelled",     icon: XCircle,       colour: "text-[#ef4444]" },
];

const ASSIGNEES = [
  { id: "he-1", name: "Rajesh Kumar" },
  { id: "he-2", name: "Priya Sharma" },
  { id: "he-3", name: "Arjun Mehta" },
  { id: "he-4", name: "Divya Patel" },
  { id: "he-5", name: "Ravi Iyer" },
];

// ─── Dropdown ─────────────────────────────────────────────────────────────────

function Dropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
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

  const current = options.find((o) => o.id === value)?.label ?? label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
          open ? "border-[#0a0a0a] bg-[#0a0a0a] text-white" : "border-[#e5e5e5] bg-white text-[#0a0a0a] hover:bg-[#f5f5f5]"
        )}
      >
        {current}
        <ChevronDown className={cn("size-3.5 shrink-0 transition-transform", open && "rotate-180")} strokeWidth={2} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-xl border border-[#e7e7f0] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => { onChange(o.id); setOpen(false); }}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2.5 text-[13px] transition-colors hover:bg-[#f5f5f5]",
                o.id === value ? "font-semibold text-[#0a0a0a]" : "text-[#737373]"
              )}
            >
              {o.label}
              {o.id === value && <CheckCircle2 className="size-3.5 text-purple-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Status summary cards ─────────────────────────────────────────────────────

function StatusCard({
  status,
  count,
  active,
  onClick,
}: {
  status: typeof STATUSES[number];
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = status.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-all",
        active
          ? "border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-sm"
          : "border-[#e7e7f0] bg-white hover:border-[#c0c0c0] hover:shadow-sm"
      )}
      style={{ minWidth: 100 }}
    >
      <div className="flex items-center gap-1.5">
        <Icon className={cn("size-3.5 shrink-0", active ? "text-white" : status.colour)} strokeWidth={1.5} />
        <span className={cn("text-[11px] font-medium", active ? "text-white/70" : "text-[#737373]")}>
          {status.label}
        </span>
      </div>
      <p className={cn("text-[22px] font-semibold leading-none", active ? "text-white" : "text-[#0a0a0a]")}>
        {count}
      </p>
    </button>
  );
}

// ─── Issue row ────────────────────────────────────────────────────────────────

function IssueRow({ issue, project }: { issue: Issue; project: Project }) {
  const status = STATUSES.find((s) => s.id === issue.status)!;
  const StatusIcon = status.icon;
  const assignee = ASSIGNEES.find((a) => a.id === issue.assigneeId);

  return (
    <div className="flex items-center gap-3 border-b border-[#f0f0f0] px-4 py-3 text-[13px] transition-colors hover:bg-[#fafafa] last:border-b-0">
      <StatusIcon className={cn("size-4 shrink-0", status.colour)} strokeWidth={1.5} />
      <span className="min-w-0 flex-1 truncate font-medium text-[#0a0a0a]">{issue.title}</span>
      <span className="shrink-0 rounded-full bg-[#f0f0f0] px-2 py-0.5 text-[11px] text-[#737373]">
        {project.key}
      </span>
      {assignee && (
        <span className="shrink-0 text-[12px] text-[#a0a0a0]">{assignee.name}</span>
      )}
      <span className="shrink-0 text-[12px] text-[#c0c0c0]">
        {new Date(issue.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
      </span>
    </div>
  );
}

// ─── Kanban column ────────────────────────────────────────────────────────────

function KanbanColumn({
  status,
  issues,
  projects,
}: {
  status: typeof STATUSES[number];
  issues: Issue[];
  projects: Project[];
}) {
  const Icon = status.icon;
  return (
    <div className="flex min-w-[220px] flex-1 flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <Icon className={cn("size-4 shrink-0", status.colour)} strokeWidth={1.5} />
        <span className="text-[12px] font-semibold text-[#737373]">{status.label}</span>
        <span className="ml-auto rounded-full bg-[#f0f0f0] px-1.5 py-0.5 text-[11px] font-medium text-[#a0a0a0]">
          {issues.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {issues.map((issue) => {
          const project = projects.find((p) => p.id === issue.projectId)!;
          const assignee = ASSIGNEES.find((a) => a.id === issue.assigneeId);
          return (
            <div
              key={issue.id}
              className="rounded-xl border border-[#e7e7f0] bg-white px-3 py-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="mb-2 text-[13px] font-medium text-[#0a0a0a] leading-snug">{issue.title}</p>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#f0f0f0] px-2 py-0.5 text-[10px] text-[#737373]">
                  {project.key}
                </span>
                {assignee && (
                  <span className="text-[11px] text-[#a0a0a0]">{assignee.name.split(" ")[0]}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Create Project modal ─────────────────────────────────────────────────────

function CreateProjectModal({
  onSave,
  onClose,
}: {
  onSave: (name: string, key: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");

  function handleNameChange(v: string) {
    setName(v);
    if (!key || key === name.slice(0, 4).toUpperCase()) {
      setKey(v.slice(0, 4).toUpperCase().replace(/\s/g, ""));
    }
  }

  const canSave = name.trim() && key.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <h2 className="text-[16px] font-semibold text-[#0a0a0a]">Create a project</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-[#a0a0a0] hover:bg-[#f5f5f5]"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-[#737373]">
              Project name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Q3 SEO Campaign"
              autoFocus
              className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-[14px] outline-none placeholder:text-[#c0c0c0] focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-[#737373]">
              Identifier key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase().replace(/\s/g, "").slice(0, 6))}
              placeholder="e.g. SEO"
              className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 font-mono text-[14px] uppercase outline-none placeholder:text-[#c0c0c0] focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors"
            />
            <p className="text-[11px] text-[#a0a0a0]">Short prefix used for issue IDs (e.g. SEO-1, SEO-2)</p>
          </div>
        </div>
        <div className="mt-6 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#e5e5e5] bg-white py-2.5 text-[14px] font-medium text-[#0a0a0a] hover:bg-[#f5f5f5]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => onSave(name.trim(), key.trim())}
            className="flex-1 rounded-lg bg-[#0a0a0a] py-2.5 text-[14px] font-semibold text-white hover:bg-[#262626] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create project
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── New Issue modal ──────────────────────────────────────────────────────────

function NewIssueModal({
  projects,
  onSave,
  onClose,
}: {
  projects: Project[];
  onSave: (issue: Omit<Issue, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [status, setStatus] = useState<IssueStatus>("todo");
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [priority, setPriority] = useState<Issue["priority"]>("medium");

  const canSave = title.trim() && projectId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <h2 className="text-[16px] font-semibold text-[#0a0a0a]">New issue</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-[#a0a0a0] hover:bg-[#f5f5f5]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-[#737373]">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title…"
              autoFocus
              className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-[14px] outline-none placeholder:text-[#c0c0c0] focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors"
            />
          </div>

          {/* Project + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#737373]">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#e5e5e5] px-3 py-2 text-[13px] text-[#0a0a0a] outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#737373]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
                className="w-full appearance-none rounded-lg border border-[#e5e5e5] px-3 py-2 text-[13px] text-[#0a0a0a] outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#737373]">Assignee</label>
              <select
                value={assigneeId ?? ""}
                onChange={(e) => setAssigneeId(e.target.value || null)}
                className="w-full appearance-none rounded-lg border border-[#e5e5e5] px-3 py-2 text-[13px] text-[#0a0a0a] outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors cursor-pointer"
              >
                <option value="">No assignee</option>
                {ASSIGNEES.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#737373]">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Issue["priority"])}
                className="w-full appearance-none rounded-lg border border-[#e5e5e5] px-3 py-2 text-[13px] text-[#0a0a0a] outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors cursor-pointer"
              >
                {["urgent", "high", "medium", "low"].map((p) => (
                  <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#e5e5e5] bg-white py-2.5 text-[14px] font-medium text-[#0a0a0a] hover:bg-[#f5f5f5]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() =>
              onSave({ title: title.trim(), projectId, status, assigneeId, priority, createdBy: "Rajesh Kumar" })
            }
            className="flex-1 rounded-lg bg-[#0a0a0a] py-2.5 text-[14px] font-semibold text-white hover:bg-[#262626] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create issue
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function NeoPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeStatus, setActiveStatus] = useState<IssueStatus | null>(null);
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterCreator, setFilterCreator] = useState("all");
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [newIssueOpen, setNewIssueOpen] = useState(false);

  function handleCreateProject(name: string, key: string) {
    const proj: Project = { id: `proj-${Date.now()}`, name, key };
    setProjects((prev) => [...prev, proj]);
    setCreateProjectOpen(false);
  }

  function handleCreateIssue(data: Omit<Issue, "id" | "createdAt">) {
    const issue: Issue = { id: `issue-${Date.now()}`, createdAt: Date.now(), ...data };
    setIssues((prev) => [...prev, issue]);
    setNewIssueOpen(false);
  }

  // Filtered issues
  const filteredIssues = issues.filter((issue) => {
    if (filterProject !== "all" && issue.projectId !== filterProject) return false;
    if (filterStatus !== "all" && issue.status !== filterStatus) return false;
    if (filterAssignee !== "all" && issue.assigneeId !== filterAssignee) return false;
    if (activeStatus && issue.status !== activeStatus) return false;
    return true;
  });

  // Count per status
  const countByStatus = (s: IssueStatus) =>
    issues.filter((i) => (filterProject === "all" || i.projectId === filterProject) && i.status === s).length;

  const projectOptions = [
    { id: "all", label: "All projects" },
    ...projects.map((p) => ({ id: p.id, label: p.name })),
  ];
  const statusOptions = [
    { id: "all", label: "All statuses" },
    ...STATUSES.map((s) => ({ id: s.id, label: s.label })),
  ];
  const assigneeOptions = [
    { id: "all", label: "All assignees" },
    ...ASSIGNEES.map((a) => ({ id: a.id, label: a.name })),
  ];
  const creatorOptions = [
    { id: "all", label: "Created by anyone" },
    { id: "me", label: "Created by me" },
  ];

  const hasProjects = projects.length > 0;

  return (
    <>
      <main className="flex flex-1 flex-col overflow-hidden bg-white">
        <div className="flex-1 overflow-y-auto px-8 py-8">

          {/* Header */}
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-semibold text-[#0a0a0a]">Neo</h1>
              <p className="mt-0.5 text-[13px] text-[#737373]">Issues, sub-tasks, and activity</p>
            </div>
            <button
              type="button"
              onClick={() => hasProjects ? setNewIssueOpen(true) : setCreateProjectOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#262626]"
            >
              <Plus className="size-4 shrink-0" strokeWidth={2.5} />
              {hasProjects ? "New Issue" : "New Issue"}
            </button>
          </div>

          {/* Filter bar */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {/* List / Kanban toggle */}
            <div className="flex items-center gap-0 overflow-hidden rounded-full border border-[#e5e5e5] bg-white p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                  viewMode === "list" ? "bg-[#0a0a0a] text-white" : "text-[#737373] hover:text-[#0a0a0a]"
                )}
              >
                <LayoutList className="size-3.5 shrink-0" strokeWidth={1.5} />
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                  viewMode === "kanban" ? "bg-[#0a0a0a] text-white" : "text-[#737373] hover:text-[#0a0a0a]"
                )}
              >
                <LayoutGrid className="size-3.5 shrink-0" strokeWidth={1.5} />
                Kanban
              </button>
            </div>

            <Dropdown label="All projects"    options={projectOptions}  value={filterProject}  onChange={setFilterProject} />
            <Dropdown label="All statuses"    options={statusOptions}   value={filterStatus}   onChange={setFilterStatus} />
            <Dropdown label="All assignees"   options={assigneeOptions} value={filterAssignee} onChange={setFilterAssignee} />
            <Dropdown label="Created by anyone" options={creatorOptions} value={filterCreator}  onChange={setFilterCreator} />
          </div>

          {/* Status summary cards */}
          <div className="mb-6 flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <StatusCard
                key={s.id}
                status={s}
                count={countByStatus(s.id)}
                active={activeStatus === s.id}
                onClick={() => setActiveStatus((prev) => (prev === s.id ? null : s.id))}
              />
            ))}
          </div>

          {/* Content area */}
          {!hasProjects ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="mb-1.5 text-[15px] font-semibold text-[#0a0a0a]">No projects yet</p>
              <p className="mb-6 text-[13px] text-[#737373]">
                Create a project and add teams before creating issues.
              </p>
              <button
                type="button"
                onClick={() => setCreateProjectOpen(true)}
                className="rounded-xl bg-[#0a0a0a] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#262626]"
              >
                Create a project
              </button>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="mb-1.5 text-[15px] font-semibold text-[#0a0a0a]">No issues</p>
              <p className="mb-6 text-[13px] text-[#737373]">
                {activeStatus ? "No issues with this status." : "Create your first issue to get started."}
              </p>
              <button
                type="button"
                onClick={() => setNewIssueOpen(true)}
                className="rounded-xl bg-[#0a0a0a] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#262626]"
              >
                New Issue
              </button>
            </div>
          ) : viewMode === "list" ? (
            /* List view */
            <div className="overflow-hidden rounded-xl border border-[#e7e7f0]">
              {filteredIssues.map((issue) => {
                const project = projects.find((p) => p.id === issue.projectId)!;
                return <IssueRow key={issue.id} issue={issue} project={project} />;
              })}
            </div>
          ) : (
            /* Kanban view */
            <div className="flex gap-4 overflow-x-auto pb-4">
              {STATUSES.map((s) => {
                const cols = filteredIssues.filter((i) => i.status === s.id);
                return (
                  <KanbanColumn
                    key={s.id}
                    status={s}
                    issues={cols}
                    projects={projects}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>

      {createProjectOpen && (
        <CreateProjectModal
          onSave={handleCreateProject}
          onClose={() => setCreateProjectOpen(false)}
        />
      )}

      {newIssueOpen && hasProjects && (
        <NewIssueModal
          projects={projects}
          onSave={handleCreateIssue}
          onClose={() => setNewIssueOpen(false)}
        />
      )}
    </>
  );
}
