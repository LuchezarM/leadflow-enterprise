"use client";

import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

type Role = "admin" | "operator" | "viewer";

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : "";
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
}

export function Topbar() {
  const [role, setRole] = useState<Role>("admin");

  useEffect(() => {
    const r = (getCookie("lf_role") as Role) || "admin";
    setRole(r);
  }, []);

  const changeRole = (r: Role) => {
    setCookie("lf_role", r);
    setRole(r);
    // reload to apply middleware/UI guards
    window.location.reload();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium">LeadFlow</div>
        <span className="hidden text-xs text-muted-foreground md:inline">
          Lead routing & delivery console
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:block">
          <Input
            placeholder="Search leads, buyers, rules…"
            className="w-[320px]"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            document.cookie = "lf_auth=; path=/; max-age=0";
            document.cookie = "lf_role=; path=/; max-age=0";
            window.location.replace("/login"); // <- важно
          }}
        >
          Logout
        </Button>

        {/* Role switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Role: {role} <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => changeRole("admin")}>
              Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeRole("operator")}>
              Operator
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeRole("viewer")}>
              Viewer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
