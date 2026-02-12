export type Operator = "equals" | "contains" | "gt" | "lt";

export type Condition = {
  field: "source" | "city" | "budget" | "status";
  op: Operator;
  value: string;
};

export type Action =
  | { type: "route"; buyerId: string }
  | { type: "reject"; reason: string }
  | { type: "tag"; tag: string };

export type Rule = {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  conditions: Condition[];
  action: Action;
  fallbackAction?: Action; // 👈 add this
  updatedAt: string;
};

export type Buyer = {
  id: string;
  name: string;
  active: boolean;
};

export const BUYERS: Buyer[] = [
  { id: "b1", name: "SolarPro BG", active: true },
  { id: "b2", name: "HeatPump Partner", active: true },
  { id: "b3", name: "Backup Buyer", active: true },
];

export const RULES: Rule[] = [
  {
    id: "r1",
    name: "Meta leads → SolarPro",
    enabled: true,
    priority: 1,
    conditions: [
      { field: "source", op: "contains", value: "Meta" },
      { field: "city", op: "equals", value: "Sofia" },
    ],
    action: { type: "route", buyerId: "b1" },
      fallbackAction: { type: "route", buyerId: "b3" }, // 👈 add this
    updatedAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
  },
  {
    id: "r2",
    name: "Budget > 10k → HeatPump",
    enabled: true,
    priority: 2,
    conditions: [{ field: "budget", op: "gt", value: "10000" }],
    action: { type: "route", buyerId: "b2" },
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "r3",
    name: "Reject duplicates",
    enabled: true,
    priority: 0,
    conditions: [{ field: "status", op: "equals", value: "duplicate" }],
    action: { type: "reject", reason: "Duplicate lead" },
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
];
