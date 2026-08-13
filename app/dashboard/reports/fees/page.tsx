import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export default async function FeeReportsPage() {
  const supabase = await createClient();

  const { data: students } =
    await supabase
      .from("students")
      .select(`
        id,
        student_no,
        full_name
      `)
      .eq("status", "active")
      .order("full_name");

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Fee Statements
        </h1>

        <p className="mt-2 text-slate-500">
          Select a student to view the full fee statement.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="divide-y divide-slate-100">

          {!students?.length && (
            <div className="p-8 text-center text-sm text-slate-500">
              No students found.
            </div>
          )}

          {students?.map(
            (student) => (
              <Link
                key={student.id}
                href={`/dashboard/reports/fees/${student.id}`}
                className="flex items-center justify-between px-6 py-5 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {student.full_name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {student.student_no}
                  </p>
                </div>

                <span className="text-sm font-medium text-emerald-700">
                  View Statement
                </span>
              </Link>
            )
          )}

        </div>

      </section>

    </div>
  );
}