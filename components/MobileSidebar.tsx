"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import LogoutButton from "@/components/LogoutButton";

export default function MobileSidebar({
  role,
}: {
  role: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu size={21} />
      </button>

      {/* Dark overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Mobile drawer */}
      <div
          className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col bg-white shadow-xl transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* Close button */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Close navigation menu"
        >
          <X size={20} />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Sidebar 
            role={role} 
            mobile 
            onNavigate={() => setOpen(false)}
          />
        </div>

        <div className="border-t border-slate-200 p-4">
          <LogoutButton />
        </div>

      </div>
    </>
  );
}