export type Role = "admin" | "operator" | "viewer";

export type Permission =
  | "rules:read"
  | "rules:write"
  | "buyers:read"
  | "buyers:write"
  | "leads:read"
  | "integrations:read"
  | "integrations:write"
  | "reports:read"
  | "settings:read"
  | "settings:write";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "rules:read",
    "rules:write",
    "buyers:read",
    "buyers:write",
    "leads:read",
    "integrations:read",
    "integrations:write",
    "reports:read",
    "settings:read",
    "settings:write",
  ],
  operator: [
    "rules:read",
    // no rules:write
    "buyers:read",
    // no buyers:write
    "leads:read",
    "integrations:read",
    "reports:read",
    "settings:read",
  ],
  viewer: [
    "rules:read",
    "buyers:read",
    "leads:read",
    "reports:read",
    "settings:read",
  ],
};

export function hasPermission(role: Role, perm: Permission) {
  return ROLE_PERMISSIONS[role].includes(perm);
}
