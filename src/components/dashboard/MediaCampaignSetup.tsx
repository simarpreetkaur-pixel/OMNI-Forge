import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ChevronRight, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfigField {
  key: string;
  label: string;
  value: string | null;
  required: boolean;
}

const INITIAL_FIELDS: ConfigField[] = [
  { key: "goal", label: "Campaign goal", value: null, required: true },
  { key: "audience", label: "Target audience", value: null, required: true },
  { key: "keywords", label: "Seed keywords", value: null, required: true },
  { key: "cadence", label: "Publishing cadence", value: null, required: true },
  { key: "length", label: "Article length", value: null, required: true },
  { key: "destination", label: "Publishing destination", value: null, required: true },
  { key: "enhancements", label: "SEO enhancements", value: null, required: true },
];

const QUESTIONS = [
  "What is the primary goal of this SEO campaign? (e.g. brand awareness, lead generation, product sign-ups)",
  "Which target audience are you writing for? (e.g. SaaS founders, HR managers, developers)",
  "What are your top 3–5 seed keywords or topics you want to rank for?",
  "How many articles do you want published per month?",
  "What is the average word count you are targeting per article? (e.g. 800, 1500, 2500)",
  "Which CMS or publishing platform should articles be pushed to? (e.g. WordPress, Webflow, Notion, custom API)",
  "Should articles include internal linking suggestions, meta descriptions, and schema markup automatically? (yes / no / specify)",
];

const FIELD_KEYS = ["goal", "audience", "keywords", "cadence", "length", "destination", "enhancements"];

type Message =
  | { role: "ai"; text: string }
  | { role: "user"; text: string };

interface MediaCampaignSetupProps {
  channel: string;
  onBack: () => void;
  onSave: (fields: ConfigField[]) => void;
}

export default function MediaCampaignSetup({ channel, onBack, onSave }: MediaCampaignSetupProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [fields, setFields] = useState<ConfigField[]>(INITIAL_FIELDS);
  const [currentQ, setCurrentQ] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const channelLabel = channel === "seo" ? "SEO" : channel;

  // Ask first question on mount
  useEffect(() => {
    setIsTyping(true);
    const t1 = setTimeout(() => {
      setMessages([
        {
          role: "ai",
          text: `Let's set up your ${channelLabel} campaign. I'll ask you ${QUESTIONS.length} quick questions and fill in your configuration as we go.`,
        },
      ]);
      setIsTyping(false);
    }, 600);

    const t2 = setTimeout(() => setIsTyping(true), 1000);

    const t3 = setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: QUESTIONS[0] }]);
      setIsTyping(false);
    }, 1900);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [channelLabel]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSend() {
    const val = inputValue.trim();
    if (!val || isTyping || allDone) return;

    setMessages((prev) => [...prev, { role: "user", text: val }]);
    setInputValue("");

    // Fill corresponding config field
    const fieldKey = FIELD_KEYS[currentQ];
    setFields((prev) =>
      prev.map((f) => (f.key === fieldKey ? { ...f, value: val } : f))
    );

    const nextQ = currentQ + 1;

    if (nextQ < QUESTIONS.length) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "ai", text: QUESTIONS[nextQ] }]);
        setIsTyping(false);
        setCurrentQ(nextQ);
        inputRef.current?.focus();
      }, 800);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "All done! Your campaign configuration is ready. Click Save configuration to add this to your apps.",
          },
        ]);
        setIsTyping(false);
        setAllDone(true);
      }, 800);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const filledCount = fields.filter((f) => f.value !== null).length;
  const allFilled = fields.every((f) => !f.required || f.value !== null);

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-[#fafafa]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2.5 px-8 pt-8 pb-4 shrink-0">
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
        <span className="text-sm text-[#737373] leading-5">Media</span>
        <ChevronRight className="size-3.5 text-[#737373]" />
        <span className="text-sm text-[#0a0a0a] leading-5">{channelLabel}</span>
      </div>

      {/* Two-column body */}
      <div className="flex flex-1 overflow-hidden px-8 pb-8 gap-5">

        {/* LEFT — AI Chat */}
        <div className="flex flex-1 flex-col rounded-xl border border-[#e7e7f0] bg-white overflow-hidden">
          {/* Chat header */}
          <div className="shrink-0 border-b border-[#e7e7f0] px-5 py-4">
            <p className="text-[15px] font-semibold text-[#0a0a0a] leading-none">
              Set up your {channelLabel} campaign
            </p>
            <p className="mt-1 text-xs text-[#737373]">
              Answer a few questions and your config will fill in automatically
            </p>
          </div>

          {/* Message thread */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex max-w-[88%] flex-col gap-1 animate-fade-in",
                  msg.role === "user" ? "self-end items-end" : "self-start items-start"
                )}
              >
                {msg.role === "ai" && (
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600">
                      <span className="text-[9px] font-bold text-white">AI</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#737373]">OMNI Forge</span>
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-sm leading-5",
                    msg.role === "ai"
                      ? "rounded-tl-sm bg-[#fafafa] border border-[#e5e5e5] text-[#0a0a0a]"
                      : "rounded-tr-sm bg-purple-600 text-white"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex max-w-[88%] flex-col gap-1 self-start items-start">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600">
                    <span className="text-[9px] font-bold text-white">AI</span>
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

          {/* Input bar */}
          <div className="shrink-0 border-t border-[#e7e7f0] px-4 py-3">
            {allDone ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="size-4 shrink-0" />
                All questions answered — save your configuration
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping || allDone}
                  placeholder="Type your answer…"
                  className="flex-1 bg-transparent text-sm text-[#0a0a0a] placeholder:text-[#a0a0a0] outline-none leading-5 disabled:opacity-50"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping || allDone}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-600 text-white transition-colors hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Live Config Panel */}
        <div className="flex w-[340px] shrink-0 flex-col rounded-xl border border-[#e7e7f0] bg-white overflow-hidden">
          {/* Config header */}
          <div className="shrink-0 border-b border-[#e7e7f0] px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold text-[#0a0a0a] leading-none">
                Campaign configuration
              </p>
              <p className="mt-1 text-xs text-[#737373]">
                {filledCount} of {fields.length} fields completed
              </p>
            </div>
            {/* Progress ring substitute — simple inline bar */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-semibold text-purple-600">
                {Math.round((filledCount / fields.length) * 100)}%
              </span>
              <div className="h-1 w-16 overflow-hidden rounded-full bg-[#e5e5e5]">
                <div
                  className="h-full rounded-full bg-purple-600 transition-all duration-500"
                  style={{ width: `${(filledCount / fields.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Fields list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
            {fields.map((field) => (
              <div
                key={field.key}
                className={cn(
                  "flex flex-col gap-1 rounded-lg border px-3 py-2.5 transition-all duration-300",
                  field.value !== null
                    ? "border-purple-200 bg-purple-50/40"
                    : "border-[#e7e7f0] bg-[#fafafa]"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-medium text-[#737373] leading-none">
                    {field.label}
                  </span>
                  {field.value !== null && (
                    <CheckCircle2 className="size-3.5 shrink-0 text-purple-500 animate-fade-in" />
                  )}
                </div>
                {field.value !== null ? (
                  <p className="text-sm text-[#0a0a0a] leading-[1.4] animate-fade-in break-words">
                    {field.value}
                  </p>
                ) : (
                  <p className="text-sm text-[#c0c0c0] leading-none">—</p>
                )}
              </div>
            ))}
          </div>

          {/* Save button */}
          <div className="shrink-0 border-t border-[#e7e7f0] px-5 py-4">
            <button
              type="button"
              disabled={!allFilled}
              onClick={() => onSave(fields)}
              className="h-9 w-full rounded-md bg-purple-600 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save configuration
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
