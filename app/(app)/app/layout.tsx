"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/shell/sidebar";
import { Topbar } from "@/components/ui/shell/topbar";

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : "";
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const authed = getCookie("lf_auth") === "1";

    if (!authed) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-muted/40">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
