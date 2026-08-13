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
        <h1 className="text-3xl font-bold text-slate-900">
          Students
        </h1>

        <p className="mt-4 text-red-600">
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

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Students
          </h1>

          <p className="mt-2 text-slate-500">
            Manage student records and enrolment.
          </p>
        </div>


        <Link
          href="/dashboard/students/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus size={18} />
          Add Student
        </Link>

      </div>


      <StudentTable students={students} />

    </div>
  );
}