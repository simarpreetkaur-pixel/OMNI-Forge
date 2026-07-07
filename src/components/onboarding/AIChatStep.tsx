import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizontal } from "lucide-react";

const QUESTIONS = [
  "What is your company's primary business domain? (e.g. insurance, e-commerce, banking)",
  "Approximately how many customer support tickets does your team handle per month?",
  "Which channels do your customers use most? (email, phone, WhatsApp, chat)",
  "In which language(s) do most of your customers communicate?",
  "What are your primary escalation triggers? (e.g. complaints, refund requests, high-value customers)",
];

type Message =
  | { role: "ai"; text: string; questionIndex?: number }
  | { role: "user"; text: string };

interface AIChatStepProps {
  onSubmit: (answers: string[]) => void;
}

export default function AIChatStep({ onSubmit }: AIChatStepProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [allDone, setAllDone] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Intro message + first question on mount
  useEffect(() => {
    setIsTyping(true);
    const t1 = setTimeout(() => {
      setMessages([
        {
          role: "ai",
          text: "Hi Rajesh! I've reviewed your skills file and found a few details we still need. I'll ask you 5 quick questions to complete your configuration.",
        },
      ]);
      setIsTyping(false);
    }, 800);

    const t2 = setTimeout(() => {
      setIsTyping(true);
    }, 1200);

    const t3 = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: QUESTIONS[0], questionIndex: 0 },
      ]);
      setIsTyping(false);
    }, 2200);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSend() {
    const val = inputValue.trim();
    if (!val) return;

    const newAnswers = [...answers, val];
    setAnswers(newAnswers);
    setMessages((prev) => [...prev, { role: "user", text: val }]);
    setInputValue("");

    const nextQ = currentQ + 1;

    if (nextQ < QUESTIONS.length) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: QUESTIONS[nextQ], questionIndex: nextQ },
        ]);
        setIsTyping(false);
        setCurrentQ(nextQ);
      }, 900);
    } else {
      // All questions answered
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "That's everything I need! Your configuration is ready. Click 'Submit & Continue' to proceed.",
          },
        ]);
        setIsTyping(false);
        setAllDone(true);
      }, 900);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const showInput = !allDone && messages.some((m) => m.role === "ai" && m.questionIndex !== undefined);

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-[22px] font-bold leading-[1.3] text-[#0a0a0a]">
          A few details are missing
        </h2>
        <p className="text-sm leading-5 text-[#737373]">
          {allDone
            ? `All ${QUESTIONS.length} questions answered`
            : `Question ${Math.min(currentQ + 1, QUESTIONS.length)} of ${QUESTIONS.length}`}
        </p>
      </div>

      {/* Chat thread */}
      <div className="flex h-[320px] flex-col gap-3 overflow-y-auto rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={[
              "flex max-w-[88%] flex-col gap-1",
              msg.role === "user" ? "self-end items-end" : "self-start items-start",
            ].join(" ")}
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
              className={[
                "rounded-2xl px-3.5 py-2.5 text-sm leading-5",
                msg.role === "ai"
                  ? "rounded-tl-sm bg-white border border-[#e5e5e5] text-[#0a0a0a]"
                  : "rounded-tr-sm bg-purple-600 text-white",
              ].join(" ")}
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

      {/* Input area */}
      {showInput && (
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer…"
            className="h-9 flex-1 rounded-md border-[#e5e5e5] bg-white px-3 text-sm placeholder:text-[#737373]"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-600 text-white transition-colors hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Submit button after all answered */}
      {allDone && (
        <Button
          onClick={() => onSubmit(answers)}
          className="w-full h-[38px] rounded-md text-sm font-semibold"
        >
          Submit &amp; Continue
        </Button>
      )}
    </div>
  );
}
