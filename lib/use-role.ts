"use client";

import { useEffect, useState } from "react";
import type { Role } from "@/lib/rbac";

function getCookie(name: string) {
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : "";
}

export function useRole() {
  const [role, setRole] = useState<Role>("admin");

  useEffect(() => {
    const r = (getCookie("lf_role") as Role) || "admin";
    setRole(r);
  }, []);

  return role;
}
