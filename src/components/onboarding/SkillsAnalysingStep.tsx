import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SkillsAnalysingStepProps {
  orgCount: number;
  onDone: () => void;
  compact?: boolean;
  orgName?: string;
}

const ANALYSIS_STEPS = [
  "Reading file structure…",
  "Extracting capability definitions…",
  "Mapping team skills to OMNI modules…",
  "Identifying configuration gaps…",
  "Finalising knowledge base…",
];

export default function SkillsAnalysingStep({ orgCount, onDone, compact, orgName }: SkillsAnalysingStepProps) {
  const [progress, setProgress] = useState(0);
  const [currentLabel, setCurrentLabel] = useState(ANALYSIS_STEPS[0]);

  useEffect(() => {
    const totalMs = 5000;
    const interval = 80;
    const steps = totalMs / interval;
    let tick = 0;

    const timer = setInterval(() => {
      tick += 1;
      const pct = Math.min((tick / steps) * 100, 100);
      setProgress(pct);

      const labelIndex = Math.min(
        Math.floor((pct / 100) * ANALYSIS_STEPS.length),
        ANALYSIS_STEPS.length - 1
      );
      setCurrentLabel(ANALYSIS_STEPS[labelIndex]);

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(onDone, 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onDone]);

  return (
    <div className={cn("animate-fade-in flex flex-col", compact ? "gap-6" : "gap-8")}>
      <div className="flex flex-col gap-1">
        <h2 className={cn("font-bold leading-[1.3] text-[#0a0a0a]", compact ? "text-[18px]" : "text-[22px]")}>
          Analysing knowledge base
        </h2>
        <p className="text-sm leading-5 text-[#737373]">
          {orgName ? (
            <>
              Processing knowledge base for{" "}
              <span className="font-medium text-[#0a0a0a]">{orgName}</span>
            </>
          ) : (
            <>
              Processing knowledge base for{" "}
              <span className="font-medium text-[#0a0a0a]">
                {orgCount} organisation{orgCount > 1 ? "s" : ""}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Animated file icon */}
      <div className="flex items-center justify-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-100">
          <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 2H22L34 14V40C34 41.1 33.1 42 32 42H4C2.9 42 2 41.1 2 40V4C2 2.9 2.9 2 4 2Z"
              fill="white"
              stroke="#7c3aed"
              strokeWidth="2"
            />
            <path d="M22 2L34 14H24C22.9 14 22 13.1 22 12V2Z" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="2" />
            <line x1="8" y1="20" x2="28" y2="20" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="26" x2="28" y2="26" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="32" x2="20" y2="32" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-2xl animate-ping bg-purple-300 opacity-20" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e5e5e5]">
          <div
            className="h-full rounded-full bg-purple-600 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#737373] transition-all duration-300">{currentLabel}</span>
          <span className="text-xs font-medium text-purple-600">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Animated dots */}
      <div className="flex items-center justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-purple-400"
            style={{
              animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
