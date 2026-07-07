import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import OrgDetailsStep, { type Org } from "@/components/onboarding/OrgDetailsStep";
import SkillsAnalysingStep from "@/components/onboarding/SkillsAnalysingStep";
import { orgInputToSaved, useOrg } from "@/context/OrgContext";

const BG_GRADIENT =
  "https://www.figma.com/api/mcp/asset/17644fa4-3f60-4b1b-911d-59871832435d";
const PURPLE_ELLIPSE =
  "https://www.figma.com/api/mcp/asset/30a6bcc0-3bec-4a64-9447-610c162c975a";

const ALLOWED_EMAIL = "rajesh.kumar@acko.tech";

type Step = "login" | "org-details" | "skills-analysing";

export default function Login() {
  const navigate = useNavigate();
  const { orgs, activeOrgId, addOrg, setActiveOrgId } = useOrg();
  const [email, setEmail] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [step, setStep] = useState<Step>("login");

  function handleLogin() {
    if (email.trim().toLowerCase() === ALLOWED_EMAIL) {
      setLoginError("");
      setStep("org-details");
    } else {
      setLoginError("You don't have access to this tool.");
    }
  }

  function handleSaveOrg(org: Org) {
    addOrg(orgInputToSaved(org));
    setStep("skills-analysing");
  }

  function handleAnalysisDone() {
    setStep("org-details");
  }

  function handleContinueToDashboard() {
    if (orgs.length > 0 && !activeOrgId) {
      setActiveOrgId(orgs[0].id);
    }
    navigate("/dashboard");
  }

  // ── Split-screen layout ─────────────────────────────────────────────────
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Panel */}
      <div className="relative flex w-1/2 flex-col items-start justify-center overflow-hidden bg-white">
        <img
          src={BG_GRADIENT}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-left-top"
        />

        <div className="relative z-10 flex w-[360px] flex-col gap-6 ml-[139px]">

          {/* Login */}
          {step === "login" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-[30px] font-bold leading-[1.2] text-[#0a0a0a]">
                  Sign in to OMNI Forge
                </h1>
                <p className="text-sm font-normal leading-5 text-[#737373]">
                  Enter your work email to access your dashboard
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-sm font-medium leading-none text-[#0a0a0a]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@work.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (loginError) setLoginError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="h-9 rounded-md border-[#e5e5e5] bg-white px-3 text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] focus-visible:ring-[3px] focus-visible:ring-purple-200 focus-visible:border-purple-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="keep-signed-in"
                      checked={keepSignedIn}
                      onCheckedChange={(v) => setKeepSignedIn(v === true)}
                    />
                    <label
                      htmlFor="keep-signed-in"
                      className="cursor-pointer text-sm font-medium leading-none text-[#0a0a0a] select-none"
                    >
                      Keep me signed in
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-normal leading-5 text-[#737373] underline underline-offset-2 hover:text-[#0a0a0a] transition-colors"
                  >
                    Unable to sign in?
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={handleLogin}
                  className="w-full h-[38px] rounded-md text-sm font-semibold"
                >
                  Log in
                </Button>
                {loginError && (
                  <p className="text-xs font-medium text-cerise-600 flex items-center gap-1">
                    <span>⚠</span> {loginError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Org Details */}
          {step === "org-details" && (
            <OrgDetailsStep
              orgs={orgs.map((org) => ({
                name: org.name,
                industry: org.industry,
                website: org.website,
                logo: null,
                logoPreview: org.logoPreview,
                skillsFile: org.skillsFileName ? new File([], org.skillsFileName) : null,
              }))}
              onSaveOrg={handleSaveOrg}
              onContinue={handleContinueToDashboard}
            />
          )}

          {/* Skills Analysing — runs after each org save */}
          {step === "skills-analysing" && (
            <SkillsAnalysingStep
              orgCount={1}
              onDone={handleAnalysisDone}
            />
          )}
        </div>
      </div>

      {/* Right Panel — never changes */}
      <div className="relative flex w-1/2 flex-col items-center justify-center overflow-hidden bg-[#0e0e0e]">
        <img
          src={PURPLE_ELLIPSE}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[45%] w-[183%] max-w-none"
        />
        <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <img src="/omni-login-logo.png" alt="ACKO OMNI Forge" className="h-[61px] w-auto" />
          </div>
          <p className="max-w-[398px] text-[30px] font-semibold leading-[1.2] text-white">
            One Platform for intelligent operations
          </p>
        </div>
      </div>
    </div>
  );
}
