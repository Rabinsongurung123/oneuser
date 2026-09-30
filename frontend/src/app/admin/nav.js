import {
  LayoutDashboard, Users, BookOpen, Boxes,
  RefreshCw, CircleDollarSign, BookMarked, Bell,
  ScrollText, Settings, Tags, PenLine, Building, Package
} from "lucide-react";

export const NAV = [
  { key: "dashboard", label: "Dashboard / Analytics", icon: LayoutDashboard },
  { key: "users", label: "User Management", icon: Users },
  { key: "catalog", label: "Catalog", icon: BookOpen },
  { key: "copies", label: "Copies", icon: Package },
  { key: "categories", label: "Categories", icon: Tags },
  { key: "authors", label: "Authors", icon: PenLine },
  { key: "publishers", label: "Publishers", icon: Building },
  { key: "inventory", label: "Inventory", icon: Boxes },
  { key: "circulation", label: "Circulation", icon: RefreshCw },
  { key: "fines", label: "Fines & Payments", icon: CircleDollarSign },
  { key: "reservations", label: "Reservations", icon: BookMarked },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "audit", label: "Audit Logs", icon: ScrollText },
  { key: "settings", label: "Settings", icon: Settings },
];
