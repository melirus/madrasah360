import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { createClient } from "@/lib/supabase/server";
import MobileSidebar from "@/components/MobileSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  const userId = data.claims.sub;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(`
      full_name,
      role,
      organizations (
        name
      )
    `)
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    redirect("/login");
  }

  const organizationData = profile.organizations as
    | { name: string }
    | { name: string }[]
    | null;

  const organizationName = Array.isArray(organizationData)
    ? organizationData[0]?.name ?? "Madrasah"
    : organizationData?.name ?? "Madrasah";

  return (
    <div className="min-h-screen bg-slate-50">

    <div className="hidden lg:block">
        <Sidebar role={profile.role} />
    </div>

    <MobileSidebar role={profile.role} />

    <div className="min-h-screen lg:ml-64">

        <Topbar
          fullName={profile.full_name}
          role={profile.role}
          organizationName={organizationName}
        />

        <main className="p-8p-4 sm:p-6 lg:p-8">
          {children}
        </main>

      </div>

    </div>
  );
}