"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-700 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">
              M
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Madrasah360
          </h1>

          <p className="text-slate-500 mt-2">
            Madrasah Management System
          </p>
        </div>


        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

          <h2 className="text-xl font-semibold text-slate-900">
            Sign in
          </h2>

          <p className="text-sm text-slate-500 mt-1 mb-6">
            Enter your account details
          </p>


          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@madrasah.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>


            {error && (
              <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}


            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2"
            >
              <LogIn size={18} />

              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Madrasah360 Demo Platform
        </p>

      </div>
    </main>
  );
}