export type LeadStatus =
  | "accepted"
  | "rejected"
  | "duplicate"
  | "pending"
  | "delivered"
  | "failed";

export type DeliveryAttempt = {
  id: string;
  buyer: string;
  responseCode: number;
  latencyMs: number;
  createdAt: string;
  outcome: "success" | "failed";
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: string;
  createdAt: string;
  status: LeadStatus;
  buyer?: string;
  city?: string;
  budget?: number;
  deliveryAttempts?: DeliveryAttempt[];
  payload?: Record<string, any>;
};

export const DASHBOARD_STATS = {
  leadsToday: 2314,
  deliveredToday: 1987,
  rejectedToday: 214,
  revenueToday: 1420.5, // demo
  acceptanceRate: 0.86,
};

export const LEADS_RECENT: Lead[] = [
  {
    id: "LD-10492",
    name: "Ivan Petrov",
    phone: "+359 88 123 4567",
    source: "Meta Lead Ads",
    createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    status: "delivered",
    buyer: "SolarPro BG",

    // ✅ add these here
    deliveryAttempts: [
      {
        id: "ATT-1",
        buyer: "SolarPro BG",
        responseCode: 200,
        latencyMs: 342,
        createdAt: new Date().toISOString(),
        outcome: "success",
      },
      {
        id: "ATT-2",
        buyer: "Backup Buyer",
        responseCode: 500,
        latencyMs: 812,
        createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        outcome: "failed",
      },
    ],
    payload: {
      name: "Ivan Petrov",
      phone: "+359 88 123 4567",
      city: "Sofia",
      budget: 12000,
      source: "Meta Lead Ads",
    },
  },
  {
    id: "LD-10490",
    name: "Georgi Dimitrov",
    phone: "+359 87 321 9988",
    source: "CSV Import",
    createdAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    status: "rejected",
  },
  {
    id: "LD-10489",
    name: "Elena Ivanova",
    phone: "+359 88 990 1100",
    source: "Webhook",
    createdAt: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
    status: "accepted",
    buyer: "HeatPump Partner",
  },
  {
    id: "LD-10488",
    name: "Nikolay Georgiev",
    phone: "+359 88 222 1010",
    source: "Meta Lead Ads",
    createdAt: new Date(Date.now() - 1000 * 60 * 68).toISOString(),
    status: "pending",
  },
];

export const LEADS_7DAYS = [
  { day: "Mon", leads: 1680 },
  { day: "Tue", leads: 2040 },
  { day: "Wed", leads: 1960 },
  { day: "Thu", leads: 2210 },
  { day: "Fri", leads: 2390 },
  { day: "Sat", leads: 1420 },
  { day: "Sun", leads: 1780 },
];
