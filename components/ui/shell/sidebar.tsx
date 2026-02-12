"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 border-r bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center px-6">
        <div className="text-sm font-semibold tracking-tight">
          LeadFlow
        </div>
        <span className="ml-2 rounded-md border px-2 py-0.5 text-[10px] text-muted-foreground">
          Concept
        </span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/app" && pathname.startsWith(item.href));

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  "text-muted-foreground hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          Demo workspace
        </div>
        <div className="mt-1 text-sm font-medium">
          NestX Labs
        </div>
      </div>
    </aside>
  );
}
