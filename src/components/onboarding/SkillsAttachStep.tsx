import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Upload } from "lucide-react";

interface SkillsAttachStepProps {
  onAnalyse: (file: File) => void;
}

export default function SkillsAttachStep({ onAnalyse }: SkillsAttachStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!f.name.endsWith(".md")) return;
    setFile(f);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[22px] font-bold leading-[1.3] text-[#0a0a0a]">
          Attach your skills file
        </h2>
        <p className="text-sm leading-5 text-[#737373]">
          Upload your <code className="rounded bg-[#f0f0f0] px-1 py-0.5 text-xs font-mono text-[#0a0a0a]">skills.md</code> file. We'll analyse it to understand your team's capabilities and identify any gaps.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={[
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-all",
          dragOver
            ? "border-purple-500 bg-purple-50"
            : file
            ? "border-purple-400 bg-purple-50/60"
            : "border-[#d4d4d4] bg-[#fafafa] hover:border-purple-400 hover:bg-purple-50/40",
        ].join(" ")}
      >
        {file ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex flex-col items-center gap-0.5 text-center">
              <span className="text-sm font-semibold text-[#0a0a0a]">{file.name}</span>
              <span className="text-xs text-[#737373]">
                {(file.size / 1024).toFixed(1)} KB · Click to replace
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f0f0]">
              <Upload className="h-6 w-6 text-[#737373]" />
            </div>
            <div className="flex flex-col items-center gap-0.5 text-center">
              <span className="text-sm font-medium text-[#0a0a0a]">
                Drop your <span className="text-purple-600">skills.md</span> here
              </span>
              <span className="text-xs text-[#737373]">or click to browse — .md files only</span>
            </div>
          </>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".md"
        className="hidden"
        onChange={handleInputChange}
      />

      <Button
        onClick={() => file && onAnalyse(file)}
        disabled={!file}
        className="w-full h-[38px] rounded-md text-sm font-semibold disabled:opacity-40"
      >
        Analyse Skills File
      </Button>
    </div>
  );
}
