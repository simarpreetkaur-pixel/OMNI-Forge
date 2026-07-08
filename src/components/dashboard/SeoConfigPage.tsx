import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowLeft, ChevronRight, Send, Sparkles,
  ToggleLeft, ToggleRight, Copy, Check, FileText, Key,
  CheckCircle2, Newspaper, Settings2, Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseMessage } from "@/lib/seoAiParser";
import { generateSkillFile, isSkillFileReady } from "@/lib/seoSkillFile";
import { useOrg } from "@/context/OrgContext";
import SecretEntryModal from "@/components/dashboard/SecretEntryModal";
import type { SeoConfig } from "@/types/seo";
import {
  EMPTY_SEO_CONFIG,
  GOAL_OPTIONS,
  TONE_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  ARTICLE_LENGTH_OPTIONS,
  CADENCE_OPTIONS,
  DESTINATION_OPTIONS,
  OUTPUT_FORMAT_OPTIONS,
  CTA_TYPE_OPTIONS,
} from "@/types/seo";

// ─── Types ────────────────────────────────────────────────────────────────────

type FlowStep = 0 | 1 | 2 | "secret" | "done";
type Tab = "ai" | "config" | "skill-file";
type Message =
  | { role: "ai"; text: string }
  | { role: "user"; text: string }
  | { role: "building"; text: string }
  | { role: "action"; type: "add-secret" }
  | { role: "action"; type: "agent-created"; agentName: string }
  | { role: "action"; type: "app-created"; appName: string; goal: string; articleLength: string };

interface SeoConfigPageProps {
  orgId: string;
  appId: string;
  appName?: string;
  onBack: () => void;
  initialConfig?: SeoConfig | null;
  initialTimestamp?: number | null;
  /** True when the app already exists in My Apps (i.e. full setup was completed previously) */
  isAlreadySaved?: boolean;
}

// ─── Guided flow (3 questions) ────────────────────────────────────────────────

function parseArticleLength(val: string): string {
  const lower = val.toLowerCase();
  if (lower.includes("short") || lower.includes("500") || lower.includes("800")) return "500–800 words";
  if (lower.includes("medium") || lower.includes("1000") || lower.includes("1,000") || lower.includes("1500")) return "1,000–1,500 words";
  if (lower.includes("long") || lower.includes("2000") || lower.includes("2,000")) return "2,000–3,000 words";
  if (lower.includes("pillar") || lower.includes("3000") || lower.includes("4000") || lower.includes("5000")) return "3,000+ words";
  return "";
}

function getStepResponse(completedStep: FlowStep, config: SeoConfig): string {
  switch (completedStep) {
    case 0: {
      const name = config.campaignName || "your app";
      return `Great name — **${name}**!\n\nStep 2 of 3: What's the **primary goal** of your SEO content?\n\nExamples: Lead generation, Brand awareness, Organic traffic growth, Thought leadership, Product education`;
    }
    case 1: {
      const goal = config.goal || "your goal";
      return `Got it — **${goal}**.\n\nStep 3 of 3: What's your preferred **article length**?\n\nOptions:\n• Short (500–800 words)\n• Medium (1,000–1,500 words)\n• Long-form (2,000–3,000 words)\n• Pillar content (3,000+ words)`;
    }
    case 2: {
      const length = config.articleLength || "your preference";
      return `Perfect — **${length}**.\n\nYour app is almost ready! One last step: to activate it and connect to your publishing platform, add your integration credentials below.`;
    }
    default:
      return "";
  }
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

function renderText(text: string) {
  return text.split("\n").map((line, li, arr) => {
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return (
      <span key={li}>
        {parts.map((part, pi) =>
          pi % 2 === 1 ? (
            <strong key={pi} className="font-semibold text-[#0a0a0a]">{part}</strong>
          ) : part
        )}
        {li < arr.length - 1 && <br />}
      </span>
    );
  });
}

// ─── Form sub-components ──────────────────────────────────────────────────────

function SectionHeading({ title }: { title: string }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#a0a0a0]">
      {title}
    </p>
  );
}

function AiBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-purple-600">
      <Sparkles className="size-2.5 shrink-0" />
      AI
    </span>
  );
}

function FieldWrap({
  label, aiUpdated, flashing, children,
}: {
  label: string; aiUpdated?: boolean; flashing?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "flex flex-col gap-1.5 rounded-lg border px-3 py-2.5 transition-colors duration-300 bg-white",
      flashing ? "border-purple-300 bg-purple-50/60" : "border-[#e7e7f0]"
    )}>
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">{label}</label>
        {aiUpdated && <AiBadge />}
      </div>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-transparent text-sm text-[#0a0a0a] placeholder:text-[#c0c0c0] outline-none leading-5";
const selectCls = "w-full appearance-none bg-transparent text-sm text-[#0a0a0a] outline-none leading-5 cursor-pointer";

function ToggleRow({
  checked, onChange, label, description, aiUpdated, flashing,
}: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
  description?: string; aiUpdated?: boolean; flashing?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-300 bg-white",
      flashing ? "border-purple-300 bg-purple-50/60" : "border-[#e7e7f0]"
    )}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#0a0a0a]">{label}</span>
          {aiUpdated && <AiBadge />}
        </div>
        {description && <span className="text-[11px] leading-[1.3] text-[#a0a0a0]">{description}</span>}
      </div>
      <button
        type="button" onClick={() => onChange(!checked)}
        className="shrink-0" role="switch" aria-checked={checked}
      >
        {checked
          ? <ToggleRight className="size-7 text-purple-600" strokeWidth={1.5} />
          : <ToggleLeft className="size-7 text-[#c0c0c0]" strokeWidth={1.5} />
        }
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SeoConfigPage({
  orgId, appId, appName, onBack, initialConfig, initialTimestamp, isAlreadySaved,
}: SeoConfigPageProps) {
  const { setAppConfig, getConfigTimestamp, addApp, addVirtualEmployee, activeOrgId } = useOrg();

  // editMode = app already exists in My Apps (full setup was done before)
  const isEditMode = !!isAlreadySaved;

  // ── State ─────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("ai");
  const [config, setConfig] = useState<SeoConfig>(initialConfig ?? EMPTY_SEO_CONFIG);
  const [aiUpdated, setAiUpdated] = useState<Partial<Record<keyof SeoConfig, boolean>>>({});
  const [flashing, setFlashing] = useState<Partial<Record<keyof SeoConfig, boolean>>>({});
  const [pendingAiKeys, setPendingAiKeys] = useState<(keyof SeoConfig)[]>([]);
  const [flowStep, setFlowStep] = useState<FlowStep>(isEditMode ? "done" : 0);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [secretModalOpen, setSecretModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const greetedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auto-save ─────────────────────────────────────────────────────────────
  // For new apps (not yet in My Apps), we never auto-save partial state —
  // config is persisted only once the full 5-step flow completes.
  const scheduleAutoSave = useCallback((cfg: SeoConfig) => {
    if (!isEditMode) return; // new app: defer until handleSecretSaved
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setAppConfig(orgId, appId, cfg);
    }, 400);
  }, [orgId, appId, setAppConfig, isEditMode]);

  useEffect(() => () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); }, []);

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Flash fields when switching to config tab after AI changes ────────────
  useEffect(() => {
    if (activeTab === "config" && pendingAiKeys.length > 0) {
      const on: Partial<Record<keyof SeoConfig, boolean>> = {};
      pendingAiKeys.forEach((k) => { on[k] = true; });
      setFlashing(on);
      setPendingAiKeys([]);
      setTimeout(() => setFlashing({}), 1400);
    }
  }, [activeTab, pendingAiKeys]);

  // ── Initial greeting ──────────────────────────────────────────────────────
  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;

    setIsTyping(true);
    const t = setTimeout(() => {
      let greeting: string;
      if (isEditMode && initialConfig) {
        const name = initialConfig.campaignName?.trim() || "your SEO app";
        greeting = `Welcome back to **${name}**!\n\nDescribe what you'd like to change, or ask me anything about optimising your setup.`;
      } else {
        greeting = `Hi! Let's get your SEO app set up — just **3 quick questions**.\n\nStep 1 of 3: **What would you like to name this app?**\n\nExamples: "Fintech Blog Engine", "Product SEO Hub", "ACKO Organic Growth"`;
      }
      setMessages([{ role: "ai", text: greeting }]);
      setIsTyping(false);
    }, 700);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Field helpers ─────────────────────────────────────────────────────────
  function updateField<K extends keyof SeoConfig>(key: K, value: SeoConfig[K]) {
    setConfig((prev) => {
      const next = { ...prev, [key]: value };
      scheduleAutoSave(next);
      return next;
    });
    setAiUpdated((prev) => ({ ...prev, [key]: false }));
  }

  function toggleContentType(type: string) {
    const current = config.contentTypes ?? [];
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    updateField("contentTypes", next);
  }

  // ── AI send ───────────────────────────────────────────────────────────────
  function handleSend() {
    const val = input.trim();
    if (!val || isTyping) return;

    setMessages((prev) => [...prev, { role: "user", text: val }]);
    setInput("");
    setIsTyping(true);

    if (flowStep !== "done" && flowStep !== "secret") {
      // Guided flow: map each answer directly to a config field
      const currentStep = flowStep as number;

      let stepUpdate: Partial<SeoConfig> = {};
      let stepKeys: (keyof SeoConfig)[] = [];

      if (currentStep === 0) {
        stepUpdate = { campaignName: val.trim() };
        stepKeys = ["campaignName"];
      } else if (currentStep === 1) {
        stepUpdate = { goal: val.trim() };
        stepKeys = ["goal"];
      } else if (currentStep === 2) {
        stepUpdate = { articleLength: parseArticleLength(val) || val.trim() };
        stepKeys = ["articleLength"];
      }

      const latestConfig = { ...config, ...stepUpdate };

      if (stepKeys.length > 0) {
        setConfig(latestConfig);
        setAiUpdated((prev) => {
          const n = { ...prev };
          stepKeys.forEach((k) => { n[k] = true; });
          return n;
        });
        setPendingAiKeys((prev) => [...new Set([...prev, ...stepKeys])]);
      }

      const nextStep = currentStep + 1;

      setTimeout(() => {
        if (nextStep <= 2) {
          const response = getStepResponse(currentStep as FlowStep, latestConfig);
          setMessages((prev) => [...prev, { role: "ai", text: response }]);
          setFlowStep(nextStep as FlowStep);
        } else {
          // All 3 questions answered → secret step
          const response = getStepResponse(2 as FlowStep, latestConfig);
          setMessages((prev) => [
            ...prev,
            { role: "ai", text: response },
            { role: "action", type: "add-secret" },
          ]);
          setFlowStep("secret");
        }
        setIsTyping(false);
        inputRef.current?.focus();
      }, 650 + Math.random() * 200);

    } else {
      // Free-form mode (edit mode or post-setup)
      const result = parseMessage(val, config);

      if (result.fieldsUpdated.length > 0) {
        setConfig((prev) => {
          const next = { ...prev, ...result.updates };
          scheduleAutoSave(next);
          return next;
        });
        setAiUpdated((prev) => {
          const n = { ...prev };
          result.fieldsUpdated.forEach((k) => { n[k] = true; });
          return n;
        });
        setPendingAiKeys((prev) => [...new Set([...prev, ...result.fieldsUpdated])]);
      }

      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "ai", text: result.response }]);
        setIsTyping(false);
        inputRef.current?.focus();
      }, 550 + Math.random() * 250);
    }
  }

  // ── Secret saved ──────────────────────────────────────────────────────────
  function handleSecretSaved() {
    setSecretModalOpen(false);

    const autoName = config.campaignName?.trim() || appName || "SEO Campaign";
    const finalConfig = { ...config, campaignName: autoName };
    const agentName = `${autoName} Agent`;

    // Stream building steps into chat
    const buildingSteps = [
      "Saving credentials securely...",
      "Configuring SEO content pipeline...",
      `Creating **${agentName}** virtual employee...`,
      "Provisioning runtime environment...",
    ];

    setIsBuilding(true);

    buildingSteps.forEach((text, i) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "building", text } as Message]);
      }, 300 + i * 720);
    });

    // After all steps finish: persist state, create VE, show success
    const totalDelay = 300 + (buildingSteps.length - 1) * 720 + 500;

    setTimeout(() => {
      setConfig(finalConfig);
      setAppConfig(orgId, appId, finalConfig);

      if (!isEditMode) {
        addApp(orgId, {
          id: appId,
          name: autoName,
          description: "AI-powered SEO content automation",
        });

        // Auto-create the SEO Agent as a virtual employee
        const currentOrgId = activeOrgId ?? orgId;
        const seoAgentCreatedAt = Date.now();
        addVirtualEmployee(currentOrgId, {
          id: `ve-seo-${seoAgentCreatedAt}`,
          name: agentName,
          description: `${agentName} is a dedicated AI virtual employee configured to autonomously manage the ${autoName} SEO content strategy. It researches trending keywords, drafts fully optimised articles, inserts internal links, and schedules publication — all without manual intervention. Primary goal: ${finalConfig.goal || "organic traffic growth"}. Content length: ${finalConfig.articleLength || "Medium (1,000–1,500 words)"}. Industry focus: ${finalConfig.industry || "General"}. Target audience: ${finalConfig.targetAudience || "Defined in configuration"}.`,
          role: "Member",
          status: ["connected", "runtime · active"],
          apiKey: `neo_S-${Math.random().toString(36).slice(2, 12)}-SeoAgent`,
          orgId: currentOrgId,
          appAccess: [autoName],
          createdAt: seoAgentCreatedAt,
        });
      }

      setFlowStep("done");
      setIsBuilding(false);

      // Show agent-created micro card
      setMessages((prev) => [
        ...prev,
        { role: "action", type: "agent-created", agentName } as Message,
      ]);

      // Then show app success card
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "action",
            type: "app-created",
            appName: autoName,
            goal: finalConfig.goal || "",
            articleLength: finalConfig.articleLength || "",
          },
        ]);
        setIsTyping(false);
      }, 800);
    }, totalDelay);
  }

  // ── Back navigation guard ─────────────────────────────────────────────────
  // For new apps that aren't fully set up yet, ask before discarding.
  function handleBack() {
    if (!isEditMode && flowStep !== "done") {
      setDiscardConfirmOpen(true);
      return;
    }
    onBack();
  }

  // ── Copy skill file ───────────────────────────────────────────────────────
  function handleCopy() {
    const ts = getConfigTimestamp(orgId, appId) ?? initialTimestamp ?? null;
    navigator.clipboard.writeText(generateSkillFile(config, ts)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  const skillFileTs = getConfigTimestamp(orgId, appId) ?? initialTimestamp ?? null;
  const skillFileContent = generateSkillFile(config, skillFileTs);
  const skillFileReady = isSkillFileReady(config);

  const TABS: { id: Tab; label: string }[] = [
    { id: "ai", label: "AI Assistant" },
    { id: "config", label: "Configuration" },
    { id: "skill-file", label: "Skill File" },
  ];

  // ── Progress indicator for guided flow ────────────────────────────────────
  const stepNum = flowStep === "done" || flowStep === "secret" ? 3 : (flowStep as number);
  const isGuided = flowStep !== "done";

  return (
    <>
      <main className="flex flex-1 flex-col overflow-hidden bg-[#fafafa]">
        {/* Breadcrumb */}
        <div className="flex shrink-0 items-center gap-2.5 border-b border-[#e7e7f0] bg-white px-8 py-3.5">
          <button
            type="button" onClick={handleBack}
            className="flex size-8 items-center justify-center rounded-md border border-[#e5e5e5] bg-white shadow-sm transition-colors hover:bg-[#f5f5f5]"
          >
            <ArrowLeft className="size-4 text-[#0a0a0a]" />
          </button>
          <button type="button" onClick={handleBack} className="text-sm text-[#737373] transition-colors hover:text-[#0a0a0a]">
            Apps
          </button>
          <ChevronRight className="size-3.5 text-[#a0a0a0]" />
          <span className="text-sm text-[#737373]">Media</span>
          <ChevronRight className="size-3.5 text-[#a0a0a0]" />
          <span className="text-sm font-medium text-[#0a0a0a]">{appName ?? "SEO Campaign"}</span>
          {isEditMode && (
            <span className="ml-1 rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-[11px] font-medium text-[#737373]">
              Editing
            </span>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex shrink-0 items-end gap-0 border-b border-[#e7e7f0] bg-white px-8">
          {TABS.map((tab) => (
            <button
              key={tab.id} type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex h-10 items-center gap-1.5 px-4 text-sm transition-colors",
                activeTab === tab.id
                  ? "font-semibold text-purple-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-purple-600"
                  : "font-medium text-[#737373] hover:text-[#0a0a0a]"
              )}
            >
              {tab.id === "skill-file" && <FileText className="size-3.5 shrink-0" />}
              {tab.label}
            </button>
          ))}

          {/* Guided flow progress */}
          {isGuided && activeTab === "ai" && flowStep !== "secret" && (
            <div className="ml-auto flex items-center gap-2 pb-1 pr-1">
              <span className="text-[11px] text-[#a0a0a0]">Step {stepNum + 1} of 3</span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i <= stepNum ? "w-4 bg-purple-500" : "w-1.5 bg-[#e0e0e0]"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">

          {/* ══ Tab 1: AI Chat ══ */}
          {activeTab === "ai" && (
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="mx-auto flex max-w-[680px] flex-col gap-3">
                  {messages.map((msg, i) => {
                    if (msg.role === "action" && msg.type === "add-secret") {
                      return (
                        <div key={i} className="self-start animate-fade-in">
                          <button
                            type="button"
                            onClick={() => setSecretModalOpen(true)}
                            className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
                          >
                            <Key className="size-4 shrink-0" />
                            Add integration credentials →
                          </button>
                        </div>
                      );
                    }

                    if (msg.role === "building") {
                      return (
                        <div key={i} className="flex items-center gap-2.5 animate-fade-in py-0.5">
                          <Check className="size-3.5 shrink-0 text-green-500" strokeWidth={2.5} />
                          <span className="text-[13px] text-[#737373]">{renderText(msg.text)}</span>
                        </div>
                      );
                    }

                    if (msg.role === "action" && msg.type === "agent-created") {
                      return (
                        <div key={i} className="self-start animate-fade-in">
                          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 shadow-sm">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                              <Bot className="size-4 text-emerald-700" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-emerald-800">
                                {msg.agentName} is live!
                              </p>
                              <p className="text-[11px] text-emerald-600">
                                Added to Workforce → Virtual Employees
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-wide">
                                New
                              </span>
                              <span className="text-[10px] text-emerald-400">↑ Sidebar</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (msg.role === "action" && msg.type === "app-created") {
                      return (
                        <div key={i} className="self-start w-full max-w-[88%] animate-fade-in">
                          <div className="mb-0.5 flex items-center gap-1.5">
                            <div className="flex size-5 items-center justify-center rounded-full bg-purple-600">
                              <Sparkles className="size-2.5 text-white" />
                            </div>
                            <span className="text-[11px] font-medium text-[#737373]">OMNI Forge</span>
                          </div>
                          {/* Success card */}
                          <div className="overflow-hidden rounded-2xl rounded-tl-sm border border-green-200 bg-white shadow-sm">
                            {/* Green top banner */}
                            <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3.5">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                                <CheckCircle2 className="size-5 text-white" strokeWidth={2} />
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-white">App is live!</p>
                                <p className="text-[11px] text-white/80">Your SEO app is active and ready to generate articles</p>
                              </div>
                            </div>

                            {/* App name + details */}
                            <div className="px-4 py-4">
                              <p className="text-[17px] font-bold text-[#0a0a0a]">{msg.appName}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {msg.goal && (
                                  <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-medium text-purple-700">
                                    🎯 {msg.goal}
                                  </span>
                                )}
                                {msg.articleLength && (
                                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                                    📝 {msg.articleLength}
                                  </span>
                                )}
                                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700">
                                  ✓ Credentials saved
                                </span>
                              </div>

                              {/* CTA buttons */}
                              <div className="mt-4 flex gap-2">
                                <button
                                  type="button"
                                  onClick={onBack}
                                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0a0a0a] px-3 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#262626]"
                                >
                                  <Newspaper className="size-3.5 shrink-0" strokeWidth={2} />
                                  Generate articles
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveTab("config")}
                                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] font-medium text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
                                >
                                  <Settings2 className="size-3.5 shrink-0" strokeWidth={1.5} />
                                  Configuration
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex max-w-[88%] flex-col gap-1 animate-fade-in",
                          msg.role === "user" ? "self-end items-end" : "self-start items-start"
                        )}
                      >
                        {msg.role === "ai" && (
                          <div className="mb-0.5 flex items-center gap-1.5">
                            <div className="flex size-5 items-center justify-center rounded-full bg-purple-600">
                              <Sparkles className="size-2.5 text-white" />
                            </div>
                            <span className="text-[11px] font-medium text-[#737373]">OMNI Forge</span>
                          </div>
                        )}
                        <div className={cn(
                          "rounded-2xl px-3.5 py-2.5 text-sm leading-[1.55]",
                          msg.role === "ai"
                            ? "rounded-tl-sm border border-[#e5e5e5] bg-white text-[#0a0a0a]"
                            : "rounded-tr-sm bg-purple-600 text-white"
                        )}>
                          {renderText(msg.text)}
                        </div>
                      </div>
                    );
                  })}

                  {isTyping && (
                    <div className="flex max-w-[88%] flex-col gap-1 self-start items-start animate-fade-in">
                      <div className="mb-0.5 flex items-center gap-1.5">
                        <div className="flex size-5 items-center justify-center rounded-full bg-purple-600">
                          <Sparkles className="size-2.5 text-white" />
                        </div>
                        <span className="text-[11px] font-medium text-[#737373]">OMNI Forge</span>
                      </div>
                      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-[#e5e5e5] bg-white px-4 py-3">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-1.5 w-1.5 rounded-full bg-[#d4d4d4]"
                            style={{ animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>
              </div>

              {/* Input */}
              <div className="shrink-0 border-t border-[#e7e7f0] bg-white px-8 py-4">
                <div className="mx-auto flex max-w-[680px] items-center gap-3 rounded-xl border border-[#e7e7f0] bg-[#fafafa] px-4 py-2.5">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                    disabled={isTyping || flowStep === "secret" || isBuilding}
                    placeholder={
                      isBuilding
                        ? "Setting up your app…"
                        : flowStep === "secret"
                        ? "Add your credentials above to continue…"
                        : flowStep === "done"
                        ? "Ask a question or describe a change…"
                        : "Type your answer…"
                    }
                    className="flex-1 bg-transparent text-sm text-[#0a0a0a] placeholder:text-[#a0a0a0] outline-none leading-5 disabled:opacity-40"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping || flowStep === "secret" || isBuilding}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ Tab 2: Configuration ══ */}
          {activeTab === "config" && (
            <div className="h-full overflow-y-auto px-8 py-6">
              <div className="mx-auto max-w-[880px]">
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">

                  {/* Campaign Basics */}
                  <div className="col-span-2">
                    <SectionHeading title="Campaign Basics" />
                    <div className="grid grid-cols-2 gap-3">
                      <FieldWrap label="Campaign name" aiUpdated={aiUpdated.campaignName} flashing={flashing.campaignName}>
                        <input type="text" value={config.campaignName}
                          onChange={(e) => updateField("campaignName", e.target.value)}
                          placeholder="e.g. Fintech SEO Q3 2026" className={inputCls} />
                      </FieldWrap>
                      <FieldWrap label="Goal" aiUpdated={aiUpdated.goal} flashing={flashing.goal}>
                        <select value={config.goal}
                          onChange={(e) => updateField("goal", e.target.value)}
                          className={cn(selectCls, !config.goal && "text-[#c0c0c0]")}>
                          <option value="" disabled>Select goal…</option>
                          {GOAL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </FieldWrap>
                      <FieldWrap label="Industry" aiUpdated={aiUpdated.industry} flashing={flashing.industry}>
                        <input type="text" value={config.industry}
                          onChange={(e) => updateField("industry", e.target.value)}
                          placeholder="e.g. Fintech, SaaS, Insurance" className={inputCls} />
                      </FieldWrap>
                      <FieldWrap label="Target audience" aiUpdated={aiUpdated.targetAudience} flashing={flashing.targetAudience}>
                        <input type="text" value={config.targetAudience}
                          onChange={(e) => updateField("targetAudience", e.target.value)}
                          placeholder="e.g. Fintech startup founders" className={inputCls} />
                      </FieldWrap>
                      <FieldWrap label="Country / Region" aiUpdated={aiUpdated.country} flashing={flashing.country}>
                        <input type="text" value={config.country}
                          onChange={(e) => updateField("country", e.target.value)}
                          placeholder="e.g. India, Global" className={inputCls} />
                      </FieldWrap>
                      <FieldWrap label="Seed keywords" aiUpdated={aiUpdated.seedKeywords} flashing={flashing.seedKeywords}>
                        <textarea value={config.seedKeywords}
                          onChange={(e) => updateField("seedKeywords", e.target.value)}
                          placeholder="e.g. expense management software, fintech tools"
                          rows={2} className={cn(inputCls, "resize-none")} />
                      </FieldWrap>
                    </div>
                  </div>

                  {/* Content Settings */}
                  <div className="col-span-2">
                    <SectionHeading title="Content Settings" />
                    <div className="grid grid-cols-2 gap-3">
                      <FieldWrap label="Tone" aiUpdated={aiUpdated.tone} flashing={flashing.tone}>
                        <select value={config.tone}
                          onChange={(e) => updateField("tone", e.target.value)}
                          className={cn(selectCls, !config.tone && "text-[#c0c0c0]")}>
                          <option value="" disabled>Select tone…</option>
                          {TONE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </FieldWrap>
                      <FieldWrap label="Article length" aiUpdated={aiUpdated.articleLength} flashing={flashing.articleLength}>
                        <select value={config.articleLength}
                          onChange={(e) => updateField("articleLength", e.target.value)}
                          className={cn(selectCls, !config.articleLength && "text-[#c0c0c0]")}>
                          <option value="" disabled>Select length…</option>
                          {ARTICLE_LENGTH_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </FieldWrap>
                      <FieldWrap label="Publishing cadence" aiUpdated={aiUpdated.publishingCadence} flashing={flashing.publishingCadence}>
                        <select value={config.publishingCadence}
                          onChange={(e) => updateField("publishingCadence", e.target.value)}
                          className={cn(selectCls, !config.publishingCadence && "text-[#c0c0c0]")}>
                          <option value="" disabled>Select cadence…</option>
                          {CADENCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </FieldWrap>
                      <FieldWrap label="Content types" aiUpdated={aiUpdated.contentTypes} flashing={flashing.contentTypes}>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {CONTENT_TYPE_OPTIONS.map((type) => {
                            const active = config.contentTypes.includes(type);
                            return (
                              <button key={type} type="button" onClick={() => toggleContentType(type)}
                                className={cn(
                                  "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                                  active ? "border-purple-300 bg-purple-100 text-purple-700" : "border-[#e0e0e0] bg-white text-[#737373] hover:border-[#c0c0c0]"
                                )}>
                                {type}
                              </button>
                            );
                          })}
                        </div>
                      </FieldWrap>
                    </div>
                  </div>

                  {/* SEO Features */}
                  <div className="col-span-2">
                    <SectionHeading title="SEO Features" />
                    <div className="grid grid-cols-2 gap-3">
                      <ToggleRow checked={config.competitorAnalysis} onChange={(v) => updateField("competitorAnalysis", v)} label="Competitor analysis" description="Identify keyword gaps vs. competitors" aiUpdated={aiUpdated.competitorAnalysis} flashing={flashing.competitorAnalysis} />
                      <ToggleRow checked={config.internalLinking} onChange={(v) => updateField("internalLinking", v)} label="Internal linking" description="Auto-suggest relevant internal links" aiUpdated={aiUpdated.internalLinking} flashing={flashing.internalLinking} />
                      <ToggleRow checked={config.metaDescriptions} onChange={(v) => updateField("metaDescriptions", v)} label="Auto meta descriptions" description="Generate optimised meta descriptions" aiUpdated={aiUpdated.metaDescriptions} flashing={flashing.metaDescriptions} />
                      <ToggleRow checked={config.schemaMarkup} onChange={(v) => updateField("schemaMarkup", v)} label="Schema markup" description="Add structured data for rich snippets" aiUpdated={aiUpdated.schemaMarkup} flashing={flashing.schemaMarkup} />
                      <ToggleRow checked={config.faqSections} onChange={(v) => updateField("faqSections", v)} label="FAQ sections" description="Include a FAQ at the end of each article" aiUpdated={aiUpdated.faqSections} flashing={flashing.faqSections} />
                      <ToggleRow checked={config.featuredSnippets} onChange={(v) => updateField("featuredSnippets", v)} label="Featured snippet optimisation" description="Structure articles for position zero" aiUpdated={aiUpdated.featuredSnippets} flashing={flashing.featuredSnippets} />
                    </div>
                  </div>

                  {/* Publishing */}
                  <div>
                    <SectionHeading title="Publishing" />
                    <div className="flex flex-col gap-3">
                      <FieldWrap label="Destination" aiUpdated={aiUpdated.destination} flashing={flashing.destination}>
                        <select value={config.destination}
                          onChange={(e) => updateField("destination", e.target.value)}
                          className={cn(selectCls, !config.destination && "text-[#c0c0c0]")}>
                          <option value="" disabled>Select platform…</option>
                          {DESTINATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </FieldWrap>
                      <FieldWrap label="Output format" aiUpdated={aiUpdated.outputFormat} flashing={flashing.outputFormat}>
                        <select value={config.outputFormat}
                          onChange={(e) => updateField("outputFormat", e.target.value)}
                          className={cn(selectCls, !config.outputFormat && "text-[#c0c0c0]")}>
                          <option value="" disabled>Select format…</option>
                          {OUTPUT_FORMAT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </FieldWrap>
                    </div>
                  </div>

                  {/* CTA */}
                  <div>
                    <SectionHeading title="CTA Configuration" />
                    <div className="flex flex-col gap-3">
                      <FieldWrap label="CTA type" aiUpdated={aiUpdated.ctaType} flashing={flashing.ctaType}>
                        <select value={config.ctaType}
                          onChange={(e) => updateField("ctaType", e.target.value)}
                          className={cn(selectCls, !config.ctaType && "text-[#c0c0c0]")}>
                          <option value="" disabled>Select type…</option>
                          {CTA_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </FieldWrap>
                      <FieldWrap label="CTA text" aiUpdated={aiUpdated.ctaText} flashing={flashing.ctaText}>
                        <input type="text" value={config.ctaText}
                          onChange={(e) => updateField("ctaText", e.target.value)}
                          placeholder="e.g. Book a Free Demo" className={inputCls} />
                      </FieldWrap>
                      <FieldWrap label="CTA URL" aiUpdated={aiUpdated.ctaUrl} flashing={flashing.ctaUrl}>
                        <input type="text" value={config.ctaUrl}
                          onChange={(e) => updateField("ctaUrl", e.target.value)}
                          placeholder="e.g. https://acko.com/demo" className={inputCls} />
                      </FieldWrap>
                    </div>
                  </div>
                </div>
                <div className="h-8" />
              </div>
            </div>
          )}

          {/* ══ Tab 3: Skill File ══ */}
          {activeTab === "skill-file" && (
            <div className="h-full overflow-y-auto px-8 py-6">
              <div className="mx-auto max-w-[720px]">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[15px] font-semibold text-[#0a0a0a]">Skill File</h2>
                    <p className="mt-0.5 text-[12px] text-[#737373]">
                      Auto-generated from your configuration. Powers everything this app produces.
                    </p>
                  </div>
                  {skillFileReady && (
                    <button type="button" onClick={handleCopy}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[12px] font-medium text-[#0a0a0a] shadow-sm transition-colors hover:bg-[#f5f5f5]">
                      {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  )}
                </div>

                {skillFileReady ? (
                  <div className="overflow-hidden rounded-xl border border-[#e7e7f0] bg-[#0e0e0e]">
                    <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="size-3 rounded-full bg-[#ff5f57]" />
                        <span className="size-3 rounded-full bg-[#ffbd2e]" />
                        <span className="size-3 rounded-full bg-[#28c840]" />
                      </div>
                      <span className="ml-2 text-[11px] text-white/40">
                        {config.campaignName?.trim() || "campaign"}.skill.md
                      </span>
                      {skillFileTs && (
                        <span className="ml-auto text-[11px] text-white/30">
                          Last updated{" "}
                          {new Date(skillFileTs).toLocaleString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap break-words px-5 py-5 font-mono text-[13px] leading-[1.7] text-white/80">
                      {skillFileContent}
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#e7e7f0] bg-white py-20 text-center">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[#f5f5f5]">
                      <FileText className="size-5 text-[#a0a0a0]" />
                    </div>
                    <p className="text-sm font-medium text-[#0a0a0a]">No skill file yet</p>
                    <p className="max-w-[280px] text-[12px] leading-[1.5] text-[#737373]">
                      Complete the AI assistant setup or fill in the Configuration tab to generate your skill file.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <SecretEntryModal
        isOpen={secretModalOpen}
        platform={config.destination || undefined}
        onClose={() => setSecretModalOpen(false)}
        onSave={handleSecretSaved}
      />

      {/* ── Discard confirmation ── */}
      {discardConfirmOpen && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setDiscardConfirmOpen(false)}
          />
          <div className="relative z-10 w-full max-w-[360px] rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-[15px] font-semibold text-[#0a0a0a]">Discard this app setup?</h2>
            <p className="mt-2 text-sm leading-[1.5] text-[#737373]">
              You haven't finished configuring this app. If you go back now, your progress will be
              lost and the app won't appear in My Apps.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => { setDiscardConfirmOpen(false); onBack(); }}
                className="flex-1 rounded-lg border border-[#e5e5e5] bg-white py-2 text-sm font-medium text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => setDiscardConfirmOpen(false)}
                className="flex-1 rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
              >
                Continue setup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
