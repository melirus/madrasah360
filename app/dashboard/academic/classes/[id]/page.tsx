import Link from "next/link";
import {
  ArrowLeft,
  Users,
  GraduationCap,
  BookOpen,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function ClassProfilePage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const supabase =
    await createClient();


  const { data: classInfo, error } =
    await supabase
      .from("classes")
      .select(`
        id,
        name,
        level,
        capacity,

        academic_years (
          name
        ),

        teacher_assignments (
          is_class_teacher,

          teachers (
            id,
            full_name
          ),

          subjects (
            name
          )
        ),

        enrolments (
          status,

          students (
            id,
            student_no,
            full_name,
            gender
          )
        )
      `)
      .eq("id", id)
      .single();


  if (
    error ||
    !classInfo
  ) {
    return (
      <p className="text-red-600">
        Class not found.
      </p>
    );
  }


  const enrolments =
    classInfo.enrolments ?? [];

  const activeStudents =
    enrolments.filter(
      (item: any) =>
        item.status === "active"
    );


  const assignments =
    classInfo.teacher_assignments ?? [];


  const classTeacher =
    assignments.find(
      (item: any) =>
        item.is_class_teacher
    );


  const teacherData =
    classTeacher
      ? Array.isArray(
          classTeacher.teachers
        )
        ? classTeacher.teachers[0]
        : classTeacher.teachers
      : null;


  const academicYearData =
    Array.isArray(
      classInfo.academic_years
    )
      ? classInfo.academic_years[0]
      : classInfo.academic_years;


  return (
    <div className="space-y-6">

      <Link
        href="/dashboard/academic"
        className="inline-flex items-center gap-2 text-sm text-slate-500"
      >
        <ArrowLeft size={16} />
        Back to Academic
      </Link>


      <div className="rounded-2xl border border-slate-200 bg-white p-7">

        <p className="text-sm font-medium text-emerald-700">
          Academic Year{" "}
          {
            academicYearData?.name
          }
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {classInfo.name}
        </h1>

        <p className="mt-2 text-slate-500">
          {classInfo.level || ""}
        </p>

      </div>


      <div className="grid gap-5 md:grid-cols-3">

        <Stat
          icon={Users}
          label="Students"
          value={
            activeStudents.length.toString()
          }
        />

        <Stat
          icon={GraduationCap}
          label="Class Teacher"
          value={
            teacherData?.full_name ||
            "Not assigned"
          }
        />

        <Stat
          icon={BookOpen}
          label="Teacher Assignments"
          value={
            assignments.length.toString()
          }
        />

      </div>


      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Student Roster
          </h2>

        </div>


        <div className="divide-y divide-slate-100">

          {!activeStudents.length && (

            <div className="p-8 text-center text-sm text-slate-500">
              No students enrolled.
            </div>

          )}


          {activeStudents.map(
            (enrolment: any) => {

              const student =
                Array.isArray(
                  enrolment.students
                )
                  ? enrolment.students[0]
                  : enrolment.students;

              if (!student)
                return null;

              return (
                <Link
                  key={student.id}
                  href={`/dashboard/students/${student.id}`}
                  className="flex items-center justify-between px-6 py-5 hover:bg-slate-50"
                >

                  <div>
                    <p className="font-medium text-slate-900">
                      {
                        student.full_name
                      }
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        student.student_no
                      }
                    </p>
                  </div>

                  <span className="text-sm text-slate-500">
                    {
                      student.gender ||
                      "-"
                    }
                  </span>

                </Link>
              );
            }
          )}

        </div>

      </section>


      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Teaching Assignments
          </h2>

        </div>


        <div className="divide-y divide-slate-100">

          {!assignments.length && (

            <div className="p-8 text-center text-sm text-slate-500">
              No teachers assigned.
            </div>

          )}


          {assignments.map(
            (assignment: any) => {

              const teacher =
                Array.isArray(
                  assignment.teachers
                )
                  ? assignment.teachers[0]
                  : assignment.teachers;

              const subject =
                Array.isArray(
                  assignment.subjects
                )
                  ? assignment.subjects[0]
                  : assignment.subjects;

              return (
                <div
                  key={`${teacher?.id}-${subject?.name}`}
                  className="flex items-center justify-between px-6 py-5"
                >

                  <div>
                    <p className="font-medium text-slate-900">
                      {
                        teacher?.full_name ??
                        "Teacher"
                      }
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        subject?.name ??
                        "General"
                      }
                    </p>
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


function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">

      <div className="flex items-center gap-4">

        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
          <Icon size={21} />
        </div>

        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {value}
          </p>
        </div>

      </div>

    </div>
  );
}