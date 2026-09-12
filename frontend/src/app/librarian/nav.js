import {
  LayoutDashboard, BookOpen, Boxes, UserCheck, LogOut, LogIn,
  RefreshCw, BookMarked, CircleDollarSign, FileBarChart2, Bell, Settings
} from "lucide-react";

export const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "catalog", label: "Books / Catalog", icon: BookOpen },
  { key: "inventory", label: "Inventory", icon: Boxes },
  { key: "members", label: "Members", icon: UserCheck },
  { key: "checkout", label: "Check-out", icon: LogOut },
  { key: "checkin", label: "Check-in / Returns", icon: LogIn },
  { key: "renewals", label: "Renewals", icon: RefreshCw },
  { key: "reservations", label: "Reservations", icon: BookMarked },
  { key: "fines", label: "Fines", icon: CircleDollarSign },
  { key: "reports", label: "Reports", icon: FileBarChart2 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: Settings },
];

