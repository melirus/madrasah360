import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export default async function StudentReportsPage() {
  const supabase = await createClient();

  const { data: students } =
    await supabase
      .from("students")
      .select(`
        id,
        student_no,
        full_name,
        status,

        enrolments (
          status,

          classes (
            name
          )
        )
      `)
      .order("full_name");

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Student Reports
        </h1>

        <p className="mt-2 text-slate-500">
          Select a student to open the Student 360° report.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="divide-y divide-slate-100">

          {students?.map(
            (student: any) => {
              const enrolment =
                student.enrolments?.find(
                  (item: any) =>
                    item.status ===
                    "active"
                );

              const classData =
                Array.isArray(
                  enrolment?.classes
                )
                  ? enrolment.classes[0]
                  : enrolment?.classes;

              return (
                <Link
                  key={student.id}
                  href={`/dashboard/students/${student.id}`}
                  className="flex items-center justify-between px-6 py-5 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {student.full_name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {student.student_no}
                      {" · "}
                      {classData?.name ??
                        "No class"}
                    </p>
                  </div>

                  <span className="text-sm font-medium text-emerald-700">
                    Student 360°
                  </span>
                </Link>
              );
            }
          )}

        </div>

      </section>

    </div>
  );
}