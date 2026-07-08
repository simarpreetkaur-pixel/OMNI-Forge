export interface VirtualEmployee {
  id: string;
  name: string;
  description: string;
  role: "Member" | "Admin";
  status: string[];
  apiKey: string;
  orgId: string;
  appAccess?: string[];
  createdAt?: number;
}

export const SEED_VIRTUAL_EMPLOYEES: VirtualEmployee[] = [
  {
    id: "ve-1",
    name: "Test 1",
    description: "Social media posts everyday",
    role: "Member",
    status: ["disconnected", "runtime · missing"],
    apiKey: "neo_M-zdlWCbA8XTd-TevjI0XLmiy8v0U4T2",
    orgId: "seed",
  },
  {
    id: "ve-2",
    name: "Random Bot",
    description: "For testing random stuffs on the platform",
    role: "Member",
    status: ["disconnected", "runtime · missing"],
    apiKey: "neo_R-xk2PqLmN9Yd-RndBot3F7a",
    orgId: "seed",
  },
  {
    id: "ve-3",
    name: "Chat Bot Configurator",
    description: "This maintains the configuration of chat channels and chat bot",
    role: "Member",
    status: ["connected", "runtime · active"],
    apiKey: "neo_C-bHj4TrW8Qs-CBCfg2Lp1z",
    orgId: "seed",
  },
  {
    id: "ve-4",
    name: "Operations Manager",
    description: "Fetch internal dashboard tasks and priorities the tasks for agent to work in efficiently",
    role: "Member",
    status: ["connected", "runtime · active"],
    apiKey: "neo_O-mD6VnKp3Yt-OpsMgr9Xw",
    orgId: "seed",
  },
  {
    id: "ve-5",
    name: "Automated Tester",
    description: "Test company existing flows and new launched feature for any bug for blocker",
    role: "Member",
    status: ["disconnected", "runtime · missing"],
    apiKey: "neo_A-sL1UcGh7Bm-AutoTst4Rv",
    orgId: "seed",
  },
  {
    id: "ve-6",
    name: "Acko Triage & Resolve (ATR)",
    description: "ATR is an autonomous agent built to immediately intercept, investigate, and process customer emails. It assesses the intent of incoming queries.",
    role: "Member",
    status: ["connected", "runtime · active"],
    apiKey: "neo_T-wE9ZjFa5Dn-ATRsvc8Kq",
    orgId: "seed",
  },
  {
    id: "ve-7",
    name: "Content Manager",
    description: "Content Generator & Manager — To create engaging content and manage it",
    role: "Member",
    status: ["disconnected", "runtime · missing"],
    apiKey: "neo_C-pX3MoRt6Wl-CntMgr2Yb",
    orgId: "seed",
  },
  {
    id: "ve-8",
    name: "Helper",
    description: "You help in modifying things in neo and other places",
    role: "Member",
    status: ["disconnected", "runtime · missing"],
    apiKey: "neo_H-dN7QuBv4Ik-Hlpr0Ec5",
    orgId: "seed",
  },
  {
    id: "ve-9",
    name: "Health Claim Concierge",
    description: "Can co-ordinate with hospitals and internal employees on behalf of customer claims",
    role: "Member",
    status: ["connected", "runtime · active"],
    apiKey: "neo_H-fY2TsAg8Lp-HCC1Xm6",
    orgId: "seed",
  },
  {
    id: "ve-10",
    name: "Software Developer",
    description: "Writes, manages and maintains code",
    role: "Member",
    status: ["disconnected", "runtime · missing"],
    apiKey: "neo_S-vK5BjOe3Nt-SwDev7Rf",
    orgId: "seed",
  },
  {
    id: "ve-11",
    name: "ACKO Content Creator",
    description: "Creates high-quality content aligned with ACKO brand guidelines",
    role: "Member",
    status: ["connected", "runtime · active"],
    apiKey: "neo_A-hZ8WcPu1Gm-ACCcr9Ls",
    orgId: "seed",
  },
];
