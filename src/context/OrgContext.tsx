import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AppItem } from "@/components/dashboard/AppsTab";
import type { MiniApp } from "@/components/dashboard/MiniAppsTab";
import type { Org } from "@/components/onboarding/OrgDetailsStep";
import type { SeoConfig } from "@/types/seo";
import { type VirtualEmployee, SEED_VIRTUAL_EMPLOYEES } from "@/types/virtualEmployee";

export type SavedOrg = {
  id: string;
  name: string;
  industry: string;
  website: string;
  logoPreview: string | null;
  skillsFileName: string | null;
};

type OrgWorkspace = {
  apps: AppItem[];
  miniApps: MiniApp[];
  appConfigs: Record<string, SeoConfig>;
  configTimestamps: Record<string, number>;
  virtualEmployees: VirtualEmployee[];
};

type OrgStore = {
  orgs: SavedOrg[];
  activeOrgId: string | null;
  workspaces: Record<string, OrgWorkspace>;
};

const STORAGE_KEY = "omni-forge-org-store";

function createEmptyWorkspace(): OrgWorkspace {
  return {
    apps: [],
    miniApps: [],
    appConfigs: {},
    configTimestamps: {},
    virtualEmployees: SEED_VIRTUAL_EMPLOYEES.map((e) => ({ ...e })),
  };
}

function loadStore(): OrgStore {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { orgs: [], activeOrgId: null, workspaces: {} };
    }
    return JSON.parse(raw) as OrgStore;
  } catch {
    return { orgs: [], activeOrgId: null, workspaces: {} };
  }
}

function persistStore(store: OrgStore) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    try {
      const withoutLogos: OrgStore = {
        ...store,
        orgs: store.orgs.map((org) => ({ ...org, logoPreview: null })),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(withoutLogos));
    } catch {
      // Keep in-memory state even if persistence fails
    }
  }
}

export function orgInputToSaved(org: Org): Omit<SavedOrg, "id"> {
  return {
    name: org.name,
    industry: org.industry,
    website: org.website,
    logoPreview: org.logoPreview,
    skillsFileName: org.skillsFile?.name ?? null,
  };
}

type OrgContextValue = {
  orgs: SavedOrg[];
  activeOrg: SavedOrg | null;
  activeOrgId: string | null;
  addOrg: (org: Omit<SavedOrg, "id">) => string;
  setActiveOrgId: (orgId: string) => void;
  getApps: (orgId: string) => AppItem[];
  getMiniApps: (orgId: string) => MiniApp[];
  addApp: (orgId: string, app: AppItem) => void;
  removeApp: (orgId: string, appId: string) => void;
  addMiniApp: (orgId: string, miniApp: MiniApp) => void;
  removeMiniApp: (orgId: string, miniAppId: string) => void;
  getAppConfig: (orgId: string, appId: string) => SeoConfig | null;
  setAppConfig: (orgId: string, appId: string, config: SeoConfig) => void;
  getConfigTimestamp: (orgId: string, appId: string) => number | null;
  getVirtualEmployees: (orgId: string) => VirtualEmployee[];
  addVirtualEmployee: (orgId: string, employee: VirtualEmployee) => void;
  removeVirtualEmployee: (orgId: string, employeeId: string) => void;
  updateVirtualEmployee: (orgId: string, employeeId: string, updates: Partial<VirtualEmployee>) => void;
  recentVeFlash: boolean;
  clearVeFlash: () => void;
  clearSession: () => void;
};

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<OrgStore>(loadStore);
  const [recentVeFlash, setRecentVeFlash] = useState(false);
  const veFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    persistStore(store);
  }, [store]);

  const addOrg = useCallback((org: Omit<SavedOrg, "id">) => {
    const id = `org-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setStore((prev) => ({
      orgs: [...prev.orgs, { ...org, id }],
      activeOrgId: id,
      workspaces: {
        ...prev.workspaces,
        [id]: prev.workspaces[id] ?? createEmptyWorkspace(),
      },
    }));
    return id;
  }, []);

  const setActiveOrgId = useCallback((orgId: string) => {
    setStore((prev) => ({ ...prev, activeOrgId: orgId }));
  }, []);

  const getApps = useCallback(
    (orgId: string) => store.workspaces[orgId]?.apps ?? [],
    [store.workspaces]
  );

  const getMiniApps = useCallback(
    (orgId: string) => store.workspaces[orgId]?.miniApps ?? [],
    [store.workspaces]
  );

  const addApp = useCallback((orgId: string, app: AppItem) => {
    setStore((prev) => {
      const workspace = prev.workspaces[orgId] ?? createEmptyWorkspace();
      if (workspace.apps.some((existing) => existing.id === app.id)) {
        return prev;
      }
      return {
        ...prev,
        workspaces: {
          ...prev.workspaces,
          [orgId]: { ...workspace, apps: [...workspace.apps, app] },
        },
      };
    });
  }, []);

  const removeApp = useCallback((orgId: string, appId: string) => {
    setStore((prev) => {
      const workspace = prev.workspaces[orgId];
      if (!workspace) return prev;
      return {
        ...prev,
        workspaces: {
          ...prev.workspaces,
          [orgId]: { ...workspace, apps: workspace.apps.filter((a) => a.id !== appId) },
        },
      };
    });
  }, []);

  const addMiniApp = useCallback((orgId: string, miniApp: MiniApp) => {
    setStore((prev) => {
      const workspace = prev.workspaces[orgId] ?? createEmptyWorkspace();
      if (workspace.miniApps.some((existing) => existing.id === miniApp.id)) {
        return prev;
      }
      return {
        ...prev,
        workspaces: {
          ...prev.workspaces,
          [orgId]: { ...workspace, miniApps: [...workspace.miniApps, miniApp] },
        },
      };
    });
  }, []);

  const removeMiniApp = useCallback((orgId: string, miniAppId: string) => {
    setStore((prev) => {
      const workspace = prev.workspaces[orgId];
      if (!workspace) return prev;
      return {
        ...prev,
        workspaces: {
          ...prev.workspaces,
          [orgId]: { ...workspace, miniApps: workspace.miniApps.filter((a) => a.id !== miniAppId) },
        },
      };
    });
  }, []);

  const getAppConfig = useCallback(
    (orgId: string, appId: string): SeoConfig | null =>
      store.workspaces[orgId]?.appConfigs?.[appId] ?? null,
    [store.workspaces]
  );

  const setAppConfig = useCallback((orgId: string, appId: string, config: SeoConfig) => {
    setStore((prev) => {
      const workspace = prev.workspaces[orgId] ?? createEmptyWorkspace();
      return {
        ...prev,
        workspaces: {
          ...prev.workspaces,
          [orgId]: {
            ...workspace,
            appConfigs: { ...(workspace.appConfigs ?? {}), [appId]: config },
            configTimestamps: {
              ...(workspace.configTimestamps ?? {}),
              [appId]: Date.now(),
            },
          },
        },
      };
    });
  }, []);

  const getConfigTimestamp = useCallback(
    (orgId: string, appId: string): number | null =>
      store.workspaces[orgId]?.configTimestamps?.[appId] ?? null,
    [store.workspaces]
  );

  const getVirtualEmployees = useCallback(
    (orgId: string): VirtualEmployee[] =>
      store.workspaces[orgId]?.virtualEmployees ?? SEED_VIRTUAL_EMPLOYEES,
    [store.workspaces]
  );

  const addVirtualEmployee = useCallback((orgId: string, employee: VirtualEmployee) => {
    setStore((prev) => {
      const workspace = prev.workspaces[orgId] ?? createEmptyWorkspace();
      if (workspace.virtualEmployees.some((e) => e.id === employee.id)) return prev;
      return {
        ...prev,
        workspaces: {
          ...prev.workspaces,
          [orgId]: {
            ...workspace,
            virtualEmployees: [employee, ...workspace.virtualEmployees],
          },
        },
      };
    });
    // Trigger sidebar flash indicator
    setRecentVeFlash(true);
    if (veFlashTimerRef.current) clearTimeout(veFlashTimerRef.current);
    veFlashTimerRef.current = setTimeout(() => setRecentVeFlash(false), 6000);
  }, []);

  const removeVirtualEmployee = useCallback((orgId: string, employeeId: string) => {
    setStore((prev) => {
      const workspace = prev.workspaces[orgId];
      if (!workspace) return prev;
      return {
        ...prev,
        workspaces: {
          ...prev.workspaces,
          [orgId]: {
            ...workspace,
            virtualEmployees: workspace.virtualEmployees.filter((e) => e.id !== employeeId),
          },
        },
      };
    });
  }, []);

  const updateVirtualEmployee = useCallback(
    (orgId: string, employeeId: string, updates: Partial<VirtualEmployee>) => {
      setStore((prev) => {
        const workspace = prev.workspaces[orgId];
        if (!workspace) return prev;
        return {
          ...prev,
          workspaces: {
            ...prev.workspaces,
            [orgId]: {
              ...workspace,
              virtualEmployees: workspace.virtualEmployees.map((e) =>
                e.id === employeeId ? { ...e, ...updates } : e
              ),
            },
          },
        };
      });
    },
    []
  );

  const clearVeFlash = useCallback(() => {
    setRecentVeFlash(false);
    if (veFlashTimerRef.current) clearTimeout(veFlashTimerRef.current);
  }, []);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setStore({ orgs: [], activeOrgId: null, workspaces: {} });
  }, []);

  const activeOrg = useMemo(
    () => store.orgs.find((org) => org.id === store.activeOrgId) ?? null,
    [store.orgs, store.activeOrgId]
  );

  const value = useMemo(
    () => ({
      orgs: store.orgs,
      activeOrg,
      activeOrgId: store.activeOrgId,
      addOrg,
      setActiveOrgId,
      getApps,
      getMiniApps,
      addApp,
      removeApp,
      addMiniApp,
      removeMiniApp,
      getAppConfig,
      setAppConfig,
      getConfigTimestamp,
      getVirtualEmployees,
      addVirtualEmployee,
      removeVirtualEmployee,
      updateVirtualEmployee,
      recentVeFlash,
      clearVeFlash,
      clearSession,
    }),
    [
      store.orgs,
      store.activeOrgId,
      activeOrg,
      addOrg,
      setActiveOrgId,
      getApps,
      getMiniApps,
      addApp,
      removeApp,
      addMiniApp,
      removeMiniApp,
      getAppConfig,
      setAppConfig,
      getConfigTimestamp,
      getVirtualEmployees,
      addVirtualEmployee,
      removeVirtualEmployee,
      updateVirtualEmployee,
      recentVeFlash,
      clearVeFlash,
      clearSession,
    ]
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useOrg must be used within OrgProvider");
  }
  return context;
}
