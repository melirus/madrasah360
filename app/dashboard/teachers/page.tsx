import Link from "next/link";
import { Plus, UserRound, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function TeachersPage() {
  const supabase = await createClient();

  const { data: teachers, error } = await supabase
    .from("teachers")
    .select(`
      id,
      staff_no,
      full_name,
      phone,
      email,
      status
    `)
    .order("full_name");

  if (error) {
    return (
      <p className="text-red-600">
        Failed to load teachers: {error.message}
      </p>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Teachers
          </h1>

          <p className="mt-2 text-slate-500">
            Manage teacher profiles and academic assignments.
          </p>
        </div>

        <Link
          href="/dashboard/teachers/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus size={18} />
          Add Teacher
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Teacher Directory
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {teachers?.length ?? 0} teacher records
          </p>
        </div>

        <div className="divide-y divide-slate-100">

          {!teachers?.length && (
            <div className="p-10 text-center text-sm text-slate-500">
              No teachers registered.
            </div>
          )}

          {teachers?.map((teacher) => (
            <Link
              key={teacher.id}
              href={`/dashboard/teachers/${teacher.id}`}
              className="flex items-center justify-between px-6 py-5 hover:bg-slate-50"
            >
              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <UserRound size={20} />
                </div>

                <div>
                  <p className="font-medium text-slate-900">
                    {teacher.full_name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {teacher.staff_no || "No staff number"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">

                <div className="text-right">
                  <p className="text-sm text-slate-600">
                    {teacher.phone || "-"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {teacher.email || ""}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">
                  {teacher.status}
                </span>
              </div>
            </Link>
          ))}

        </div>
      </div>
    </div>
  );
}