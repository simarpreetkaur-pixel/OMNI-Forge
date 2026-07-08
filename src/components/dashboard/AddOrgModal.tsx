import { useEffect, useState, useRef } from "react";
import { X, ChevronDown, Check, FileText, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SkillsAnalysingStep from "@/components/onboarding/SkillsAnalysingStep";
import { useOrg } from "@/context/OrgContext";
import { useToast } from "@/context/ToastContext";

const INDUSTRIES = [
  "Insurance",
  "Banking & Finance",
  "E-commerce",
  "Healthcare",
  "Technology",
  "Retail",
  "Manufacturing",
  "Education",
  "Logistics & Supply Chain",
  "Real Estate",
  "Media & Entertainment",
  "Telecommunications",
  "Other",
];

type ModalStep = "form" | "analysing";

interface AddOrgModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddOrgModal({ open, onOpenChange }: AddOrgModalProps) {
  const { orgs, addOrg } = useOrg();
  const { showSuccessToast } = useToast();
  const [step, setStep] = useState<ModalStep>("form");
  const [pendingOrgName, setPendingOrgName] = useState("");
  const [expectedOrgTotal, setExpectedOrgTotal] = useState(0);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [skillsFile, setSkillsFile] = useState<File | null>(null);
  const [industryOpen, setIndustryOpen] = useState(false);

  const logoRef = useRef<HTMLInputElement>(null);
  const skillsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setStep("form");
      setPendingOrgName("");
      setExpectedOrgTotal(0);
      setName("");
      setIndustry("");
      setWebsite("");
      setLogoPreview(null);
      setSkillsFile(null);
      setIndustryOpen(false);
    }
  }, [open]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleSkillsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setSkillsFile(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !industry.trim() || !skillsFile) return;

    const trimmedName = name.trim();
    const nextTotal = orgs.length + 1;
    addOrg({
      name: trimmedName,
      industry: industry.trim(),
      website: website.trim(),
      logoPreview,
      skillsFileName: skillsFile.name,
    });

    setPendingOrgName(trimmedName);
    setExpectedOrgTotal(nextTotal);
    setStep("analysing");
  }

  function handleAnalysisDone() {
    showSuccessToast(
      `${pendingOrgName} added successfully. You now have ${expectedOrgTotal} organisation${expectedOrgTotal > 1 ? "s" : ""}.`
    );
    onOpenChange(false);
  }

  function handleClose() {
    if (step === "analysing") return;
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-semibold leading-tight text-[#0a0a0a]">
              {step === "analysing" ? "Analysing knowledge base" : "Add another organisation"}
            </h2>
            {step === "form" && (
              <p className="text-[14px] text-[#737373]">
                {orgs.length > 0
                  ? `${orgs.length} organisation${orgs.length > 1 ? "s" : ""} already added`
                  : "Set up a new organisation on OMNI Forge"}
              </p>
            )}
          </div>
          {step !== "analysing" && (
            <button
              type="button"
              onClick={handleClose}
              className="flex size-8 items-center justify-center rounded-lg text-[#737373] hover:bg-[#f5f5f5] transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {step === "analysing" && (
          <SkillsAnalysingStep
            orgCount={1}
            orgName={pendingOrgName}
            compact
            onDone={handleAnalysisDone}
          />
        )}

        {step === "form" && (
          <>
            {orgs.length > 0 && (
              <div className="mb-5 flex flex-col gap-2">
                {orgs.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center gap-3 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2"
                  >
                    {org.logoPreview ? (
                      <img
                        src={org.logoPreview}
                        alt={org.name}
                        className="size-8 rounded-md object-contain border border-[#e5e5e5]"
                      />
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded-md bg-purple-100">
                        <Building2 className="size-4 text-purple-600" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#0a0a0a]">{org.name}</p>
                      <p className="truncate text-xs text-[#737373]">{org.industry}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label className="text-[13px] font-medium text-[#0a0a0a]">Organisation logo</Label>
                <div className="flex items-center gap-3">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="size-12 rounded-lg object-cover border border-[#e7e7f0]"
                    />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-lg border border-dashed border-[#d4d4d4] bg-[#fafafa]">
                      <Building2 className="size-5 text-[#d4d4d4]" />
                    </div>
                  )}
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoRef.current?.click()}
                  >
                    {logoPreview ? "Change logo" : "Upload logo"}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="modal-org-name" className="text-[13px] font-medium text-[#0a0a0a]">
                  Organisation name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="modal-org-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acko General Insurance"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-[13px] font-medium text-[#0a0a0a]">
                  Industry <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIndustryOpen((v) => !v)}
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-[#e7e7f0] bg-white px-3 text-[14px] text-[#0a0a0a] hover:border-[#d4d4d4] transition-colors"
                  >
                    <span className={industry ? "text-[#0a0a0a]" : "text-[#737373]"}>
                      {industry || "Select industry"}
                    </span>
                    <ChevronDown
                      className={`size-4 text-[#737373] transition-transform ${industryOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {industryOpen && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-[200px] overflow-y-auto rounded-lg border border-[#e7e7f0] bg-white shadow-lg">
                      {INDUSTRIES.map((ind) => (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => { setIndustry(ind); setIndustryOpen(false); }}
                          className="flex w-full items-center justify-between px-3 py-2 text-[14px] text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors"
                        >
                          {ind}
                          {industry === ind && <Check className="size-4 text-purple-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="modal-website" className="text-[13px] font-medium text-[#0a0a0a]">
                  Website
                </Label>
                <Input
                  id="modal-website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://acko.com"
                  type="text"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-[13px] font-medium text-[#0a0a0a]">
                  Skills file <span className="text-red-500">*</span>
                </Label>
                <input
                  ref={skillsRef}
                  type="file"
                  className="hidden"
                  onChange={handleSkillsChange}
                />
                {skillsFile ? (
                  <div className="flex items-center gap-2 rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-3 py-2">
                    <FileText className="size-4 shrink-0 text-purple-500" />
                    <span className="flex-1 truncate text-[13px] text-[#0a0a0a]">{skillsFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSkillsFile(null)}
                      className="text-[#737373] hover:text-[#0a0a0a]"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => skillsRef.current?.click()}
                    className="w-fit"
                  >
                    Attach skills.md
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!name.trim() || !industry.trim() || !skillsFile}>
                  Add organisation
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
