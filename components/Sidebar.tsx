"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GraduationCap,
  School,
  BookOpen,
  ClipboardCheck,
  FileText,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";

type SidebarProps = {
  role: string;
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["super_admin", "school_admin", "finance", "teacher"],
    },
    {
      name: "Students",
      href: "/dashboard/students",
      icon: Users,
      roles: ["super_admin", "school_admin", "finance", "teacher"],
    },
    {
      name: "Admissions",
      href: "/dashboard/admissions",
      icon: UserPlus,
      roles: ["super_admin", "school_admin"],
    },
    {
      name: "Teachers",
      href: "/dashboard/teachers",
      icon: GraduationCap,
      roles: ["super_admin", "school_admin"],
    },
    {
      name: "Academic",
      href: "/dashboard/academic",
      icon: School,
      roles: ["super_admin", "school_admin", "teacher"],
    },
    {
      name: "Hafazan",
      href: "/dashboard/hafazan",
      icon: BookOpen,
      roles: ["super_admin", "school_admin", "teacher"],
    },
    {
      name: "Attendance",
      href: "/dashboard/attendance",
      icon: ClipboardCheck,
      roles: ["super_admin", "school_admin", "teacher"],
    },
    {
      name: "Assessment",
      href: "/dashboard/assessment",
      icon: FileText,
      roles: ["super_admin", "school_admin", "teacher"],
    },
    {
      name: "Finance",
      href: "/dashboard/finance",
      icon: Wallet,
      roles: ["super_admin", "school_admin", "finance"],
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      icon: BarChart3,
      roles: ["super_admin", "school_admin", "finance"],
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      roles: ["super_admin", "school_admin"],
    },
  ];

  const allowedMenu = menuItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 text-white">
      <div className="flex h-full flex-col">

        <div className="border-b border-slate-800 px-6 py-6">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 font-bold">
              M
            </div>

            <div>
              <h1 className="font-semibold">
                Madrasah360
              </h1>

              <p className="text-xs text-slate-400">
                Management System
              </p>
            </div>

          </div>
        </div>


        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1">

            {allowedMenu.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-emerald-600 text-white"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon size={19} />

                  <span>{item.name}</span>
                </Link>
              );
            })}

          </div>
        </nav>


        <div className="border-t border-slate-800 px-6 py-4">
          <p className="text-xs text-slate-500">
            Madrasah360 Demo
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Version 1.0
          </p>
        </div>

      </div>
    </aside>
  );
}