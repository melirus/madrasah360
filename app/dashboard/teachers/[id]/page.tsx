import Link from "next/link";
import {
  ArrowLeft,
  UserRound,
  School,
  BookOpen,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import TeacherAssignmentForm from "@/components/TeacherAssignmentForm";

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: teacher, error } =
    await supabase
      .from("teachers")
      .select(`
        *,
        teacher_assignments (
          id,
          is_class_teacher,
          classes (
            id,
            name
          ),
          subjects (
            id,
            name
          )
        )
      `)
      .eq("id", id)
      .single();

  if (error || !teacher) {
    return (
      <p className="text-red-600">
        Teacher not found.
      </p>
    );
  }

  const { data: classes } =
    await supabase
      .from("classes")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

  const { data: subjects } =
    await supabase
      .from("subjects")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

  return (
    <div className="space-y-6">

      <Link
        href="/dashboard/teachers"
        className="inline-flex items-center gap-2 text-sm text-slate-500"
      >
        <ArrowLeft size={16} />
        Back to Teachers
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-7">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 sm:h-16 sm:w-16">
            <UserRound size={28} className="sm:hidden" />
            <UserRound size={30} className="hidden sm:block" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="break-all text-sm font-medium text-emerald-700">
              {teacher.staff_no}
            </p>

            <h1 className="mt-1 break-words text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              {teacher.full_name}
            </h1>

            <p className="mt-2 text-sm capitalize text-slate-500">
              {teacher.status}
            </p>
          </div>

        </div>

      </div>


      <TeacherAssignmentForm
        teacherId={teacher.id}
        classes={classes ?? []}
        subjects={subjects ?? []}
      />


      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">

          <h2 className="font-semibold text-slate-900">
            Current Assignments
          </h2>

        </div>

        <div className="divide-y divide-slate-100">

          {!teacher.teacher_assignments?.length && (

            <div className="p-6 text-center text-sm text-slate-500 sm:p-8">
              No assignments yet.
            </div>

          )}


          {teacher.teacher_assignments?.map(
            (assignment: any) => {

              const classData =
                Array.isArray(
                  assignment.classes
                )
                  ? assignment.classes[0]
                  : assignment.classes;

              const subjectData =
                Array.isArray(
                  assignment.subjects
                )
                  ? assignment.subjects[0]
                  : assignment.subjects;

              return (
                <div
                  key={assignment.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5"
                >

                  <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">

                    <School className="text-emerald-600 shrink-0" />

                    <div className="min-w-0 flex-1">
                      <p className="break-words font-medium leading-snug text-slate-900">
                        {classData?.name || "No class"}
                      </p>

                      <p className="mt-1 break-words text-sm text-slate-500">
                        {subjectData?.name || "General"}
                      </p>
                    </div>

                  </div>

                  {assignment.is_class_teacher && (

                    <span className="self-start shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:self-auto">
                      Class Teacher
                    </span>

                  )}

                </div>
              );
            }
          )}

        </div>

      </section>

    </div>
  );
}