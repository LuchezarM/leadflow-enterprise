export type AuthType = "none" | "api_key" | "bearer";

export type FieldMapRow = {
  from: string; // internal field
  to: string;   // buyer field
};

export type Buyer = {
  id: string;
  name: string;
  active: boolean;
  endpoint: string;
  authType: AuthType;
  dailyCap: number;
  sentToday: number;
  timeoutMs: number;
  mapping: FieldMapRow[];
};

export const BUYERS: Buyer[] = [
  {
    id: "b1",
    name: "SolarPro BG",
    active: true,
    endpoint: "https://api.solarpro.bg/leads",
    authType: "bearer",
    dailyCap: 250,
    sentToday: 118,
    timeoutMs: 6000,
    mapping: [
      { from: "name", to: "full_name" },
      { from: "phone", to: "phone" },
      { from: "email", to: "email" },
      { from: "city", to: "city" },
      { from: "budget", to: "budget" },
      { from: "source", to: "source" },
    ],
  },
  {
    id: "b2",
    name: "HeatPump Partner",
    active: true,
    endpoint: "https://leads.heatpump.bg/intake",
    authType: "api_key",
    dailyCap: 120,
    sentToday: 96,
    timeoutMs: 8000,
    mapping: [
      { from: "name", to: "name" },
      { from: "phone", to: "phone_number" },
      { from: "city", to: "city" },
      { from: "budget", to: "estimate_budget" },
      { from: "source", to: "campaign_source" },
    ],
  },
  {
    id: "b3",
    name: "Backup Buyer",
    active: false,
    endpoint: "https://backup.example.com/leads",
    authType: "none",
    dailyCap: 9999,
    sentToday: 0,
    timeoutMs: 5000,
    mapping: [
      { from: "name", to: "name" },
      { from: "phone", to: "phone" },
      { from: "source", to: "source" },
    ],
  },
];

export const INTERNAL_FIELDS = [
  "name",
  "phone",
  "email",
  "city",
  "budget",
  "source",
  "status",
] as const;
