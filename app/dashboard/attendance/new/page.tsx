import { createClient } from "@/lib/supabase/server";
import AttendanceEntryForm from "@/components/AttendanceEntryForm";

export default async function NewAttendancePage() {
  const supabase = await createClient();

  const { data: classes } =
    await supabase
      .from("classes")
      .select(`
        id,
        name,
        enrolments (
          status,
          students (
            id,
            full_name,
            student_no
          )
        )
      `)
      .eq("is_active", true)
      .order("name");

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Take Attendance
        </h1>

        <p className="mt-2 text-slate-500">
          Record attendance for one class and date.
        </p>
      </div>

      <AttendanceEntryForm
        classes={classes ?? []}
      />

    </div>
  );
}