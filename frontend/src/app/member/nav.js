import {
  Home, Search, BookOpen, BookMarked, CircleDollarSign, CreditCard, Bell, UserCog
} from "lucide-react";

export const NAV = [
  { key: "home", label: "Home", icon: Home },
  { key: "catalog", label: "Search Catalog", icon: Search },
  { key: "loans", label: "My Loans", icon: BookOpen },
  { key: "reservations", label: "My Reservations", icon: BookMarked },
  { key: "fines", label: "My Fines", icon: CircleDollarSign },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Profile / Settings", icon: UserCog },
];
