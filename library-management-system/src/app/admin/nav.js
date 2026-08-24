import {
  LayoutDashboard, Users, ShieldCheck, Building2, BookOpen, Boxes,
  RefreshCw, CircleDollarSign, BookMarked, Bell, FileBarChart2,
  ScrollText, Settings
} from "lucide-react";

export const NAV = [
  { key: "dashboard", label: "Dashboard / Analytics", icon: LayoutDashboard },
  { key: "users", label: "User Management", icon: Users },
  { key: "roles", label: "Role & Permission Management", icon: ShieldCheck },
  { key: "branches", label: "Branch/Library Configuration", icon: Building2 },
  { key: "catalog", label: "Catalog", icon: BookOpen },
  { key: "inventory", label: "Inventory", icon: Boxes },
  { key: "circulation", label: "Circulation", icon: RefreshCw },
  { key: "fines", label: "Fines & Payments", icon: CircleDollarSign },
  { key: "reservations", label: "Reservations", icon: BookMarked },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "reports", label: "Reports", icon: FileBarChart2 },
  { key: "audit", label: "Audit Logs", icon: ScrollText },
  { key: "settings", label: "Settings", icon: Settings },
];
