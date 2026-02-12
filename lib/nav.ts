import {
  LayoutDashboard,
  Users,
  Gavel,
  Plug,
  BarChart3,
  Settings,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: any;
};

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/app", icon: LayoutDashboard },
  { title: "Leads", href: "/app/leads", icon: Users },
  { title: "Rules", href: "/app/rules", icon: Gavel },
  { title: "Buyers", href: "/app/buyers", icon: Users },
  { title: "Integrations", href: "/app/integrations", icon: Plug },
  { title: "Reports", href: "/app/reports", icon: BarChart3 },
  { title: "Settings", href: "/app/settings", icon: Settings },
];
