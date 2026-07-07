import { useState, useRef } from "react";
import { Eye, EyeOff, Lock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecretEntryModalProps {
  isOpen: boolean;
  platform?: string;
  onClose: () => void;
  onSave: () => void;
}

export default function SecretEntryModal({
  isOpen,
  platform,
  onClose,
  onSave,
}: SecretEntryModalProps) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function handleSave() {
    if (!value.trim()) return;
    setValue("");
    setShow(false);
    onSave();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-[420px] rounded-2xl border border-[#e7e7f0] bg-white p-6 shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-md text-[#737373] transition-colors hover:bg-[#f5f5f5]"
        >
          <X className="size-4" />
        </button>

        {/* Icon + title */}
        <div className="mb-5 flex flex-col items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-purple-100">
            <Lock className="size-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#0a0a0a]">
              Add integration credentials
            </h2>
            <p className="mt-1 text-[12px] leading-[1.5] text-[#737373]">
              {platform
                ? `Your ${platform} API key is encrypted and stored securely.`
                : "Your API key is encrypted and stored securely."}{" "}
              It will never be displayed or logged.
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
            API key / secret
          </label>
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors",
              value ? "border-purple-300 bg-purple-50/30" : "border-[#e7e7f0] bg-white"
            )}
          >
            <input
              ref={inputRef}
              autoFocus
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="sk-••••••••••••••••••••••••"
              className="flex-1 bg-transparent font-mono text-sm text-[#0a0a0a] placeholder:text-[#c0c0c0] outline-none"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="shrink-0 text-[#a0a0a0] transition-colors hover:text-[#0a0a0a]"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-[#a0a0a0]">
            Paste your full API key. Once saved it cannot be retrieved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleSave}
            disabled={!value.trim()}
            className="flex-1 rounded-lg bg-purple-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save securely
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-medium text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
