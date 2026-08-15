import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StudentTable from "@/components/StudentTable";

type Enrolment = {
  status: string;
  classes:
    | { name: string }
    | { name: string }[]
    | null;
};

type StudentRecord = {
  id: string;
  student_no: string | null;
  full_name: string;
  gender: string | null;
  status: string;
  enrolments: Enrolment[] | null;
};

export default async function StudentsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select(`
      id,
      student_no,
      full_name,
      gender,
      status,
      enrolments (
        status,
        classes (
          name
        )
      )
    `)
    .order("full_name");

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Students
        </h1>

        <p className="mt-3 break-words text-sm leading-6 text-red-600 sm:mt-4 sm:text-base">
          Failed to load students: {error.message}
        </p>
      </div>
    );
  }

  const records = (data ?? []) as unknown as StudentRecord[];

  const students = records.map((student) => {
    const activeEnrolment =
      student.enrolments?.find(
        (item) => item.status === "active"
      );

    const classData = activeEnrolment?.classes;

    let className = "Not Assigned";

    if (Array.isArray(classData)) {
      className = classData[0]?.name ?? "Not Assigned";
    } else if (classData) {
      className = classData.name;
    }

    return {
      id: student.id,
      student_no: student.student_no,
      full_name: student.full_name,
      gender: student.gender,
      status: student.status,
      class_name: className,
    };
  });

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Students
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500 sm:mt-2 sm:text-base">
            Manage student records and enrolment.
          </p>
        </div>


        <Link
          href="/dashboard/students/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 sm:w-auto"
        >
          <Plus size={18} />
          Add Student
        </Link>

      </div>


      <StudentTable students={students} />

    </div>
  );
}