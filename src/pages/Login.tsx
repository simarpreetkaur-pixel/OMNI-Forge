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

type Step = "login" | "org-details" | "skills-analysing";

// Users who need the onboarding flow
const ONBOARDING_USERS = new Set(["rajesh.kumar@acko.tech"]);
// Users who are pre-onboarded and go straight to dashboard
const PRE_ONBOARDED_USERS = new Set(["naman.jain@abc.com"]);

export default function Login() {
  const navigate = useNavigate();
  const { orgs, activeOrgId, addOrg, setActiveOrgId, setCurrentUser, seedNamanOrg } = useOrg();
  const [email, setEmail] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [step, setStep] = useState<Step>("login");

  function handleLogin() {
    const emailLower = email.trim().toLowerCase();
    if (PRE_ONBOARDED_USERS.has(emailLower)) {
      setLoginError("");
      setCurrentUser(emailLower);
      seedNamanOrg();
      navigate("/dashboard");
      return;
    }
    if (ONBOARDING_USERS.has(emailLower)) {
      setLoginError("");
      setCurrentUser(emailLower);
      setStep("org-details");
      return;
    }
    setLoginError("You don't have access to this tool.");
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
      <div className="relative w-1/2 overflow-hidden">
        <img
          src="/login-right-panel.png"
          alt="One Platform for intelligent operations"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
