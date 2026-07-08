import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Plus, ArrowRight, X, FileText, ChevronDown, Check } from "lucide-react";

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

export type Org = {
  name: string;
  industry: string;
  website: string;
  logo: File | null;
  logoPreview: string | null;
  skillsFile: File | null;
};

interface OrgDetailsStepProps {
  orgs: Org[];
  onSaveOrg: (org: Org) => void;
  onContinue: () => void;
  variant?: "onboarding" | "modal";
}

const emptyForm = () => ({
  name: "",
  industry: "",
  website: "",
  logo: null as File | null,
  logoPreview: null as string | null,
  skillsFile: null as File | null,
});

export default function OrgDetailsStep({ orgs, onSaveOrg, onContinue, variant = "onboarding" }: OrgDetailsStepProps) {
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [showForm, setShowForm] = useState(orgs.length === 0);
  const [industryOpen, setIndustryOpen] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const skillsRef = useRef<HTMLInputElement>(null);
  const industryRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (industryRef.current && !industryRef.current.contains(e.target as Node)) {
        setIndustryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setForm((f) => ({ ...f, logo: file, logoPreview: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  function handleSkillsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setForm((f) => ({ ...f, skillsFile: file }));
    setErrors((er) => ({ ...er, skillsFile: undefined }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Organisation name is required";
    if (!form.industry.trim()) errs.industry = "Industry is required";
    if (!form.skillsFile) errs.skillsFile = "Company knowledge document is required";
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSaveOrg({ ...form });
    setForm(emptyForm());
    setErrors({});
    setShowForm(false);
  }

  const isMandatoryFieldsComplete =
    form.name.trim().length > 0 && form.industry.trim().length > 0 && form.skillsFile !== null;

  return (
    <div className="animate-fade-in flex flex-col gap-5">
      {variant === "onboarding" && (
        <div className="flex flex-col gap-1">
          <h2 className="text-[22px] font-bold leading-[1.3] text-[#0a0a0a]">
            {orgs.length === 0
              ? "Let's onboard your organisation"
              : "Enter organisation details"}
          </h2>
          <p className="text-sm leading-5 text-[#737373]">
            {orgs.length > 0
              ? `${orgs.length} organisation${orgs.length > 1 ? "s" : ""} added`
              : "Fill in the details below to get started"}
          </p>
        </div>
      )}

      {variant === "modal" && orgs.length > 0 && (
        <p className="text-sm leading-5 text-[#737373]">
          {orgs.length} organisation{orgs.length > 1 ? "s" : ""} added
        </p>
      )}

      {/* Saved orgs list */}
      {orgs.length > 0 && (
        <div className="flex flex-col gap-2">
          {orgs.map((org, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2.5"
            >
              {org.logoPreview ? (
                <img
                  src={org.logoPreview}
                  alt={org.name}
                  className="h-8 w-8 rounded-md object-contain border border-[#e5e5e5]"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100">
                  <Building2 className="h-4 w-4 text-purple-600" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-[#0a0a0a] truncate">{org.name}</span>
                <span className="text-xs text-[#737373] truncate">
                  {org.industry} · {org.skillsFile?.name}
                </span>
              </div>
              <span className="ml-auto flex-shrink-0 text-xs font-medium text-purple-600 bg-purple-100 rounded-full px-2 py-0.5">
                Saved
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="flex flex-col gap-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
          {orgs.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#0a0a0a]">
                Organisation {orgs.length + 1}
              </span>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-[#737373] hover:text-[#0a0a0a] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Org Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="org-name" className="text-sm font-medium text-[#0a0a0a]">
              Organisation Name <span className="text-cerise-600">*</span>
            </Label>
            <Input
              id="org-name"
              placeholder="e.g. ACKO General Insurance"
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: undefined })); }}
              className="h-9 rounded-md border-[#e5e5e5] bg-white px-3 text-sm placeholder:text-[#737373]"
            />
            {errors.name && <p className="text-xs text-cerise-600">{errors.name}</p>}
          </div>

          {/* Industry dropdown */}
          <div className="flex flex-col gap-1.5" ref={industryRef}>
            <Label className="text-sm font-medium text-[#0a0a0a]">
              Industry <span className="text-cerise-600">*</span>
            </Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setIndustryOpen((o) => !o); setErrors((er) => ({ ...er, industry: undefined })); }}
                className={[
                  "flex h-9 w-full items-center justify-between rounded-md border bg-white px-3 text-sm transition-colors",
                  errors.industry
                    ? "border-cerise-400 focus:ring-cerise-200"
                    : industryOpen
                    ? "border-purple-600 ring-[3px] ring-purple-200"
                    : "border-[#e5e5e5] hover:border-[#b0b0b0]",
                  form.industry ? "text-[#0a0a0a]" : "text-[#737373]",
                ].join(" ")}
              >
                <span>{form.industry || "Select an industry"}</span>
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-[#737373] transition-transform duration-200 ${industryOpen ? "rotate-180" : ""}`}
                />
              </button>

              {industryOpen && (
                <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full rounded-lg border border-[#e5e5e5] bg-white py-1 shadow-[0_4px_16px_0_rgba(0,0,0,0.10)]">
                  {INDUSTRIES.map((industry) => (
                    <button
                      key={industry}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, industry }));
                        setErrors((er) => ({ ...er, industry: undefined }));
                        setIndustryOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm text-[#0a0a0a] hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    >
                      <span>{industry}</span>
                      {form.industry === industry && (
                        <Check className="h-3.5 w-3.5 text-purple-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.industry && <p className="text-xs text-cerise-600">{errors.industry}</p>}
          </div>

          {/* Website */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="org-website" className="text-sm font-medium text-[#0a0a0a]">
              Website URL
            </Label>
            <Input
              id="org-website"
              type="text"
              placeholder="https://acko.com"
              value={form.website}
              onChange={(e) => { setForm((f) => ({ ...f, website: e.target.value })); setErrors((er) => ({ ...er, website: undefined })); }}
              className="h-9 rounded-md border-[#e5e5e5] bg-white px-3 text-sm placeholder:text-[#737373]"
            />
            {errors.website && <p className="text-xs text-cerise-600">{errors.website}</p>}
          </div>

          {/* Logo upload */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#0a0a0a]">Brand Logo</Label>
            <div
              onClick={() => logoRef.current?.click()}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-[#d4d4d4] bg-white px-3 py-2.5 transition-colors hover:border-purple-400 hover:bg-purple-100/30"
            >
              {form.logoPreview ? (
                <>
                  <img src={form.logoPreview} alt="Logo" className="h-8 w-8 rounded-md object-contain border border-[#e5e5e5]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#0a0a0a] truncate max-w-[200px]">{form.logo?.name}</span>
                    <span className="text-xs text-purple-600">Click to replace</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100">
                    <Building2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#0a0a0a]">Upload logo</span>
                    <span className="text-xs text-[#737373]">PNG, JPG, SVG</span>
                  </div>
                </>
              )}
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </div>

          {/* Knowledge document upload */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-[#0a0a0a]">
              Company Knowledge Document <span className="text-cerise-600">*</span>
            </Label>
            <div
              onClick={() => skillsRef.current?.click()}
              className={[
                "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 transition-colors",
                form.skillsFile
                  ? "border-purple-400 bg-purple-50/60"
                  : "border-[#d4d4d4] bg-white hover:border-purple-400 hover:bg-purple-100/30",
              ].join(" ")}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-md ${form.skillsFile ? "bg-purple-200" : "bg-[#f0f0f0]"}`}>
                <FileText className={`h-4 w-4 ${form.skillsFile ? "text-purple-700" : "text-[#737373]"}`} />
              </div>
              {form.skillsFile ? (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#0a0a0a] truncate max-w-[200px]">{form.skillsFile.name}</span>
                  <span className="text-xs text-purple-600">Click to replace</span>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#0a0a0a]">Attach company document</span>
                  <span className="text-xs text-[#737373]">PDF, DOC, DOCX — knowledge base for this org</span>
                </div>
              )}
            </div>
            <input ref={skillsRef} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleSkillsChange} />
            {errors.skillsFile && <p className="text-xs text-cerise-600">{errors.skillsFile}</p>}
          </div>

          <Button
            onClick={handleSave}
            disabled={!isMandatoryFieldsComplete}
            className="w-full h-[38px] rounded-md text-sm font-semibold"
          >
            Save Organisation
          </Button>
        </div>
      )}

      {/* Action buttons after at least one org is saved */}
      {orgs.length > 0 && !showForm && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 h-[38px] w-full rounded-md border border-dashed border-purple-400 bg-purple-100/30 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Another Organisation
          </button>
          <Button
            onClick={onContinue}
            className="w-full h-[38px] rounded-md text-sm font-semibold flex items-center justify-center gap-2"
          >
            {variant === "modal" ? "Done" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
