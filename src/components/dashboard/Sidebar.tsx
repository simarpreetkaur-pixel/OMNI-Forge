import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  User,
  Users,
  PhoneCall,
  MessageSquare,
  MessageCircle,
  Link2,
  ShieldCheck,
  Settings,
  Ticket,
  ChevronDown,
  Plus,
  LogOut,
  Building2,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddOrgModal from "@/components/dashboard/AddOrgModal";
import { useOrg } from "@/context/OrgContext";

const USER_DISPLAY: Record<string, {
  name: string; initials: string; email: string; role: string;
  avatarBg: string; avatarColor: string;
}> = {
  "rajesh.kumar@acko.tech": {
    name: "Rajesh Kumar", initials: "RK", email: "rajesh.kumar@acko.tech",
    role: "Super admin", avatarBg: "#e8e4f3", avatarColor: "#5b4b8a",
  },
  "naman.jain@abc.com": {
    name: "Naman Jain", initials: "NJ", email: "naman.jain@abc.com",
    role: "Admin", avatarBg: "#e0f2fe", avatarColor: "#0369a1",
  },
};

const WORKFORCE = [
  { id: "virtual-employees", label: "Virtual employees", icon: Bot },
  { id: "human-employees", label: "Human employees", icon: User },
  { id: "teams", label: "Teams", icon: Users },
];

const CAPABILITIES = [
  { id: "voice-bot", label: "Voice bot", icon: PhoneCall },
  { id: "chat-bot", label: "Chat bot", icon: MessageSquare },
  { id: "whatsapp-bot", label: "WhatsApp bot", icon: MessageCircle },
];

const OPS_SETTINGS = [
  { id: "oauth-apps", label: "OAuth apps", icon: Link2 },
  { id: "roles-permissions", label: "Roles and permissions", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: Settings },
];

const TRACKING = [{ id: "neo", label: "Neo", icon: Ticket }];

type NavTabProps = {
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
  showDot?: boolean;
};

function NavTab({ label, icon: Icon, isActive, onClick, showDot }: NavTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-7 w-full items-center justify-start gap-2 rounded-lg px-2 text-left transition-colors",
        "hover:bg-[#f5f5f5] active:bg-[#ebebeb]",
        isActive && "bg-[#f5f5f5]"
      )}
    >
      <Icon className="size-4 shrink-0 text-[#737373]" strokeWidth={1.5} />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-left text-[13px] leading-none text-[#0a0a0a]",
          isActive && "font-medium text-[#171717]"
        )}
      >
        {label}
      </span>
      {showDot && (
        <span className="flex size-2 shrink-0 animate-pulse rounded-full bg-green-500" />
      )}
    </button>
  );
}

function NavSection({
  heading,
  children,
  defaultOpen = true,
}: {
  heading: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="flex w-full flex-col items-start px-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-full items-center justify-between rounded-md px-0 text-left transition-colors hover:text-[#0a0a0a]"
      >
        <span className="text-[12px] font-medium uppercase tracking-wider leading-4 text-[#a0a0a0]">
          {heading}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-[#a0a0a0] transition-transform duration-200",
            open && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div className="mt-0.5 flex w-full flex-col items-start gap-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ onNavigate }: { onNavigate?: (id: string) => void } = {}) {
  const navigate = useNavigate();
  const { orgs, activeOrgId, activeOrg, setActiveOrgId, clearSession, recentVeFlash, clearVeFlash, currentUserEmail } = useOrg();
  const user = (currentUserEmail && USER_DISPLAY[currentUserEmail]) ?? USER_DISPLAY["rajesh.kumar@acko.tech"];
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [addOrgModalOpen, setAddOrgModalOpen] = useState(false);

  function handleNavTab(id: string) {
    setActiveTab(id);
    onNavigate?.(id);
  }

  function handleAddAnotherOrg() {
    setIsProfileMenuOpen(false);
    setAddOrgModalOpen(true);
  }

  function handleSwitchOrg(orgId: string) {
    setActiveOrgId(orgId);
    setIsProfileMenuOpen(false);
  }

  function handleLogout() {
    clearSession();
    navigate("/");
  }

  return (
    <>
    <aside className="flex h-screen w-[256px] shrink-0 flex-col items-start border-r border-[#e7e7f0] bg-white px-3 pb-6 pt-4">
      <div className="flex min-h-0 w-full flex-1 flex-col items-start justify-between overflow-hidden">
        {/* Top nav */}
        <div className="flex w-full flex-col items-start overflow-y-auto">
          {/* Org logo — falls back to ACKO Drive logo */}
          <div className="mb-2 flex h-[52px] w-full shrink-0 items-center justify-start px-4 py-2">
            {activeOrg?.logoPreview ? (
              <img
                src={activeOrg.logoPreview}
                alt={activeOrg.name}
                className="h-8 max-w-full object-contain object-left"
              />
            ) : (
              <img
                src="/acko-drive-logo.png"
                alt="ACKO Drive"
                className="h-6 w-auto object-contain object-left"
              />
            )}
          </div>

          {/* Nav sections */}
          <div className="flex w-full flex-col items-start gap-1.5">
            {/* Dashboard */}
            <div className="w-full px-2">
              <NavTab
                label="Dashboard"
                icon={LayoutDashboard}
                isActive={activeTab === "dashboard"}
                onClick={() => handleNavTab("dashboard")}
              />
            </div>

            {/* Work force */}
            <NavSection heading="Work force">
              {WORKFORCE.map(({ id, label, icon }) => (
                <NavTab
                  key={id}
                  label={label}
                  icon={icon}
                  isActive={activeTab === id}
                  showDot={id === "virtual-employees" && recentVeFlash}
                  onClick={() => {
                    handleNavTab(id);
                    if (id === "virtual-employees" && recentVeFlash) clearVeFlash();
                  }}
                />
              ))}
            </NavSection>

            {/* Capabilities */}
            <NavSection heading="Capabilities">
              {CAPABILITIES.map(({ id, label, icon }) => (
                <NavTab
                  key={id}
                  label={label}
                  icon={icon}
                  isActive={activeTab === id}
                  onClick={() => handleNavTab(id)}
                />
              ))}
            </NavSection>

            {/* Ops settings */}
            <NavSection heading="Ops settings">
              {OPS_SETTINGS.map(({ id, label, icon }) => (
                <NavTab
                  key={id}
                  label={label}
                  icon={icon}
                  isActive={activeTab === id}
                  onClick={() => handleNavTab(id)}
                />
              ))}
            </NavSection>

            {/* Tracking */}
            <NavSection heading="Tracking">
              {TRACKING.map(({ id, label, icon }) => (
                <NavTab
                  key={id}
                  label={label}
                  icon={icon}
                  isActive={activeTab === id}
                  onClick={() => handleNavTab(id)}
                />
              ))}
            </NavSection>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-2 flex w-full shrink-0 flex-col items-start gap-3">
          {/* User profile */}
          <div className="relative z-[var(--z-dropdown)] flex w-full flex-col items-start gap-3">
            <div className="flex w-full items-start gap-2 rounded-lg px-2 py-1 text-left">
              {/* Avatar */}
              <div
                className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full"
                style={{ background: user.avatarBg }}
              >
                <span className="text-[11px] font-semibold" style={{ color: user.avatarColor }}>
                  {user.initials}
                </span>
              </div>

              {/* Name / email / badge */}
              <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
                <p className="w-full truncate text-[14px] font-semibold leading-none text-[#0a0a0a]">
                  {user.name}
                </p>
                {activeOrg && (
                  <p className="w-full truncate text-[14px] font-normal leading-none text-[#0a0a0a]">
                    {activeOrg.name}
                  </p>
                )}
                <p className="w-full truncate text-[14px] font-normal leading-none text-[#737373]">
                  {user.email}
                </p>
                <span className="my-1 inline-flex w-fit items-center rounded-full bg-green-50 px-2.5 py-1 text-[14px] font-normal leading-none text-green-600">
                  {user.role}
                </span>
              </div>

              {/* Chevron menu */}
              <DropdownMenu open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open profile menu"
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-[#737373] transition-colors",
                      "hover:bg-[#f5f5f5] active:bg-[#ebebeb]",
                      isProfileMenuOpen && "bg-[#f5f5f5]"
                    )}
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform duration-200",
                        isProfileMenuOpen && "rotate-180"
                      )}
                      strokeWidth={1.5}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" className="w-[220px]">
                  {orgs.length > 0 && (
                    <>
                      <DropdownMenuLabel>Organisations</DropdownMenuLabel>
                      {orgs.map((org) => (
                        <DropdownMenuItem
                          key={org.id}
                          onClick={() => handleSwitchOrg(org.id)}
                          className="justify-between"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <Building2 className="size-4 shrink-0 text-[#737373]" strokeWidth={1.5} />
                            <span className="truncate">{org.name}</span>
                          </span>
                          {org.id === activeOrgId && (
                            <Check className="size-4 shrink-0 text-purple-600" strokeWidth={1.5} />
                          )}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleAddAnotherOrg}>
                    <Plus className="size-4 text-[#737373]" strokeWidth={1.5} />
                    Add another org
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="size-4 text-[#737373]" strokeWidth={1.5} />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="h-px w-full bg-[#e7e7f0]" />
          </div>

          {/* Powered by */}
          <div className="flex h-[54px] w-full items-center justify-start px-2">
            <img
              src="/powered-by-omni-forge.png"
              alt="Powered by ACKO OMNI Forge"
              className="h-[54px] w-auto max-w-full object-contain object-left"
            />
          </div>
        </div>
      </div>
    </aside>
    <AddOrgModal open={addOrgModalOpen} onOpenChange={setAddOrgModalOpen} />
  </>
  );
}
