import { ArrowLeft, ChevronRight, Search, Instagram, Linkedin, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

const CHANNELS = [
  {
    id: "seo",
    label: "SEO",
    icon: Search,
    description: "AI-written articles optimised for search ranking",
    available: true,
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: Instagram,
    description: "Visual content & captions for Instagram",
    available: false,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    description: "Thought-leadership posts for LinkedIn",
    available: false,
  },
  {
    id: "x",
    label: "X",
    icon: Twitter,
    description: "Threads and posts for X (Twitter)",
    available: false,
  },
];

interface MediaChannelPickerProps {
  onBack: () => void;
  onSelectChannel: (channelId: string) => void;
}

export default function MediaChannelPicker({ onBack, onSelectChannel }: MediaChannelPickerProps) {
  return (
    <main className="flex flex-1 flex-col overflow-y-auto bg-[#fafafa] px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2.5">
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
        <span className="text-sm text-[#0a0a0a] leading-5">Media</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#0a0a0a] tracking-tight leading-none mb-1.5">
          Media
        </h1>
        <p className="text-sm text-[#737373] leading-5">
          Choose a channel to create your campaign
        </p>
      </div>

      {/* Channel cards */}
      <div className="grid grid-cols-4 gap-4 max-w-[720px]">
        {CHANNELS.map((channel) => {
          const Icon = channel.icon;
          return (
            <button
              key={channel.id}
              type="button"
              disabled={!channel.available}
              onClick={() => channel.available && onSelectChannel(channel.id)}
              className={cn(
                "relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all",
                channel.available
                  ? "border-[#e7e7f0] bg-white hover:border-purple-200 hover:shadow-md cursor-pointer"
                  : "border-[#e7e7f0] bg-[#fafafa] cursor-not-allowed opacity-60"
              )}
            >
              {!channel.available && (
                <span className="absolute right-2.5 top-2.5 rounded-full bg-[#f0f0f0] px-2 py-0.5 text-[11px] font-medium text-[#737373]">
                  Soon
                </span>
              )}
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg",
                  channel.available ? "bg-purple-100" : "bg-[#f0f0f0]"
                )}
              >
                <Icon
                  className={cn(
                    "size-5",
                    channel.available ? "text-purple-600" : "text-[#a0a0a0]"
                  )}
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0a0a0a] leading-none mb-1">
                  {channel.label}
                </p>
                <p className="text-xs text-[#737373] leading-[1.4]">
                  {channel.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}
