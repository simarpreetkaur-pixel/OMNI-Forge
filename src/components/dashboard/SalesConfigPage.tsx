import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft, ChevronRight, Send, Sparkles, Copy, Check,
  FileText, Plus, Trash2, Upload, X, Users, ShieldCheck,
  UserCircle2, UserCog, ChevronDown, Database, CreditCard,
  Home, Car, Heart, Briefcase, Building2, Package, Phone,
  Mail, BarChart2, ShoppingCart, DollarSign, Activity, Globe,
  Layers, Star, Zap, Settings, TrendingUp, ToggleLeft,
  ToggleRight, ExternalLink, BookOpen, CheckSquare,
  LayoutTemplate, Wrench, Tag, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseSalesMessage } from "@/lib/salesAiParser";
import { generateSalesSkillFile, isSalesSkillFileReady } from "@/lib/salesSkillFile";
import { useOrg } from "@/context/OrgContext";
import {
  type SalesConfig,
  type SalesCampaign,
  type SalesEmployee,
  type SalesCustomSection,
  type SalesDataField,
  type FieldType,
  type PowerTool,
  type LeadSourceType,
  type OpeningContextField,
  EMPTY_SALES_CONFIG,
  DISPOSITION_SUGGESTIONS,
  PREDICTIVE_CTA_SUGGESTIONS,
  QUICK_ACTION_SUGGESTIONS,
  FIELD_TYPE_OPTIONS,
  SECTION_ICON_OPTIONS,
  POWER_TOOL_ICON_OPTIONS,
  PREBUILT_CONTEXT_FIELDS,
  defaultOpeningContext,
  defaultCopilot,
  nextCampaignColor,
} from "@/types/sales";

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.FC<{ className?: string; strokeWidth?: number }>> = {
  Home, Car, CreditCard, Heart, Briefcase, Building2,
  Package, FileText, Phone, Mail, Users, BarChart2,
  ShoppingCart, DollarSign, Activity, Globe, Database,
  Layers, Star, Zap, Settings, TrendingUp,
  ExternalLink, BookOpen, CheckSquare,
};

function DynIcon({ name, className, strokeWidth = 1.5 }: { name: string; className?: string; strokeWidth?: number }) {
  const Icon = ICON_MAP[name] ?? Globe;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Message =
  | { role: "ai"; text: string }
  | { role: "user"; text: string }
  | { role: "flash"; fields: string[] };

interface SalesConfigPageProps {
  orgId: string;
  appId: string;
  onBack: () => void;
  initialConfig?: SalesConfig | null;
  initialTimestamp?: number | null;
  isAlreadySaved?: boolean;
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

function renderText(text: string) {
  return text.split("\n").map((ln, li, arr) => {
    const parts = ln.split(/\*\*(.+?)\*\*/g);
    return (
      <span key={li}>
        {parts.map((p, pi) => pi % 2 === 1 ? <strong key={pi} className="font-semibold text-[#0a0a0a]">{p}</strong> : p)}
        {li < arr.length - 1 && <br />}
      </span>
    );
  });
}

// ─── Small UI helpers ─────────────────────────────────────────────────────────

function FlashBadge({ field }: { field: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
      <Check className="size-3 shrink-0" strokeWidth={2.5} />
      {field}
    </span>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#a0a0a0]">{title}</p>
      {subtitle && <p className="mt-1 text-[12px] leading-[1.5] text-[#737373]">{subtitle}</p>}
    </div>
  );
}

function FieldWrap({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-1.5 rounded-lg border border-[#e7e7f0] bg-white px-3 py-2.5", span2 && "col-span-2")}>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">{label}</label>
      {children}
    </div>
  );
}

function OrderedList({ label, subtitle, items, onChange, suggestions, placeholder }: {
  label: string; subtitle?: string; items: string[]; onChange: (v: string[]) => void;
  suggestions?: string[]; placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  function add() { const v = draft.trim(); if (v && !items.includes(v)) onChange([...items, v]); setDraft(""); }
  function remove(i: number) { onChange(items.filter((_, j) => j !== i)); }
  function up(i: number) { if (i === 0) return; const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }
  function down(i: number) { if (i === items.length - 1) return; const n = [...items]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; onChange(n); }
  const unused = suggestions?.filter((s) => !items.includes(s)) ?? [];
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[#e7e7f0] bg-white px-3 py-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">{label}</p>
        {subtitle && <p className="mt-0.5 text-[11px] text-[#a0a0a0]">{subtitle}</p>}
      </div>
      {items.length > 0 && (
        <div className="flex flex-col gap-1">
          {items.map((item, i) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-[#f0f0f0] bg-[#fafafa] px-3 py-2">
              <span className="w-5 shrink-0 text-center text-[10px] font-bold text-[#c0c0c0]">{i + 1}</span>
              <span className="flex-1 min-w-0 truncate text-[12px] font-medium text-[#0a0a0a]">{item}</span>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => up(i)} disabled={i === 0} className="flex size-5 items-center justify-center text-[#c0c0c0] hover:text-[#737373] disabled:opacity-30"><ChevronUp className="size-3" /></button>
                <button type="button" onClick={() => down(i)} disabled={i === items.length - 1} className="flex size-5 items-center justify-center text-[#c0c0c0] hover:text-[#737373] disabled:opacity-30"><ChevronDown className="size-3" /></button>
                <button type="button" onClick={() => remove(i)} className="flex size-5 items-center justify-center text-[#c0c0c0] hover:text-[#e11d48]"><X className="size-3" strokeWidth={2} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder ?? "Add an item…"}
          className="flex-1 rounded-md border border-[#e7e7f0] bg-[#fafafa] px-2.5 py-1.5 text-[12px] placeholder:text-[#c0c0c0] outline-none" />
        <button type="button" onClick={add} className="flex size-7 shrink-0 items-center justify-center rounded-md bg-purple-600 text-white hover:bg-purple-700">
          <Plus className="size-3.5" strokeWidth={2} />
        </button>
      </div>
      {unused.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-[10px] text-[#a0a0a0] self-center">Suggestions:</span>
          {unused.slice(0, 5).map((s) => (
            <button key={s} type="button" onClick={() => onChange([...items, s])}
              className="rounded-full border border-dashed border-[#d4d4d4] px-2 py-0.5 text-[11px] text-[#737373] hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Custom section editor ────────────────────────────────────────────────────

const BLANK_SECTION: Omit<SalesCustomSection, "id"> = {
  name: "", icon: "Database", enabled: true,
  apiUrl: "", apiAuthType: "none", apiAuthValue: "",
  fields: [], campaignIds: [],
};

function SectionEditor({ initial, campaigns, onSave, onCancel }: {
  initial: Omit<SalesCustomSection, "id">;
  campaigns: SalesCampaign[];
  onSave: (s: SalesCustomSection) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState(initial);
  const [fd, setFd] = useState<Omit<SalesDataField, "id">>({ label: "", type: "text", jsonPath: "" });
  const [showIconPicker, setShowIconPicker] = useState(false);

  function save() {
    if (!d.name.trim()) return;
    onSave({ ...d, id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` });
  }
  function addField() {
    if (!fd.label.trim()) return;
    const f: SalesDataField = { id: `f-${Date.now()}`, ...fd };
    setD((x) => ({ ...x, fields: [...x.fields, f] }));
    setFd({ label: "", type: "text", jsonPath: "" });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-purple-200 bg-purple-50/30 p-4">
      {/* Name + icon + toggle */}
      <div className="flex items-end gap-3">
        <div className="flex flex-1 flex-col gap-1.5 rounded-lg border border-[#e7e7f0] bg-white px-3 py-2.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">Section name</label>
          <input autoFocus type="text" value={d.name} onChange={(e) => setD((x) => ({ ...x, name: e.target.value }))}
            placeholder="e.g. Loan Portfolio, Subscription History…"
            className="w-full bg-transparent text-sm text-[#0a0a0a] placeholder:text-[#c0c0c0] outline-none" />
        </div>
        <div className="relative shrink-0">
          <button type="button" onClick={() => setShowIconPicker((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-[#e7e7f0] bg-white px-3 py-2.5 text-[12px] text-[#737373] hover:bg-[#fafafa]">
            <DynIcon name={d.icon} className="size-4 text-purple-600" />
            <span>{d.icon}</span>
            <ChevronDown className="size-3 text-[#c0c0c0]" />
          </button>
          {showIconPicker && (
            <div className="absolute top-full left-0 z-20 mt-1 w-56 rounded-xl border border-[#e7e7f0] bg-white p-2 shadow-lg">
              <div className="grid grid-cols-6 gap-1">
                {SECTION_ICON_OPTIONS.map((ic) => (
                  <button key={ic} type="button" title={ic}
                    onClick={() => { setD((x) => ({ ...x, icon: ic })); setShowIconPicker(false); }}
                    className={cn("flex size-8 items-center justify-center rounded-lg hover:bg-purple-50", d.icon === ic && "bg-purple-100")}>
                    <DynIcon name={ic} className="size-4 text-[#737373]" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button type="button" onClick={() => setD((x) => ({ ...x, enabled: !x.enabled }))} className="shrink-0">
          {d.enabled ? <ToggleRight className="size-8 text-purple-600" strokeWidth={1.5} /> : <ToggleLeft className="size-8 text-[#c0c0c0]" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Campaign scope */}
      {campaigns.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-[#e7e7f0] bg-white px-3 py-2.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">Visible in campaigns</label>
          <p className="text-[11px] text-[#a0a0a0]">Leave none selected to show in all campaigns.</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {campaigns.map((c) => {
              const selected = d.campaignIds.includes(c.id);
              return (
                <button key={c.id} type="button"
                  onClick={() => setD((x) => ({ ...x, campaignIds: selected ? x.campaignIds.filter((id) => id !== c.id) : [...x.campaignIds, c.id] }))}
                  className={cn("rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                    selected ? "border-purple-400 bg-purple-50 text-purple-700" : "border-[#e7e7f0] bg-[#fafafa] text-[#737373] hover:border-purple-300")}>
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* API config */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#e7e7f0] bg-white p-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">Data source API</p>
          <p className="mt-0.5 text-[11px] text-[#a0a0a0]">Called when a call connects. Use <code className="rounded bg-purple-50 px-1 text-purple-700">{"{phone}"}</code> for customer identifier.</p>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-3 py-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[#a0a0a0]">Endpoint URL</label>
          <input type="text" value={d.apiUrl} onChange={(e) => setD((x) => ({ ...x, apiUrl: e.target.value }))}
            placeholder="https://api.yourcompany.com/customers/{phone}/loans"
            className="w-full bg-transparent font-mono text-[12px] placeholder:text-[#c0c0c0] outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1 rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-3 py-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#a0a0a0]">Auth type</label>
            <select value={d.apiAuthType} onChange={(e) => setD((x) => ({ ...x, apiAuthType: e.target.value as SalesCustomSection["apiAuthType"] }))}
              className="appearance-none bg-transparent text-[12px] outline-none cursor-pointer">
              <option value="none">None</option>
              <option value="bearer">Bearer token</option>
              <option value="apiKey">API key</option>
            </select>
          </div>
          {d.apiAuthType !== "none" && (
            <div className="flex flex-col gap-1 rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-3 py-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#a0a0a0]">{d.apiAuthType === "bearer" ? "Bearer token" : "API key"}</label>
              <input type="password" value={d.apiAuthValue} onChange={(e) => setD((x) => ({ ...x, apiAuthValue: e.target.value }))}
                className="w-full bg-transparent font-mono text-[12px] outline-none" />
            </div>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#e7e7f0] bg-white p-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">Display fields</p>
          <p className="mt-0.5 text-[11px] text-[#a0a0a0]">Map fields from the API response to what the agent sees.</p>
        </div>
        {d.fields.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-[1fr_100px_1fr_28px] gap-2 px-1">
              {["Agent label", "Display as", "JSON path", ""].map((h) => (
                <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-[#a0a0a0]">{h}</span>
              ))}
            </div>
            {d.fields.map((f) => (
              <div key={f.id} className="grid grid-cols-[1fr_100px_1fr_28px] items-center gap-2 rounded-lg border border-[#f0f0f0] bg-[#fafafa] px-2 py-1.5">
                <span className="text-[12px] font-medium truncate">{f.label}</span>
                <span className="rounded-full border border-[#e7e7f0] bg-white px-2 py-0.5 text-[10px] text-center text-[#737373]">{f.type}</span>
                <span className="font-mono text-[11px] text-[#737373] truncate">{f.jsonPath || "—"}</span>
                <button type="button" onClick={() => setD((x) => ({ ...x, fields: x.fields.filter((x2) => x2.id !== f.id) }))}
                  className="flex size-6 items-center justify-center rounded text-[#c0c0c0] hover:text-[#e11d48]">
                  <X className="size-3" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-[1fr_120px_1fr_32px] items-center gap-2 rounded-lg border border-dashed border-[#d4d4d4] bg-[#fafafa] px-2 py-2">
          <input type="text" value={fd.label} onChange={(e) => setFd((x) => ({ ...x, label: e.target.value }))}
            placeholder="Field label…" className="bg-transparent text-[12px] placeholder:text-[#c0c0c0] outline-none" />
          <select value={fd.type} onChange={(e) => setFd((x) => ({ ...x, type: e.target.value as FieldType }))}
            className="appearance-none bg-transparent text-[12px] text-[#737373] outline-none cursor-pointer">
            {FIELD_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input type="text" value={fd.jsonPath} onChange={(e) => setFd((x) => ({ ...x, jsonPath: e.target.value }))}
            placeholder="e.g. loan.amount" className="bg-transparent font-mono text-[12px] placeholder:text-[#c0c0c0] outline-none" />
          <button type="button" onClick={addField} disabled={!fd.label.trim()}
            className="flex size-7 items-center justify-center rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40">
            <Plus className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-[#e5e5e5] bg-white px-4 py-2 text-sm font-medium text-[#737373] hover:bg-[#f5f5f5]">Cancel</button>
        <button type="button" onClick={save} disabled={!d.name.trim()}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-40">Save section</button>
      </div>
    </div>
  );
}

// ─── Add Employee modal ───────────────────────────────────────────────────────

function AddEmployeeModal({ onAdd, onClose }: { onAdd: (e: Omit<SalesEmployee, "id">) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", role: "agent" as SalesEmployee["role"], team: "" });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    onAdd(form); onClose();
  }
  const inputCls = "w-full bg-transparent text-sm text-[#0a0a0a] placeholder:text-[#c0c0c0] outline-none leading-5";
  const selectCls = "w-full appearance-none bg-transparent text-sm text-[#0a0a0a] outline-none leading-5 cursor-pointer";
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onMouseDown={onClose}>
      <form onSubmit={submit} className="flex flex-col bg-white" style={{ borderRadius: 16, padding: "28px 28px 24px", width: 420, gap: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }} onMouseDown={(e) => e.stopPropagation()}>
        <p style={{ fontSize: 16, fontWeight: 600, color: "#0a0a0a", margin: 0 }}>Add employee</p>
        <div className="flex flex-col gap-3">
          <FieldWrap label="Full name"><input autoFocus required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Priya Sharma" className={inputCls} /></FieldWrap>
          <FieldWrap label="Email"><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="priya@company.com" className={inputCls} /></FieldWrap>
          <div className="grid grid-cols-2 gap-3">
            <FieldWrap label="Role"><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as SalesEmployee["role"] })} className={selectCls}><option value="admin">Admin</option><option value="manager">Manager</option><option value="agent">Agent</option></select></FieldWrap>
            <FieldWrap label="Team (optional)"><input type="text" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="e.g. North India" className={inputCls} /></FieldWrap>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-[#e5e5e5] bg-white px-4 py-2 text-sm font-medium hover:bg-[#f5f5f5]">Cancel</button>
          <button type="submit" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">Add</button>
        </div>
      </form>
    </div>,
    document.body
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const textareaCls = "w-full bg-transparent text-sm text-[#0a0a0a] placeholder:text-[#c0c0c0] outline-none leading-5 resize-none";
const inputCls = "w-full bg-transparent text-sm text-[#0a0a0a] placeholder:text-[#c0c0c0] outline-none leading-5";

export default function SalesConfigPage({
  orgId, appId, onBack, initialConfig, initialTimestamp, isAlreadySaved = false,
}: SalesConfigPageProps) {
  const { setAppConfig, addApp, getConfigTimestamp } = useOrg();

  const [config, setConfig] = useState<SalesConfig>(initialConfig ?? EMPTY_SALES_CONFIG);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    initialConfig?.campaigns?.[0]?.id ?? null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [addingSection, setAddingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDesc, setNewCampaignDesc] = useState("");
  const [showAddCampaignForm, setShowAddCampaignForm] = useState(false);
  const [newPowerToolName, setNewPowerToolName] = useState("");
  const [newPowerToolUrl, setNewPowerToolUrl] = useState("");
  const [newPowerToolDesc, setNewPowerToolDesc] = useState("");
  const [addingPowerTool, setAddingPowerTool] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const greetedRef = useRef(false);

  const configTimestamp = getConfigTimestamp ? getConfigTimestamp(orgId, appId) : (initialTimestamp ?? null);
  const hasCampaigns = config.campaigns.length > 0;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;
    setIsTyping(true);
    setTimeout(() => {
      const greeting = hasCampaigns
        ? `Welcome back! Your Sales app has ${config.campaigns.length} campaign${config.campaigns.length > 1 ? "s" : ""} configured.\n\nJust tell me what to change — I'll update the config instantly.`
        : `Hi! To configure your Sales app, start by **creating your campaign types**.\n\nCampaigns are the different use cases for your sales team — like Fresh Lead, Renewal, Winback, or Cross-sell. Everything else (scripts, data panels, opening context) is configured per campaign.\n\nType in the box on the left, or tell me here:\n**"Add campaigns: Fresh Lead, Renewal, Winback"**`;
      setMessages([{ role: "ai", text: greeting }]);
      setIsTyping(false);
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateConfig = useCallback((updates: Partial<SalesConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
      if (isAlreadySaved || hasCampaigns) setAppConfig(orgId, appId, next as never);
      return next;
    });
  }, [isAlreadySaved, hasCampaigns, orgId, appId, setAppConfig]);

  function handleSend() {
    const val = input.trim();
    if (!val || isTyping) return;
    setMessages((prev) => [...prev, { role: "user", text: val }]);
    setInput("");
    setIsTyping(true);

    const result = parseSalesMessage(val, config, selectedCampaignId);
    updateConfig(result.updates);

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: result.response }]);
      if (result.fieldsUpdated.length > 0) {
        setMessages((prev) => [...prev, { role: "flash", fields: result.fieldsUpdated.map((k) => String(k)) } as Message]);
      }
      if (result.affectedCampaignId) setSelectedCampaignId(result.affectedCampaignId);
      // If new campaigns were created, save and mark as configured
      if (result.updates.campaigns && result.updates.campaigns.length > (config.campaigns.length)) {
        const updatedCfg = { ...config, ...result.updates };
        setAppConfig(orgId, appId, updatedCfg as never);
        addApp(orgId, { id: appId, name: "Sales", description: "Automate and accelerate sales workflows" });
      }
      setIsTyping(false);
      inputRef.current?.focus();
    }, 700);
  }

  function createCampaign() {
    if (!newCampaignName.trim()) return;
    const id = `campaign-${Date.now()}`;
    const campaign: SalesCampaign = {
      id, name: newCampaignName.trim(), description: newCampaignDesc.trim(), color: nextCampaignColor(),
    };
    const updates: Partial<SalesConfig> = {
      campaigns: [...config.campaigns, campaign],
      openingContext: { ...config.openingContext, [id]: defaultOpeningContext() },
      copilot: { ...config.copilot, [id]: defaultCopilot() },
    };
    updateConfig(updates);
    const updatedCfg = { ...config, ...updates };
    setAppConfig(orgId, appId, updatedCfg as never);
    addApp(orgId, { id: appId, name: "Sales", description: "Automate and accelerate sales workflows" });
    setSelectedCampaignId(id);
    setNewCampaignName("");
    setNewCampaignDesc("");
    setShowAddCampaignForm(false);
  }

  function deleteCampaign(id: string) {
    const newCampaigns = config.campaigns.filter((c) => c.id !== id);
    const newOpeningContext = { ...config.openingContext };
    const newCopilot = { ...config.copilot };
    delete newOpeningContext[id];
    delete newCopilot[id];
    updateConfig({ campaigns: newCampaigns, openingContext: newOpeningContext, copilot: newCopilot });
    if (selectedCampaignId === id) setSelectedCampaignId(newCampaigns[0]?.id ?? null);
  }

  function addPowerTool() {
    if (!newPowerToolName.trim() || !newPowerToolUrl.trim()) return;
    const tool: PowerTool = {
      id: `tool-${Date.now()}`,
      name: newPowerToolName.trim(),
      icon: "Globe",
      url: newPowerToolUrl.trim(),
      description: newPowerToolDesc.trim(),
    };
    updateConfig({ powerTools: [...config.powerTools, tool] });
    setNewPowerToolName(""); setNewPowerToolUrl(""); setNewPowerToolDesc("");
    setAddingPowerTool(false);
  }

  // Scoped copilot/context for selected campaign
  const selCopilot = selectedCampaignId ? (config.copilot[selectedCampaignId] ?? defaultCopilot()) : defaultCopilot();
  const selContext = selectedCampaignId ? (config.openingContext[selectedCampaignId] ?? defaultOpeningContext()) : defaultOpeningContext();

  function updateCopilot(updates: Partial<typeof selCopilot>) {
    if (!selectedCampaignId) return;
    updateConfig({ copilot: { ...config.copilot, [selectedCampaignId]: { ...selCopilot, ...updates } } });
  }

  function updateContext(updates: Partial<typeof selContext>) {
    if (!selectedCampaignId) return;
    updateConfig({ openingContext: { ...config.openingContext, [selectedCampaignId]: { ...selContext, ...updates } } });
  }

  function toggleContextField(fieldId: string) {
    const fields = selContext.fields.map((f) => f.id === fieldId ? { ...f, enabled: !f.enabled } : f);
    updateContext({ fields });
  }

  function addCustomContextField(field: Omit<OpeningContextField, "id">) {
    const f: OpeningContextField = { id: `ctx-custom-${Date.now()}`, ...field };
    updateContext({ fields: [...selContext.fields, f] });
  }

  const skillContent = generateSalesSkillFile(config, configTimestamp ?? null);
  const skillReady = isSalesSkillFileReady(config);

  const selectedCampaign = config.campaigns.find((c) => c.id === selectedCampaignId);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* ─── Breadcrumb ─────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-[#e7e7f0] bg-white px-6 py-3.5">
        <button type="button" onClick={onBack} className="flex size-8 items-center justify-center rounded-md border border-[#e5e5e5] bg-white shadow-sm hover:bg-[#f5f5f5]">
          <ArrowLeft className="size-4 text-[#0a0a0a]" />
        </button>
        <button type="button" onClick={onBack} className="text-sm text-[#737373] hover:text-[#0a0a0a]">Apps</button>
        <ChevronRight className="size-3.5 text-[#a0a0a0]" />
        <span className="text-sm font-medium text-[#0a0a0a]">Sales</span>
        {isAlreadySaved && (
          <span className="ml-1 rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-[11px] font-medium text-[#737373]">Editing</span>
        )}
      </div>

      {/* ─── Body: config (65%) + AI chat (35%) ─────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Config pane ─────────────────────────────────────────────────── */}
        <div className="flex flex-[65] flex-col overflow-hidden border-r border-[#e7e7f0]">

          {/* Campaign selector bar — shown once at least one campaign exists */}
          {hasCampaigns && (
            <div className="flex shrink-0 items-center gap-2 border-b border-[#e7e7f0] bg-white px-4 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a0a0a0] shrink-0">Viewing</span>
              <div className="flex flex-1 flex-wrap gap-1.5">
                {config.campaigns.map((c) => (
                  <button key={c.id} type="button"
                    onClick={() => setSelectedCampaignId(c.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                      selectedCampaignId === c.id
                        ? "border-purple-400 bg-purple-50 text-purple-700"
                        : "border-[#e7e7f0] bg-white text-[#737373] hover:border-purple-300"
                    )}>
                    <span className="size-2 rounded-full shrink-0" style={{ background: c.color }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Single scrollable column — always visible */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[680px] px-8 py-8 flex flex-col gap-12">

                {/* ①  Lead Source ─────────────────────────────────────── */}
                <div>
                    <SectionHead title="Lead Source" subtitle="How leads get into OMNI so the auto-dialer knows who to call." />
                    <div className="mb-4 flex gap-2">
                      {([["csv","Upload CSV"], ["api","Connect API"], ["both","Both"]] as [LeadSourceType, string][]).map(([val, label]) => (
                        <button key={val} type="button"
                          onClick={() => updateConfig({ leadSource: { ...config.leadSource, type: val } })}
                          className={cn("flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                            config.leadSource.type === val ? "border-purple-400 bg-purple-50 text-purple-700" : "border-[#e7e7f0] bg-white text-[#737373] hover:border-purple-300")}>
                          {label}
                        </button>
                      ))}
                    </div>
                    {(config.leadSource.type === "csv" || config.leadSource.type === "both") && (
                      <div className="mb-4">
                        {config.leadSource.csvFileName ? (
                          <div className="flex items-center gap-3 rounded-lg border border-[#e7e7f0] bg-white px-4 py-3">
                            <FileText className="size-4 shrink-0 text-purple-600" strokeWidth={1.5} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{config.leadSource.csvFileName}</p>
                              {config.leadSource.csvUploadedAt && <p className="text-[11px] text-[#a0a0a0]">Uploaded {new Date(config.leadSource.csvUploadedAt).toLocaleDateString()}</p>}
                            </div>
                            <button type="button" onClick={() => updateConfig({ leadSource: { ...config.leadSource, csvFileName: "", csvUploadedAt: null } })}
                              className="flex size-7 items-center justify-center rounded-md text-[#c0c0c0] hover:bg-[#fff1f2] hover:text-[#e11d48]">
                              <X className="size-3.5" strokeWidth={1.75} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#d4d4d4] bg-white px-6 py-8 text-center hover:border-purple-400 hover:bg-purple-50">
                            <Upload className="size-5 text-[#a0a0a0]" strokeWidth={1.5} />
                            <div>
                              <p className="text-sm font-medium text-[#737373]">Upload lead list</p>
                              <p className="text-[11px] text-[#a0a0a0] mt-0.5">CSV or Excel — must include a phone number column</p>
                            </div>
                            <input type="file" accept=".csv,.xlsx,.xls" className="hidden"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) updateConfig({ leadSource: { ...config.leadSource, csvFileName: f.name, csvUploadedAt: Date.now() } }); e.target.value = ""; }} />
                          </label>
                        )}
                      </div>
                    )}
                    {(config.leadSource.type === "api" || config.leadSource.type === "both") && (
                      <div className="flex flex-col gap-3 rounded-lg border border-[#e7e7f0] bg-white p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">Lead feed API</p>
                        <FieldWrap label="Endpoint URL">
                          <input type="text" value={config.leadSource.apiUrl}
                            onChange={(e) => updateConfig({ leadSource: { ...config.leadSource, apiUrl: e.target.value } })}
                            placeholder="https://api.yourcompany.com/leads" className={cn(inputCls, "font-mono text-[13px]")} />
                        </FieldWrap>
                        <div className="grid grid-cols-2 gap-3">
                          <FieldWrap label="Auth type">
                            <select value={config.leadSource.apiAuthType}
                              onChange={(e) => updateConfig({ leadSource: { ...config.leadSource, apiAuthType: e.target.value as "none" | "bearer" | "apiKey" } })}
                              className="w-full appearance-none bg-transparent text-sm outline-none cursor-pointer">
                              <option value="none">None</option>
                              <option value="bearer">Bearer token</option>
                              <option value="apiKey">API key</option>
                            </select>
                          </FieldWrap>
                          {config.leadSource.apiAuthType !== "none" && (
                            <FieldWrap label={config.leadSource.apiAuthType === "bearer" ? "Bearer token" : "API key"}>
                              <input type="password" value={config.leadSource.apiAuthValue}
                                onChange={(e) => updateConfig({ leadSource: { ...config.leadSource, apiAuthValue: e.target.value } })}
                                className={cn(inputCls, "font-mono")} />
                            </FieldWrap>
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* ② Campaigns ──────────────────────────────────────────── */}
                <div>
                    <SectionHead title="Campaigns" subtitle="Define the different sales use cases for your team. All other configuration (scripts, data panels, opening context) is set per campaign." />
                    <div className="flex flex-col gap-3">
                      {config.campaigns.map((c) => (
                        <div key={c.id} className="flex items-start gap-3 rounded-xl border border-[#e7e7f0] bg-white p-4">
                          <span className="mt-1 size-3 shrink-0 rounded-full" style={{ background: c.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#0a0a0a]">{c.name}</p>
                            {c.description && <p className="text-[12px] text-[#737373] mt-0.5">{c.description}</p>}
                          </div>
                          <button type="button" onClick={() => deleteCampaign(c.id)}
                            className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#c0c0c0] hover:bg-[#fff1f2] hover:text-[#e11d48]">
                            <Trash2 className="size-3.5" strokeWidth={1.75} />
                          </button>
                        </div>
                      ))}
                      {/* Add / create campaign */}
                      {!hasCampaigns ? (
                        /* First-time creation — always visible, prominent */
                        <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 flex flex-col gap-3">
                          <div>
                            <p className="text-[13px] font-semibold text-[#0a0a0a]">Create your first campaign</p>
                            <p className="mt-0.5 text-[12px] text-[#737373] leading-[1.5]">
                              Campaigns are your different sales use cases — e.g. Fresh Lead, Renewal, Winback. Per-campaign sections below unlock once you have at least one.
                            </p>
                          </div>
                          <input type="text" autoFocus value={newCampaignName}
                            onChange={(e) => setNewCampaignName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") createCampaign(); }}
                            placeholder="Campaign name — e.g. Fresh Lead, Renewal…"
                            className="rounded-lg border border-[#e7e7f0] bg-white px-3 py-2 text-sm placeholder:text-[#c0c0c0] outline-none focus:border-purple-400" />
                          <input type="text" value={newCampaignDesc}
                            onChange={(e) => setNewCampaignDesc(e.target.value)}
                            placeholder="Short description (optional)"
                            className="rounded-lg border border-[#e7e7f0] bg-white px-3 py-2 text-sm placeholder:text-[#c0c0c0] outline-none focus:border-purple-400" />
                          <button type="button" onClick={createCampaign} disabled={!newCampaignName.trim()}
                            className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-40">
                            <Plus className="size-3.5" strokeWidth={2} /> Create campaign
                          </button>
                        </div>
                      ) : showAddCampaignForm ? (
                        /* Inline form to add another */
                        <div className="rounded-xl border border-dashed border-purple-300 bg-purple-50/30 p-4 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">New campaign</p>
                            <button type="button" onClick={() => { setShowAddCampaignForm(false); setNewCampaignName(""); setNewCampaignDesc(""); }}
                              className="flex size-6 items-center justify-center rounded text-[#c0c0c0] hover:text-[#737373]">
                              <X className="size-3.5" strokeWidth={2} />
                            </button>
                          </div>
                          <input type="text" autoFocus value={newCampaignName}
                            onChange={(e) => setNewCampaignName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") createCampaign(); }}
                            placeholder="e.g. Cross-sell, Winback, Renewal…"
                            className="rounded-lg border border-[#e7e7f0] bg-white px-3 py-2 text-sm placeholder:text-[#c0c0c0] outline-none focus:border-purple-400" />
                          <input type="text" value={newCampaignDesc}
                            onChange={(e) => setNewCampaignDesc(e.target.value)}
                            placeholder="Short description (optional)"
                            className="rounded-lg border border-[#e7e7f0] bg-white px-3 py-2 text-sm placeholder:text-[#c0c0c0] outline-none focus:border-purple-400" />
                          <div className="flex gap-2">
                            <button type="button" onClick={createCampaign} disabled={!newCampaignName.trim()}
                              className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-40">
                              <Plus className="size-3.5" strokeWidth={2} /> Add campaign
                            </button>
                            <button type="button" onClick={() => { setShowAddCampaignForm(false); setNewCampaignName(""); setNewCampaignDesc(""); }}
                              className="rounded-lg border border-[#e5e5e5] bg-white px-4 py-2 text-sm font-medium text-[#737373] hover:bg-[#f5f5f5]">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Collapsed — button to add another */
                        <button type="button" onClick={() => setShowAddCampaignForm(true)}
                          className="flex items-center gap-2 rounded-lg border border-dashed border-[#d4d4d4] bg-white px-4 py-3 text-sm font-medium text-[#737373] hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600">
                          <Plus className="size-4 shrink-0" strokeWidth={1.75} />
                          Add another campaign
                        </button>
                      )}
                    </div>
                </div>

                {/* ③ Opening Call Context (per campaign) ───────────────── */}
                <div>
                    <SectionHead
                      title="Opening Call Context"
                      subtitle={`The modal shown to the agent before they accept the call — giving them key info about the customer.${selectedCampaign ? ` Configured for: ${selectedCampaign.name}` : " Select a campaign above."}`}
                    />
                    {!selectedCampaignId ? (
                      <div className="rounded-lg border border-dashed border-[#e7e7f0] bg-[#fafafa] px-5 py-6 text-center">
                        <p className="text-[13px] text-[#a0a0a0]">Add a campaign above to configure its opening call context.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {/* API config */}
                        <div className="flex flex-col gap-3 rounded-lg border border-[#e7e7f0] bg-white p-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">Data source API</p>
                            <p className="mt-0.5 text-[11px] text-[#a0a0a0]">Called when the call rings. Use <code className="rounded bg-purple-50 px-1 text-purple-700">{"{phone}"}</code> as customer identifier.</p>
                          </div>
                          <FieldWrap label="Endpoint URL">
                            <input type="text" value={selContext.apiUrl}
                              onChange={(e) => updateContext({ apiUrl: e.target.value })}
                              placeholder="https://api.yourcompany.com/customers/{phone}"
                              className={cn(inputCls, "font-mono text-[13px]")} />
                          </FieldWrap>
                          <div className="grid grid-cols-2 gap-3">
                            <FieldWrap label="Auth type">
                              <select value={selContext.apiAuthType}
                                onChange={(e) => updateContext({ apiAuthType: e.target.value as "none" | "bearer" | "apiKey" })}
                                className="w-full appearance-none bg-transparent text-sm outline-none cursor-pointer">
                                <option value="none">None</option>
                                <option value="bearer">Bearer token</option>
                                <option value="apiKey">API key</option>
                              </select>
                            </FieldWrap>
                            {selContext.apiAuthType !== "none" && (
                              <FieldWrap label={selContext.apiAuthType === "bearer" ? "Bearer token" : "API key"}>
                                <input type="password" value={selContext.apiAuthValue}
                                  onChange={(e) => updateContext({ apiAuthValue: e.target.value })}
                                  className={cn(inputCls, "font-mono")} />
                              </FieldWrap>
                            )}
                          </div>
                        </div>

                        {/* Prebuilt fields */}
                        <div className="rounded-lg border border-[#e7e7f0] bg-white p-4">
                          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#737373]">Fields shown in the pre-call modal</p>
                          <div className="flex flex-col gap-2">
                            {selContext.fields.filter((f) => !f.isCustom).map((field) => (
                              <div key={field.id} className="flex items-center gap-3 rounded-lg border border-[#f0f0f0] bg-[#fafafa] px-3 py-2.5">
                                <button type="button" onClick={() => toggleContextField(field.id)} className="shrink-0">
                                  {field.enabled
                                    ? <ToggleRight className="size-6 text-purple-600" strokeWidth={1.5} />
                                    : <ToggleLeft className="size-6 text-[#c0c0c0]" strokeWidth={1.5} />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className={cn("text-sm font-medium", field.enabled ? "text-[#0a0a0a]" : "text-[#c0c0c0]")}>{field.label}</p>
                                  <p className="text-[11px] text-[#a0a0a0]">{field.source === "leadRecord" ? "From lead record" : `API path: ${field.apiPath || "not set"}`} · {field.type}</p>
                                </div>
                              </div>
                            ))}

                            {/* Custom fields */}
                            {selContext.fields.filter((f) => f.isCustom).map((field) => (
                              <div key={field.id} className="flex items-center gap-3 rounded-lg border border-purple-100 bg-purple-50/30 px-3 py-2.5">
                                <button type="button" onClick={() => toggleContextField(field.id)} className="shrink-0">
                                  {field.enabled
                                    ? <ToggleRight className="size-6 text-purple-600" strokeWidth={1.5} />
                                    : <ToggleLeft className="size-6 text-[#c0c0c0]" strokeWidth={1.5} />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[#0a0a0a]">{field.label} <span className="ml-1 text-[10px] font-semibold uppercase text-purple-500">Custom</span></p>
                                  <p className="text-[11px] text-[#a0a0a0]">API path: {field.apiPath || "not set"} · {field.type}</p>
                                </div>
                                <button type="button"
                                  onClick={() => updateContext({ fields: selContext.fields.filter((f) => f.id !== field.id) })}
                                  className="flex size-6 shrink-0 items-center justify-center rounded text-[#c0c0c0] hover:text-[#e11d48]">
                                  <X className="size-3" strokeWidth={2} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Add custom field */}
                          <AddCustomContextField onAdd={addCustomContextField} />
                        </div>
                      </div>
                    )}
                </div>

                {/* ④ Customer 360 (per campaign) ────────────────────────── */}
                <div>
                    <SectionHead
                      title="Customer 360 — Left Panel"
                      subtitle="What the agent sees during a live call. Basic Info and Call History are always shown. Add custom sections backed by your APIs."
                    />
                    {/* Always-on */}
                    <div className="mb-4 flex flex-col gap-2">
                      {[
                        { icon: "Users", label: "Basic Info", desc: "Name, phone, email, tags — from lead record" },
                        { icon: "Phone", label: "Call History", desc: "Previous calls, notes, outcomes — tracked by OMNI" },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center gap-3 rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-4 py-3 opacity-70">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white border border-[#e7e7f0]">
                            <DynIcon name={s.icon} className="size-4 text-[#737373]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#0a0a0a]">{s.label}</p>
                            <p className="text-[11px] text-[#a0a0a0]">{s.desc}</p>
                          </div>
                          <span className="rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#a0a0a0]">Built-in</span>
                        </div>
                      ))}
                    </div>

                    {/* Custom sections */}
                    <div className="flex flex-col gap-2">
                      {config.customSections
                        .filter((s) => s.campaignIds.length === 0 || (selectedCampaignId && s.campaignIds.includes(selectedCampaignId)))
                        .map((section) => {
                          if (editingSectionId === section.id) {
                            return (
                              <SectionEditor key={section.id}
                                initial={{ name: section.name, icon: section.icon, enabled: section.enabled, apiUrl: section.apiUrl, apiAuthType: section.apiAuthType, apiAuthValue: section.apiAuthValue, fields: section.fields, campaignIds: section.campaignIds }}
                                campaigns={config.campaigns}
                                onSave={(s) => { updateConfig({ customSections: config.customSections.map((x) => x.id === section.id ? s : x) }); setEditingSectionId(null); }}
                                onCancel={() => setEditingSectionId(null)}
                              />
                            );
                          }
                          return (
                            <div key={section.id} className="flex items-center gap-3 rounded-xl border border-[#e7e7f0] bg-white px-4 py-3">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f5]">
                                <DynIcon name={section.icon} className="size-4 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#0a0a0a]">{section.name}</p>
                                <p className="text-[11px] text-[#a0a0a0]">
                                  {section.apiUrl ? <span className="font-mono text-[10px]">{section.apiUrl.length > 50 ? section.apiUrl.slice(0, 50) + "…" : section.apiUrl}</span> : "No API configured"}
                                  {" · "}{section.fields.length} {section.fields.length === 1 ? "field" : "fields"}
                                  {section.campaignIds.length > 0 && ` · ${section.campaignIds.length} campaign${section.campaignIds.length > 1 ? "s" : ""}`}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button type="button" onClick={() => setEditingSectionId(section.id)}
                                  className="rounded-lg border border-[#e7e7f0] bg-white px-3 py-1.5 text-[12px] font-medium text-[#737373] hover:bg-[#f5f5f5]">Edit</button>
                                <button type="button" onClick={() => updateConfig({ customSections: config.customSections.map((s) => s.id === section.id ? { ...s, enabled: !s.enabled } : s) })}>
                                  {section.enabled ? <ToggleRight className="size-6 text-purple-600" strokeWidth={1.5} /> : <ToggleLeft className="size-6 text-[#c0c0c0]" strokeWidth={1.5} />}
                                </button>
                                <button type="button" onClick={() => updateConfig({ customSections: config.customSections.filter((s) => s.id !== section.id) })}
                                  className="flex size-7 items-center justify-center rounded-md text-[#c0c0c0] hover:bg-[#fff1f2] hover:text-[#e11d48]">
                                  <Trash2 className="size-3.5" strokeWidth={1.75} />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                      {addingSection && !editingSectionId && (
                        <SectionEditor
                          initial={{ ...BLANK_SECTION, campaignIds: selectedCampaignId ? [selectedCampaignId] : [] }}
                          campaigns={config.campaigns}
                          onSave={(s) => { updateConfig({ customSections: [...config.customSections, s] }); setAddingSection(false); }}
                          onCancel={() => setAddingSection(false)}
                        />
                      )}

                      {!addingSection && !editingSectionId && (
                        <button type="button" onClick={() => setAddingSection(true)}
                          className="flex items-center gap-2 rounded-lg border border-dashed border-[#d4d4d4] bg-white px-4 py-3 text-sm font-medium text-[#737373] hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600">
                          <Plus className="size-4 shrink-0" strokeWidth={1.75} />
                          Add custom section
                        </button>
                      )}
                    </div>
                </div>

                {/* ⑤ AI Copilot (per campaign) ──────────────────────────── */}
                <div>
                    <SectionHead
                      title="AI Copilot"
                      subtitle={`Scripts and actions${selectedCampaign ? ` for: ${selectedCampaign.name}` : " — select a campaign above to configure each one separately."}`}
                    />
                    {!selectedCampaignId ? (
                      <div className="rounded-lg border border-dashed border-[#e7e7f0] bg-[#fafafa] px-5 py-6 text-center">
                        <p className="text-[13px] text-[#a0a0a0]">Add a campaign above to configure its AI scripts and CTAs.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <FieldWrap label="Opening script">
                          <textarea value={selCopilot.openingScript} rows={3} className={textareaCls}
                            onChange={(e) => updateCopilot({ openingScript: e.target.value })}
                            placeholder={`e.g. "Hi, I'm [Agent] from [Company]. I saw you were looking at [Product] — do you have 2 minutes?"`} />
                        </FieldWrap>
                        <FieldWrap label="Objection handling">
                          <textarea value={selCopilot.objectionHandling} rows={3} className={textareaCls}
                            onChange={(e) => updateCopilot({ objectionHandling: e.target.value })}
                            placeholder={`e.g. "I understand the cost feels high. Many customers felt the same but found the value far outweighed it…"`} />
                        </FieldWrap>
                        <FieldWrap label="Closing script">
                          <textarea value={selCopilot.closingScript} rows={3} className={textareaCls}
                            onChange={(e) => updateCopilot({ closingScript: e.target.value })}
                            placeholder={`e.g. "Based on what you've shared, I'd recommend [Plan] — shall I go ahead and set it up?"`} />
                        </FieldWrap>
                        <OrderedList
                          label="Predictive CTAs"
                          subtitle="Buttons the AI surfaces after each response, contextually"
                          items={selCopilot.predictiveCTAs}
                          onChange={(v) => updateCopilot({ predictiveCTAs: v })}
                          suggestions={PREDICTIVE_CTA_SUGGESTIONS}
                          placeholder="e.g. Resume Quote…"
                        />
                        <OrderedList
                          label="Quick Actions"
                          subtitle="Shortcuts the agent fires from the chat input bar — always visible"
                          items={selCopilot.quickActions}
                          onChange={(v) => updateCopilot({ quickActions: v })}
                          suggestions={QUICK_ACTION_SUGGESTIONS}
                          placeholder="e.g. Send SMS…"
                        />
                      </div>
                    )}
                </div>

                {/* ⑥ Power Tools (global) ───────────────────────────────── */}
                <div>
                    <SectionHead title="Power Tools — Right Pane" subtitle="Shortcuts visible to agents during every call. Each tool opens a URL in a new tab." />
                    <div className="flex flex-col gap-2">
                      {config.powerTools.map((tool) => (
                        <div key={tool.id} className="flex items-center gap-3 rounded-xl border border-[#e7e7f0] bg-white px-4 py-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f5]">
                            <DynIcon name={tool.icon} className="size-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#0a0a0a]">{tool.name}</p>
                            <p className="font-mono text-[11px] text-[#a0a0a0] truncate">{tool.url}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <a href={tool.url} target="_blank" rel="noopener noreferrer"
                              className="flex size-7 items-center justify-center rounded-md border border-[#e7e7f0] bg-white text-[#a0a0a0] hover:text-purple-600">
                              <ExternalLink className="size-3.5" strokeWidth={1.75} />
                            </a>
                            <button type="button" onClick={() => updateConfig({ powerTools: config.powerTools.filter((t) => t.id !== tool.id) })}
                              className="flex size-7 items-center justify-center rounded-md text-[#c0c0c0] hover:bg-[#fff1f2] hover:text-[#e11d48]">
                              <Trash2 className="size-3.5" strokeWidth={1.75} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {addingPowerTool ? (
                        <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4 flex flex-col gap-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">New tool</p>
                          <div className="grid grid-cols-2 gap-3">
                            <FieldWrap label="Tool name">
                              <input autoFocus type="text" value={newPowerToolName} onChange={(e) => setNewPowerToolName(e.target.value)}
                                placeholder="e.g. Quote Portal" className={inputCls} />
                            </FieldWrap>
                            <FieldWrap label="URL">
                              <input type="text" value={newPowerToolUrl} onChange={(e) => setNewPowerToolUrl(e.target.value)}
                                placeholder="https://quote.company.com" className={cn(inputCls, "font-mono text-[13px]")} />
                            </FieldWrap>
                            <FieldWrap label="Description (optional)" span2>
                              <input type="text" value={newPowerToolDesc} onChange={(e) => setNewPowerToolDesc(e.target.value)}
                                placeholder="What does this tool do?" className={inputCls} />
                            </FieldWrap>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={addPowerTool} disabled={!newPowerToolName.trim() || !newPowerToolUrl.trim()}
                              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-40">Add tool</button>
                            <button type="button" onClick={() => setAddingPowerTool(false)} className="rounded-lg border border-[#e5e5e5] bg-white px-4 py-2 text-sm font-medium text-[#737373] hover:bg-[#f5f5f5]">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setAddingPowerTool(true)}
                          className="flex items-center gap-2 rounded-lg border border-dashed border-[#d4d4d4] bg-white px-4 py-3 text-sm font-medium text-[#737373] hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600">
                          <Plus className="size-4 shrink-0" strokeWidth={1.75} />
                          Add tool
                        </button>
                      )}
                    </div>
                </div>

                {/* ⑦ Dispositions ───────────────────────────────────────── */}
                <div>
                    <SectionHead title="Dispositions" subtitle="Post-call outcomes the agent must select after every call. Agents cannot end a call without selecting one." />
                    <OrderedList
                      label="Dispositions"
                      subtitle="Ordered by most common first"
                      items={config.dispositions}
                      onChange={(v) => updateConfig({ dispositions: v })}
                      suggestions={DISPOSITION_SUGGESTIONS}
                      placeholder="e.g. No Budget…"
                    />
                </div>

                {/* ⑧ Knowledge Base ─────────────────────────────────────── */}
                <div>
                    <SectionHead title="Knowledge Base" subtitle="Documents the AI refers to during calls — product brochures, pricing sheets, FAQs, call scripts." />
                    <div className="flex flex-col gap-2">
                      {config.knowledgeFiles.map((f) => (
                        <div key={f.name + f.uploadedAt} className="flex items-center gap-3 rounded-lg border border-[#e7e7f0] bg-white px-4 py-3">
                          <FileText className="size-4 shrink-0 text-[#737373]" strokeWidth={1.5} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{f.name}</p>
                            <p className="text-[11px] text-[#a0a0a0]">Added {new Date(f.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                          </div>
                          <button type="button" onClick={() => updateConfig({ knowledgeFiles: config.knowledgeFiles.filter((kf) => kf.name !== f.name) })}
                            className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#c0c0c0] hover:bg-[#fff1f2] hover:text-[#e11d48]">
                            <X className="size-3.5" strokeWidth={1.75} />
                          </button>
                        </div>
                      ))}
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#d4d4d4] bg-white px-6 py-8 text-center hover:border-purple-400 hover:bg-purple-50">
                        <Upload className="size-5 text-[#a0a0a0]" strokeWidth={1.5} />
                        <div>
                          <p className="text-sm font-medium text-[#737373]">Upload documents</p>
                          <p className="text-[11px] text-[#a0a0a0] mt-0.5">PDF, DOCX, TXT — product brochures, pricing sheets, FAQs</p>
                        </div>
                        <input type="file" multiple accept=".pdf,.doc,.docx,.txt" className="hidden"
                          onChange={(e) => { const files = Array.from(e.target.files ?? []); updateConfig({ knowledgeFiles: [...config.knowledgeFiles, ...files.map((f) => ({ name: f.name, uploadedAt: Date.now() }))] }); e.target.value = ""; }} />
                      </label>
                    </div>
                </div>

                {/* Employees ─────────────────────────────────────────────── */}
                <div>
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#a0a0a0]">Employees</p>
                        <p className="mt-1 text-[12px] text-[#737373]">Admins configure the app. Managers add agents and view team performance. Agents take calls.</p>
                      </div>
                      <button type="button" onClick={() => setShowAddEmployee(true)}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-purple-700">
                        <Plus className="size-3.5" strokeWidth={2} />Add employee
                      </button>
                    </div>
                    <div className="mb-5 grid grid-cols-3 gap-3">
                      {[
                        { icon: <ShieldCheck className="size-4 text-purple-600" strokeWidth={1.75} />, role: "Admin", desc: "Full access — configure app, manage all teams" },
                        { icon: <UserCog className="size-4 text-blue-600" strokeWidth={1.75} />, role: "Manager", desc: "Add agents to their team, view team performance" },
                        { icon: <UserCircle2 className="size-4 text-[#737373]" strokeWidth={1.75} />, role: "Agent", desc: "Use the app, take calls, log dispositions" },
                      ].map(({ icon, role, desc }) => (
                        <div key={role} className="flex items-start gap-3 rounded-xl border border-[#e7e7f0] bg-white p-3.5">
                          <div className="mt-0.5 shrink-0">{icon}</div>
                          <div><p className="text-[13px] font-semibold text-[#0a0a0a]">{role}</p><p className="mt-0.5 text-[11px] leading-[1.4] text-[#737373]">{desc}</p></div>
                        </div>
                      ))}
                    </div>
                    {config.employees.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#e7e7f0] bg-white py-16 text-center">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-[#f5f5f5]"><Users className="size-5 text-[#a0a0a0]" strokeWidth={1.5} /></div>
                        <p className="text-sm font-medium">No employees yet</p>
                        <button type="button" onClick={() => setShowAddEmployee(true)} className="mt-1 flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-purple-700">
                          <Plus className="size-3.5" strokeWidth={2} />Add first employee
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-xl border border-[#e7e7f0] bg-white">
                        <div className="grid grid-cols-[1fr_1fr_100px_80px_36px] border-b border-[#f0f0f0] px-4 py-2.5">
                          {["Name", "Email", "Role", "Team", ""].map((h) => <span key={h} className="text-[11px] font-semibold uppercase tracking-wider text-[#a0a0a0]">{h}</span>)}
                        </div>
                        {config.employees.map((emp, i) => (
                          <div key={emp.id} className={cn("grid grid-cols-[1fr_1fr_100px_80px_36px] items-center px-4 py-3", i < config.employees.length - 1 && "border-b border-[#f0f0f0]")}>
                            <span className="text-sm font-medium truncate pr-2">{emp.name}</span>
                            <span className="text-sm text-[#737373] truncate pr-2">{emp.email}</span>
                            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium w-fit", { admin: "bg-purple-50 text-purple-700", manager: "bg-blue-50 text-blue-700", agent: "bg-[#f5f5f5] text-[#737373]" }[emp.role])}>{emp.role}</span>
                            <span className="text-[12px] text-[#737373] truncate">{emp.team || "—"}</span>
                            <button type="button" onClick={() => updateConfig({ employees: config.employees.filter((e) => e.id !== emp.id) })}
                              className="flex size-7 items-center justify-center rounded-md text-[#c0c0c0] hover:bg-[#fff1f2] hover:text-[#e11d48]">
                              <Trash2 className="size-3.5" strokeWidth={1.75} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* Skill File ─────────────────────────────────────────────── */}
                <div>
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#a0a0a0]">Skill File</p>
                        <p className="mt-1 text-[12px] text-[#737373]">Auto-generated from your configuration. Powers the AI's in-call intelligence.</p>
                      </div>
                      {skillReady && (
                        <button type="button" onClick={() => { navigator.clipboard.writeText(skillContent).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
                          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[12px] font-medium shadow-sm hover:bg-[#f5f5f5]">
                          {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      )}
                    </div>
                    {skillReady ? (
                      <div className="overflow-hidden rounded-xl border border-[#e7e7f0] bg-[#0e0e0e]">
                        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                          <div className="flex gap-1.5"><span className="size-3 rounded-full bg-[#ff5f57]" /><span className="size-3 rounded-full bg-[#ffbd2e]" /><span className="size-3 rounded-full bg-[#28c840]" /></div>
                          <span className="ml-2 text-[11px] text-white/40">sales.skill.md</span>
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap break-words px-5 py-5 font-mono text-[13px] leading-[1.7] text-white/80">{skillContent}</pre>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#e7e7f0] bg-white py-20 text-center">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-[#f5f5f5]"><FileText className="size-5 text-[#a0a0a0]" /></div>
                        <p className="text-sm font-medium">No skill file yet</p>
                        <p className="max-w-[280px] text-[12px] leading-[1.5] text-[#737373]">Create your first campaign to generate the skill file.</p>
                      </div>
                    )}
                </div>

              </div>
            </div>
        </div>

        {/* ── AI Copilot chat ──────────────────────────────────────────────── */}
        <div className="flex w-[360px] shrink-0 flex-col bg-white">
          <div className="flex shrink-0 items-center gap-2 border-b border-[#e7e7f0] px-4 py-3">
            <div className="flex size-6 items-center justify-center rounded-full bg-purple-600">
              <Sparkles className="size-3 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-[#0a0a0a]">AI Copilot</span>
            <span className="ml-1 text-[11px] text-[#a0a0a0]">— tell me what to configure</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-3">
              {messages.map((msg, i) => {
                if (msg.role === "flash") {
                  return (
                    <div key={i} className="flex flex-wrap gap-1">
                      {(msg as { role: "flash"; fields: string[] }).fields.map((f) => <FlashBadge key={f} field={f} />)}
                    </div>
                  );
                }
                return (
                  <div key={i} className={cn("flex flex-col gap-1 animate-fade-in", msg.role === "user" ? "items-end" : "items-start")}>
                    {msg.role === "ai" && (
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="flex size-4 items-center justify-center rounded-full bg-purple-600">
                          <Sparkles className="size-2 text-white" />
                        </div>
                        <span className="text-[10px] font-medium text-[#a0a0a0]">OMNI</span>
                      </div>
                    )}
                    <div className={cn("rounded-2xl px-3 py-2 text-[13px] leading-[1.55]",
                      msg.role === "ai" ? "rounded-tl-sm border border-[#e5e5e5] bg-[#fafafa] text-[#0a0a0a] max-w-[95%]" : "rounded-tr-sm bg-purple-600 text-white max-w-[90%]")}>
                      {renderText(msg.text)}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex items-start gap-1.5 animate-fade-in">
                  <div className="flex size-4 items-center justify-center rounded-full bg-purple-600">
                    <Sparkles className="size-2 text-white" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-[#e5e5e5] bg-[#fafafa] px-3 py-2.5">
                    {[0, 1, 2].map((j) => (
                      <span key={j} className="h-1.5 w-1.5 rounded-full bg-[#d4d4d4]" style={{ animation: `dotBounce 1.2s ease-in-out ${j * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-[#e7e7f0] px-4 py-3">
            <div className="flex items-center gap-2 rounded-xl border border-[#e7e7f0] bg-[#fafafa] px-3 py-2.5">
              <input ref={inputRef} type="text" value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                disabled={isTyping}
                placeholder='e.g. "Add campaign: Fresh Lead"'
                className="flex-1 bg-transparent text-[13px] placeholder:text-[#a0a0a0] outline-none disabled:opacity-40"
                autoFocus
              />
              <button type="button" onClick={handleSend} disabled={!input.trim() || isTyping}
                className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40">
                <Send className="size-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddEmployee && (
        <AddEmployeeModal
          onAdd={(emp) => updateConfig({ employees: [...config.employees, { id: `emp-${Date.now()}`, ...emp }] })}
          onClose={() => setShowAddEmployee(false)}
        />
      )}
    </div>
  );
}

// ─── Add Custom Context Field (inline form) ───────────────────────────────────

function AddCustomContextField({ onAdd }: { onAdd: (f: Omit<OpeningContextField, "id">) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"text" | "badge" | "date" | "number" | "boolean">("text");
  const [apiPath, setApiPath] = useState("");

  function submit() {
    if (!label.trim()) return;
    onAdd({ key: `custom-${Date.now()}`, label: label.trim(), type, source: "api", apiPath, enabled: true, isCustom: true });
    setLabel(""); setApiPath(""); setType("text"); setOpen(false);
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-[#d4d4d4] bg-white px-3 py-2 text-[12px] font-medium text-[#737373] hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600">
        <Plus className="size-3.5 shrink-0" strokeWidth={1.75} />
        Add custom field
      </button>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-lg border border-purple-200 bg-purple-50/30 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">Custom field</p>
      <div className="grid grid-cols-3 gap-2">
        <input autoFocus type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Field label…"
          className="rounded-md border border-[#e7e7f0] bg-white px-2.5 py-1.5 text-[12px] placeholder:text-[#c0c0c0] outline-none" />
        <select value={type} onChange={(e) => setType(e.target.value as typeof type)}
          className="rounded-md border border-[#e7e7f0] bg-white px-2.5 py-1.5 text-[12px] appearance-none outline-none cursor-pointer">
          <option value="text">Text</option>
          <option value="badge">Badge</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="boolean">Yes/No</option>
        </select>
        <input type="text" value={apiPath} onChange={(e) => setApiPath(e.target.value)} placeholder="JSON path…"
          className="rounded-md border border-[#e7e7f0] bg-white px-2.5 py-1.5 font-mono text-[12px] placeholder:text-[#c0c0c0] outline-none" />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={submit} disabled={!label.trim()}
          className="rounded-lg bg-purple-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-purple-700 disabled:opacity-40">Add</button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-[#e5e5e5] bg-white px-3 py-1.5 text-[12px] font-medium text-[#737373] hover:bg-[#f5f5f5]">Cancel</button>
      </div>
    </div>
  );
}
