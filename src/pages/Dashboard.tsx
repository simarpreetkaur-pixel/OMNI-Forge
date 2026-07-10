import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import AppsTab, { type AppItem } from "@/components/dashboard/AppsTab";
import MiniAppsTab, { type MiniApp } from "@/components/dashboard/MiniAppsTab";
import AppConfigPage from "@/components/dashboard/AppConfigPage";
import MiniAppBuilder from "@/components/dashboard/MiniAppBuilder";
import MediaChannelPicker from "@/components/dashboard/MediaChannelPicker";
import SeoConfigPage from "@/components/dashboard/SeoConfigPage";
import SeoArticlesView from "@/components/dashboard/SeoArticlesView";
import VirtualEmployeesPage from "@/components/dashboard/VirtualEmployeesPage";
import HumanEmployeesPage from "@/components/dashboard/HumanEmployeesPage";
import TeamsPage from "@/components/dashboard/TeamsPage";
import NeoPage from "@/components/dashboard/NeoPage";
import { useOrg } from "@/context/OrgContext";
import type { SeoConfig } from "@/types/seo";

type View =
  | "dashboard"
  | "app-config"
  | "mini-app-builder"
  | "media-channel-picker"
  | "seo-config"
  | "seo-articles";
type ActiveTab = "apps" | "mini-apps";

const BG_STYLE: React.CSSProperties = {
  background:
    "radial-gradient(ellipse 80% 60% at 80% 0%, rgba(216,180,254,0.25) 0%, rgba(250,250,250,0) 70%)," +
    "radial-gradient(ellipse 60% 50% at 100% 100%, rgba(186,230,255,0.15) 0%, rgba(250,250,250,0) 70%)",
};

export default function Dashboard() {
  const {
    activeOrgId,
    activeOrg,
    currentUserEmail,
    getApps,
    getMiniApps,
    addApp,
    removeApp,
    addMiniApp,
    removeMiniApp,
    getAppConfig,
    getConfigTimestamp,
  } = useOrg();

  // Derive first name from email prefix, e.g. "naman.jain@abc.com" → "Naman"
  const firstName = currentUserEmail
    ? currentUserEmail.split("@")[0].split(".")[0].replace(/^./, (c) => c.toUpperCase())
    : "Rajesh";

  const IS_SUPER_ADMIN = true;
  const [view, setView] = useState<View>("dashboard");
  const [activeTab, setActiveTab] = useState<ActiveTab>("apps");
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [pendingSeoConfig, setPendingSeoConfig] = useState<SeoConfig | null>(null);
  const [sidebarSection, setSidebarSection] = useState<string>("dashboard");

  const myApps = activeOrgId ? getApps(activeOrgId) : [];
  const myMiniApps = activeOrgId ? getMiniApps(activeOrgId) : [];

  useEffect(() => {
    setView("dashboard");
    setSelectedApp(null);
    setSelectedChannel(null);
    setPendingSeoConfig(null);
    setSidebarSection("dashboard");
  }, [activeOrgId]);

  function goToSeoConfig(app: AppItem, existingConfig: SeoConfig | null) {
    setSelectedApp(app);
    setPendingSeoConfig(existingConfig);
    setView("seo-config");
    // App is NOT auto-added here — it is only added to My Apps after the full
    // guided setup flow is completed inside SeoConfigPage.
  }

  function handleAppClick(app: AppItem) {
    if (app.id === "media") {
      setView("media-channel-picker");
      return;
    }
    // Card click on existing SEO app → articles view
    if (app.id.startsWith("media-")) {
      setSelectedApp(app);
      setView("seo-articles");
      return;
    }
    setSelectedApp(app);
    setView("app-config");
  }

  function handleConfigureApp(app: AppItem) {
    if (app.id.startsWith("media-")) {
      const existing = activeOrgId ? getAppConfig(activeOrgId, app.id) : null;
      goToSeoConfig(app, existing);
      return;
    }
    setSelectedApp(app);
    setView("app-config");
  }

  function handleSelectChannel(channelId: string) {
    setSelectedChannel(channelId);
    const appId = `media-${channelId}`;
    const existing = activeOrgId ? getAppConfig(activeOrgId, appId) : null;
    const app: AppItem = {
      id: appId,
      name: `Media · ${channelId.toUpperCase()}`,
      description: "AI-powered SEO content automation",
    };
    goToSeoConfig(app, existing);
  }

  function handleOpenChannel(channelId: string) {
    const appId = `media-${channelId}`;
    const app = myApps.find((a) => a.id === appId) ?? {
      id: appId,
      name: `Media · ${channelId.toUpperCase()}`,
      description: "AI-powered SEO content automation",
    };
    setSelectedApp(app);
    setSelectedChannel(channelId);
    setView("seo-articles");
  }

  function handleResetChannel(channelId: string) {
    const appId = `media-${channelId}`;
    if (activeOrgId) {
      removeApp(activeOrgId, appId);
    }
  }

  function handleAppSave(app: AppItem) {
    if (activeOrgId) {
      addApp(activeOrgId, app);
    }
    setView("dashboard");
    setSelectedApp(null);
    setActiveTab("apps");
  }

  function handleMiniAppPublish(miniApp: MiniApp) {
    if (activeOrgId) {
      addMiniApp(activeOrgId, miniApp);
    }
    setView("dashboard");
    setActiveTab("mini-apps");
  }

  function backFromSeo() {
    if (selectedChannel) {
      setView("media-channel-picker");
      setPendingSeoConfig(null);
    } else {
      setView("dashboard");
      setSelectedApp(null);
      setPendingSeoConfig(null);
    }
  }

  if (view === "media-channel-picker") {
    const configuredChannels = myApps
      .filter((a) => a.id.startsWith("media-"))
      .map((a) => a.id.replace("media-", ""));
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-[#fafafa]">
        <Sidebar onNavigate={(id) => { setSidebarSection(id); setView("dashboard"); }} />
        <MediaChannelPicker
          onBack={() => setView("dashboard")}
          onSelectChannel={handleSelectChannel}
          onOpenChannel={handleOpenChannel}
          onResetChannel={handleResetChannel}
          configuredChannels={configuredChannels}
          isSuperAdmin={IS_SUPER_ADMIN}
        />
      </div>
    );
  }

  if (view === "seo-articles" && selectedApp && activeOrgId) {
    const appConfig = getAppConfig(activeOrgId, selectedApp.id);
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-[#fafafa]">
        <Sidebar onNavigate={(id) => { setSidebarSection(id); setView("dashboard"); }} />
        <SeoArticlesView
          appName={selectedApp.name}
          config={appConfig ?? {} as SeoConfig}
          onBack={() => { setView("dashboard"); setSelectedApp(null); }}
          onConfigure={() => handleConfigureApp(selectedApp)}
        />
      </div>
    );
  }

  if (view === "seo-config" && selectedApp) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-[#fafafa]">
        <Sidebar onNavigate={(id) => { setSidebarSection(id); setView("dashboard"); }} />
        <SeoConfigPage
          orgId={activeOrgId ?? ""}
          appId={selectedApp.id}
          onBack={backFromSeo}
          initialConfig={pendingSeoConfig}
          initialTimestamp={
            activeOrgId ? getConfigTimestamp(activeOrgId, selectedApp.id) : null
          }
          appName={selectedApp.name}
          isAlreadySaved={myApps.some((a) => a.id === selectedApp.id)}
        />
      </div>
    );
  }

  if (view === "app-config" && selectedApp) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-[#fafafa]">
        <Sidebar onNavigate={(id) => { setSidebarSection(id); setView("dashboard"); }} />
        <AppConfigPage
          app={selectedApp}
          isAlreadySaved={myApps.some((a) => a.id === selectedApp.id)}
          onBack={() => { setView("dashboard"); setSelectedApp(null); }}
          onSave={() => handleAppSave(selectedApp)}
        />
      </div>
    );
  }

  if (view === "mini-app-builder") {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-[#fafafa]">
        <Sidebar onNavigate={(id) => { setSidebarSection(id); setView("dashboard"); }} />
        <MiniAppBuilder
          onBack={() => { setView("dashboard"); setActiveTab("mini-apps"); }}
          onPublish={handleMiniAppPublish}
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#fafafa]">
      <div className="pointer-events-none absolute inset-0" style={BG_STYLE} />

      <Sidebar onNavigate={(id) => { setSidebarSection(id); setView("dashboard"); }} />

      {sidebarSection === "virtual-employees" ? (
        <VirtualEmployeesPage />
      ) : sidebarSection === "human-employees" ? (
        <HumanEmployeesPage />
      ) : sidebarSection === "teams" ? (
        <TeamsPage />
      ) : sidebarSection === "neo" ? (
        <NeoPage />
      ) : sidebarSection !== "dashboard" ? (
        <PlaceholderPage sectionId={sidebarSection} />
      ) : (
        <main
          className="relative flex-1 overflow-y-auto"
          style={{ paddingTop: 40, paddingLeft: 24, paddingRight: 24, paddingBottom: 40 }}
        >
          <div className="flex flex-col" style={{ gap: 4, marginBottom: 30 }}>
            <p
              className="font-semibold text-[#0a0a0a]"
              style={{ fontSize: 24, lineHeight: "32px", letterSpacing: "-0.4px" }}
            >
              Welcome, {firstName}
            </p>
            <p className="font-normal text-[#737373]" style={{ fontSize: 16, lineHeight: "24px" }}>
              {activeOrg
                ? `Configure and set up apps for ${activeOrg.name}`
                : "Configure and set up your apps on OMNI Forge"}
            </p>
          </div>

          <div
            className="flex items-center"
            style={{
              width: 375,
              height: 44,
              background: "rgba(255, 255, 255, 1)",
              padding: 3,
              borderRadius: 10,
              marginBottom: 32,
            }}
          >
            <TabTrigger label="Apps" active={activeTab === "apps"} onClick={() => setActiveTab("apps")} />
            <TabTrigger
              label="Mini apps"
              active={activeTab === "mini-apps"}
              onClick={() => setActiveTab("mini-apps")}
            />
          </div>

          {activeTab === "apps" && (
            <AppsTab
              myApps={myApps}
              onAppClick={handleAppClick}
              onConfigureApp={handleConfigureApp}
              onDeleteApp={(appId) => activeOrgId && removeApp(activeOrgId, appId)}
              isSuperAdmin={IS_SUPER_ADMIN}
            />
          )}
          {activeTab === "mini-apps" && (
            <MiniAppsTab
              myMiniApps={myMiniApps}
              onCreate={() => setView("mini-app-builder")}
              onDeleteMiniApp={(miniAppId) => activeOrgId && removeMiniApp(activeOrgId, miniAppId)}
              isSuperAdmin={IS_SUPER_ADMIN}
            />
          )}
        </main>
      )}
    </div>
  );
}

// ─── Labels for sidebar IDs ───────────────────────────────────────────────────

const SECTION_LABELS: Record<string, string> = {
  "voice-bot": "Voice Bot",
  "chat-bot": "Chat Bot",
  "whatsapp-bot": "WhatsApp Bot",
  "oauth-apps": "OAuth Apps",
  "roles-permissions": "Roles & Permissions",
  "settings": "Settings",
};

function PlaceholderPage({ sectionId }: { sectionId: string }) {
  const label = SECTION_LABELS[sectionId] ?? sectionId;
  return (
    <main className="flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#fafafa]">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-[#e7e7f0] bg-white shadow-sm">
          <span className="text-2xl">🔧</span>
        </div>
        <p className="text-[16px] font-semibold text-[#0a0a0a]">{label}</p>
        <p className="text-[14px] text-[#a0a0a0]">Flows to be added</p>
      </div>
    </main>
  );
}

function TabTrigger({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center justify-center transition-colors"
      style={{
        height: "100%",
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 4,
        paddingBottom: 4,
        borderRadius: 8,
        border: active ? "1px solid rgba(255,255,255,0)" : "none",
        background: active ? "#f3e8ff" : "transparent",
        color: active ? "#8b5cf6" : "#0a0a0a",
        fontSize: 14,
        fontWeight: 500,
        lineHeight: "20px",
        cursor: "pointer",
        minWidth: 0,
      }}
    >
      {label}
    </button>
  );
}
