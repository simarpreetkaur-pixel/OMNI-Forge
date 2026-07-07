import { CheckCircle2 } from "lucide-react";

const PRODUCTS = [
  "Support",
  "Sales",
  "Media",
  "Insights",
  "Escalation",
  "Service OS",
];

interface ProductSetupStepProps {
  fullScreen?: boolean;
}

export default function ProductSetupStep({ fullScreen }: ProductSetupStepProps) {
  return (
    <div className={`animate-fade-in flex flex-col gap-6 ${fullScreen ? "w-full" : ""}`}>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <span className="text-sm font-medium text-green-700">Setup complete</span>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className={`font-bold leading-[1.3] text-[#0a0a0a] ${fullScreen ? "text-[28px]" : "text-[22px]"}`}>
          Great, you're all set!
        </h2>
        <p className="text-sm leading-5 text-[#737373]">
          Which product would you like to set up first?
        </p>
      </div>

      <div className={`grid gap-3 ${fullScreen ? "grid-cols-2" : "grid-cols-1"}`}>
        {PRODUCTS.map((product) => (
          <button
            key={product}
            type="button"
            className="flex items-center justify-between rounded-xl border border-[#e5e5e5] bg-white px-4 py-3.5 text-left transition-all hover:border-purple-400 hover:bg-purple-50/40 hover:shadow-sm group"
          >
            <span className="text-sm font-medium text-[#0a0a0a] group-hover:text-purple-700 transition-colors">
              {product}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="flex-shrink-0 text-[#d4d4d4] group-hover:text-purple-500 transition-colors"
            >
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
