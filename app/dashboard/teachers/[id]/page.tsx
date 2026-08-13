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

      <div className="rounded-2xl border border-slate-200 bg-white p-7">

        <div className="flex items-center gap-5">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <UserRound size={30} />
          </div>

          <div>
            <p className="text-sm font-medium text-emerald-700">
              {teacher.staff_no}
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
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

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Current Assignments
          </h2>

        </div>

        <div className="divide-y divide-slate-100">

          {!teacher.teacher_assignments?.length && (

            <div className="p-8 text-center text-sm text-slate-500">
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
                  className="flex items-center justify-between px-6 py-5"
                >

                  <div className="flex items-center gap-4">

                    <School className="text-emerald-600" />

                    <div>
                      <p className="font-medium text-slate-900">
                        {classData?.name || "No class"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {subjectData?.name || "General"}
                      </p>
                    </div>

                  </div>

                  {assignment.is_class_teacher && (

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
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