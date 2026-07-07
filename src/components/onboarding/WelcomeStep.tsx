import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="animate-fade-in flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-[28px] font-bold leading-[1.25] text-[#0a0a0a]">
          Welcome Rajesh, let's set up your organisation with us
        </h1>
        <p className="text-sm leading-5 text-[#737373]">
          We'll walk you through a quick setup — it takes less than 5 minutes to get your organisation ready on OMNI Forge.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
        {[
          { num: "01", label: "Organisation details" },
          { num: "02", label: "Attach your skills file" },
          { num: "03", label: "AI-assisted configuration" },
        ].map(({ num, label }) => (
          <div key={num} className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-200 text-xs font-semibold text-purple-700">
              {num}
            </span>
            <span className="text-sm font-medium text-[#0a0a0a]">{label}</span>
          </div>
        ))}
      </div>

      <Button onClick={onNext} className="w-full h-[38px] rounded-md text-sm font-semibold">
        Get Started
      </Button>
    </div>
  );
}
