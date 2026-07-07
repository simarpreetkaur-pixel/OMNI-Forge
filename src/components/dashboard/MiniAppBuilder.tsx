import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, ChevronRight, ChevronDown, Send, Check, RefreshCw,
  TrendingUp, Activity, BarChart2, Zap, Star, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import type { MiniApp } from "./MiniAppsTab";

// ─── Types ────────────────────────────────────────────────────────────────────

type BuilderState = "idle" | "generating" | "preview";

interface StreamLine {
  text: string;
  kind: "user" | "step" | "done";
}

// ─── Step templates ───────────────────────────────────────────────────────────

const BASE_STEPS: Omit<StreamLine, "kind">[] = [
  { text: "Analysing your request..." },
  { text: "Designing app structure and components..." },
  { text: "Building core AI engine..." },
  { text: "Setting up data modules..." },
  { text: "Integrating intelligence layer..." },
  { text: "Running quality checks..." },
];

// ─── Name extraction ──────────────────────────────────────────────────────────

function extractAppName(prompt: string): string {
  const lower = prompt.toLowerCase();
  // Named patterns
  const named = prompt.match(/(?:called|named|for)\s+["']?([A-Za-z][A-Za-z0-9 ]{1,30})["']?/i);
  if (named) return toTitleCase(named[1].trim());
  // First 3 meaningful words
  const words = prompt.trim().split(/\s+/).slice(0, 4).join(" ");
  return toTitleCase(words);
}

function toTitleCase(str: string) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractEmoji(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("health") || lower.includes("vitamin") || lower.includes("wellness")) return "💊";
  if (lower.includes("finance") || lower.includes("money") || lower.includes("budget")) return "💰";
  if (lower.includes("fitness") || lower.includes("gym") || lower.includes("workout")) return "🏋️";
  if (lower.includes("sales") || lower.includes("crm") || lower.includes("lead")) return "📈";
  if (lower.includes("travel") || lower.includes("trip") || lower.includes("booking")) return "✈️";
  if (lower.includes("food") || lower.includes("recipe") || lower.includes("meal")) return "🍽️";
  if (lower.includes("study") || lower.includes("learn") || lower.includes("education")) return "📚";
  if (lower.includes("task") || lower.includes("todo") || lower.includes("productivity")) return "✅";
  if (lower.includes("chat") || lower.includes("message") || lower.includes("communication")) return "💬";
  return "⚡";
}

// ─── Simulated app preview UI ─────────────────────────────────────────────────

function AppPreview({ appName, emoji, prompt }: { appName: string; emoji: string; prompt: string }) {
  const lower = prompt.toLowerCase();
  const isHealth = lower.includes("health") || lower.includes("vitamin") || lower.includes("wellness") || lower.includes("fitness");
  const isFinance = lower.includes("finance") || lower.includes("money") || lower.includes("budget") || lower.includes("sales");

  const metrics = isHealth
    ? [
        { label: "Daily Score", value: "87", unit: "%", change: "+5%", up: true, icon: Activity },
        { label: "Streak", value: "12", unit: "days", change: "+2", up: true, icon: Zap },
        { label: "Goals Met", value: "6", unit: "/8", change: "75%", up: false, icon: Star },
      ]
    : isFinance
    ? [
        { label: "Revenue", value: "₹2.4M", unit: "", change: "+12%", up: true, icon: TrendingUp },
        { label: "Leads", value: "348", unit: "", change: "+28", up: true, icon: Activity },
        { label: "Conversion", value: "18", unit: "%", change: "-2%", up: false, icon: BarChart2 },
      ]
    : [
        { label: "Active Users", value: "1,240", unit: "", change: "+8%", up: true, icon: Activity },
        { label: "Sessions", value: "3.8K", unit: "", change: "+15%", up: true, icon: TrendingUp },
        { label: "Avg. Score", value: "91", unit: "%", change: "+3%", up: true, icon: Star },
      ];

  const listItems = isHealth
    ? ["Vitamin D — 2000 IU", "Magnesium — 400 mg", "Omega-3 — 1000 mg", "Zinc — 15 mg", "Vitamin B12 — 500 mcg"]
    : isFinance
    ? ["Q3 Pipeline review", "New lead: Acko Enterprise", "Invoice #INV-2048 sent", "Deal closed: ₹1.2L", "Follow-up: Priya Sharma"]
    : ["Module A initialised", "Dataset synced", "Report generated", "Alert threshold set", "Last run: 2 mins ago"];

  const barHeights = [40, 65, 50, 80, 60, 90, 45, 70, 55, 85];

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#fafafa]">
      {/* App sub-header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#e7e7f0] bg-white px-6 py-4">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="text-[15px] font-semibold text-[#0a0a0a]">{appName}</p>
          <p className="text-[12px] text-[#737373]">Live preview · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 flex flex-col gap-5">
        {/* Metric cards */}
        <div className="grid grid-cols-3 gap-3">
          {metrics.map(({ label, value, unit, change, up, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-[#e7e7f0] bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a0a0a0]">{label}</span>
                <Icon className="size-3.5 text-[#a0a0a0]" strokeWidth={1.5} />
              </div>
              <p className="text-[22px] font-bold text-[#0a0a0a] leading-none">
                {value}<span className="text-[14px] font-normal text-[#737373] ml-0.5">{unit}</span>
              </p>
              <p className={cn("mt-1.5 text-[11px] font-medium", up ? "text-green-600" : "text-red-500")}>
                {up ? "↑" : "↓"} {change} vs last week
              </p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="rounded-xl border border-[#e7e7f0] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#0a0a0a]">Activity over time</p>
            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-medium text-purple-600">Last 10 days</span>
          </div>
          <div className="flex items-end gap-1.5 h-[80px]">
            {barHeights.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <div
                  className={cn("w-full rounded-t-sm", i === barHeights.indexOf(Math.max(...barHeights)) ? "bg-purple-500" : "bg-purple-200")}
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-[#c0c0c0]">
            <span>10 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* List */}
        <div className="rounded-xl border border-[#e7e7f0] bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#f0f0f0] px-4 py-3">
            <p className="text-[13px] font-semibold text-[#0a0a0a]">
              {isHealth ? "Today's intake" : isFinance ? "Recent activity" : "Latest events"}
            </p>
            <Bell className="size-4 text-[#a0a0a0]" strokeWidth={1.5} />
          </div>
          {listItems.map((item, i) => (
            <div key={i} className={cn("flex items-center gap-3 px-4 py-3", i < listItems.length - 1 && "border-b border-[#f0f0f0]")}>
              <div className={cn("size-1.5 shrink-0 rounded-full", i < 2 ? "bg-green-400" : "bg-[#d4d4d4]")} />
              <span className="flex-1 text-[13px] text-[#0a0a0a]">{item}</span>
              {i < 2 && <Check className="size-3.5 text-green-500 shrink-0" strokeWidth={2.5} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonPane() {
  return (
    <div className="flex h-full flex-col gap-5 overflow-hidden bg-[#fafafa] px-6 py-5">
      <div className="h-12 w-48 rounded-lg bg-[#f0f0f0] animate-pulse" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-[#f0f0f0] animate-pulse" />
        ))}
      </div>
      <div className="h-40 rounded-xl bg-[#f0f0f0] animate-pulse" />
      <div className="h-48 rounded-xl bg-[#f0f0f0] animate-pulse" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface MiniAppBuilderProps {
  onBack: () => void;
  onPublish: (app: MiniApp) => void;
}

export default function MiniAppBuilder({ onBack, onPublish }: MiniAppBuilderProps) {
  const { showSuccessToast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [state, setState] = useState<BuilderState>("idle");
  const [streamLines, setStreamLines] = useState<StreamLine[]>([]);
  const [publishing, setPublishing] = useState(false);
  const timerRef = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const appName = submittedPrompt ? extractAppName(submittedPrompt) : "Untitled";
  const appEmoji = submittedPrompt ? extractEmoji(submittedPrompt) : "⚡";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamLines]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  function handleSubmit() {
    const trimmed = prompt.trim();
    if (!trimmed || state !== "idle") return;
    setSubmittedPrompt(trimmed);
    setState("generating");
    setStreamLines([{ text: trimmed, kind: "user" }]);
    runStep(0, trimmed);
  }

  function runStep(index: number, _prompt: string) {
    if (index >= BASE_STEPS.length) {
      setStreamLines((prev) => [...prev, { text: "✓ App successfully created!", kind: "done" }]);
      setState("preview");
      return;
    }
    timerRef.current = window.setTimeout(() => {
      setStreamLines((prev) => [...prev, { text: BASE_STEPS[index].text, kind: "step" }]);
      runStep(index + 1, _prompt);
    }, index === 0 ? 400 : 680);
  }

  function handlePublish() {
    if (publishing) return;
    setPublishing(true);
    setTimeout(() => {
      onPublish({
        id: `mini-${Date.now()}`,
        name: appName,
        description: submittedPrompt.slice(0, 80),
        emoji: appEmoji,
      });
      showSuccessToast(`${appName} published to My Mini Apps`);
    }, 800);
  }

  // ── Idle state ─────────────────────────────────────────────────────────────
  if (state === "idle") {
    return (
      <main className="flex flex-1 flex-col overflow-hidden bg-[#fafafa]">
        {/* Breadcrumb */}
        <div className="flex shrink-0 items-center gap-2.5 border-b border-[#e7e7f0] bg-white px-8 py-3.5">
          <button
            type="button"
            onClick={onBack}
            className="flex size-8 items-center justify-center rounded-md border border-[#e5e5e5] bg-white shadow-sm transition-colors hover:bg-[#f5f5f5]"
          >
            <ArrowLeft className="size-4 text-[#0a0a0a]" />
          </button>
          <button type="button" onClick={onBack} className="text-sm text-[#737373] hover:text-[#0a0a0a]">
            Mini apps
          </button>
          <ChevronRight className="size-3.5 text-[#a0a0a0]" />
          <span className="text-sm text-[#0a0a0a]">New mini app</span>
        </div>

        {/* Centered prompt */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8">
          <div className="flex flex-col items-center gap-3">
            <img src="/omni-forge-logo.png" alt="OMNI Forge" className="h-10 w-auto" />
            <p className="text-sm text-[#737373]">What would you like to build today?</p>
          </div>

          {/* Prompt bar */}
          <PromptBar
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleSubmit}
            disabled={false}
          />
        </div>
      </main>
    );
  }

  // ── Generating / Preview — split pane ──────────────────────────────────────
  return (
    <main className="flex flex-1 overflow-hidden bg-[#fafafa]">

      {/* ── Left pane: chat stream ── */}
      <div className="flex w-[400px] shrink-0 flex-col border-r border-[#e7e7f0] bg-white">
        {/* Left header */}
        <div className="flex shrink-0 items-center gap-2.5 border-b border-[#e7e7f0] px-5 py-3.5">
          <button
            type="button"
            onClick={onBack}
            className="flex size-8 items-center justify-center rounded-md border border-[#e5e5e5] bg-white shadow-sm transition-colors hover:bg-[#f5f5f5]"
          >
            <ArrowLeft className="size-4 text-[#0a0a0a]" />
          </button>
          <button type="button" onClick={onBack} className="text-sm text-[#737373] hover:text-[#0a0a0a]">
            Mini apps
          </button>
          <ChevronRight className="size-3.5 text-[#a0a0a0]" />
          <span className="truncate text-sm font-medium text-[#0a0a0a]">{appName}</span>
        </div>

        {/* Stream */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex flex-col gap-3">
            {streamLines.map((line, i) => {
              if (line.kind === "user") {
                return (
                  <div key={i} className="self-end max-w-[85%] animate-fade-in">
                    <div className="rounded-2xl rounded-tr-sm bg-purple-600 px-4 py-2.5 text-[13px] leading-[1.5] text-white">
                      {line.text}
                    </div>
                  </div>
                );
              }
              if (line.kind === "done") {
                return (
                  <div key={i} className="flex items-center gap-2 animate-fade-in">
                    <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-green-500">
                      <Check className="size-2.5 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-[13px] font-medium text-green-600">{line.text}</span>
                  </div>
                );
              }
              // step
              return (
                <div key={i} className="flex items-start gap-2 animate-fade-in">
                  <div className="mt-1.5 size-1 shrink-0 rounded-full bg-[#c0c0c0]" />
                  <span className="text-[13px] leading-[1.6] text-[#737373]">{line.text}</span>
                </div>
              );
            })}

            {/* Typing indicator */}
            {state === "generating" && (
              <div className="flex items-center gap-1 animate-fade-in pl-3">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="size-1.5 rounded-full bg-[#c0c0c0] animate-bounce"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Prompt bar pinned at bottom */}
        <div className="shrink-0 border-t border-[#e7e7f0] px-5 py-4">
          <PromptBar
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleSubmit}
            disabled={state === "generating"}
            placeholder="Ask to change anything…"
          />
        </div>
      </div>

      {/* ── Right pane: app preview ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Right header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#e7e7f0] bg-white px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">{appEmoji}</span>
            <span className="text-[14px] font-semibold text-[#0a0a0a]">{appName}</span>
            {state === "preview" && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-600">
                Ready
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {state === "preview" && (
              <button
                type="button"
                onClick={() => setState("idle")}
                className="flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[12px] font-medium text-[#737373] transition-colors hover:bg-[#f5f5f5]"
              >
                <RefreshCw className="size-3.5 shrink-0" strokeWidth={1.5} />
                Rebuild
              </button>
            )}
            <button
              type="button"
              onClick={handlePublish}
              disabled={state !== "preview" || publishing}
              className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {publishing ? (
                <>
                  <RefreshCw className="size-3.5 shrink-0 animate-spin" strokeWidth={2} />
                  Publishing…
                </>
              ) : (
                <>
                  <Check className="size-3.5 shrink-0" strokeWidth={2.5} />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview content */}
        <div className="flex-1 overflow-hidden">
          {state === "generating" ? (
            <SkeletonPane />
          ) : (
            <AppPreview appName={appName} emoji={appEmoji} prompt={submittedPrompt} />
          )}
        </div>
      </div>
    </main>
  );
}

// ─── Reusable prompt bar ──────────────────────────────────────────────────────

function PromptBar({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "Tell me what you'd like to build…",
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  placeholder?: string;
}) {
  return (
    <div className="w-full rounded-2xl border border-[#e7e7f0] bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !disabled && onSubmit()}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-[#0a0a0a] placeholder:text-[#a0a0a0] outline-none leading-5 disabled:opacity-40"
          autoFocus={!disabled}
        />
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-[12px] text-[#737373] leading-5">Sonnet 5</span>
            <ChevronDown className="size-3 text-[#a0a0a0]" />
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            className={cn(
              "flex size-7 items-center justify-center rounded-lg transition-colors",
              !disabled && value.trim()
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "text-[#c0c0c0] cursor-default"
            )}
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
