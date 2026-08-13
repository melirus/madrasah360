import Link from "next/link";
import {
  ClipboardCheck,
  Users,
  UserCheck,
  UserX,
  Plus,
    Clock3,
  CircleCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function AttendancePage() {
  const supabase = await createClient();

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const { data: sessions } =
    await supabase
      .from("attendance_sessions")
      .select(`
        id,
        attendance_date,
        class_id,
        classes (
          name
        ),
        attendance_records (
          status
        )
      `)
      .eq("attendance_date", today);

  const { data: activeStudents } =
    await supabase
      .from("students")
      .select("id")
      .eq("status", "active");

  let presentCount = 0;
let lateCount = 0;
let excusedCount = 0;
let absentCount = 0;
let recordedCount = 0;

sessions?.forEach((session: any) => {
  const records =
    session.attendance_records ?? [];

  recordedCount += records.length;

  presentCount += records.filter(
    (record: any) =>
      record.status === "present"
  ).length;

  lateCount += records.filter(
    (record: any) =>
      record.status === "late"
  ).length;

  excusedCount += records.filter(
    (record: any) =>
      record.status === "excused"
  ).length;

  absentCount += records.filter(
    (record: any) =>
      record.status === "absent"
  ).length;
});

const attendedCount =
  presentCount + lateCount;

const attendanceRate =
  recordedCount > 0
    ? Math.round(
        (attendedCount / recordedCount) *
          100
      )
    : 0;

  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Attendance
          </h1>

          <p className="mt-2 text-slate-500">
            Manage daily student attendance.
          </p>
        </div>

        <Link
          href="/dashboard/attendance/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus size={18} />
          Take Attendance
        </Link>

      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">

        <StatCard
  icon={Users}
  label="Active Students"
  value={(activeStudents?.length ?? 0).toString()}
/>

<StatCard
  icon={ClipboardCheck}
  label="Recorded Today"
  value={recordedCount.toString()}
/>

<StatCard
  icon={UserCheck}
  label="Present"
  value={presentCount.toString()}
/>

<StatCard
  icon={Clock3}
  label="Late"
  value={lateCount.toString()}
/>

<StatCard
  icon={CircleCheck}
  label="Excused"
  value={excusedCount.toString()}
/>

<StatCard
  icon={UserX}
  label="Absent"
  value={absentCount.toString()}
/>

      </div>

      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Today&apos;s Class Sessions
          </h2>
        </div>

        <div className="divide-y divide-slate-100">

          {!sessions?.length && (
            <div className="p-8 text-center text-sm text-slate-500">
              No attendance recorded today.
            </div>
          )}

          {sessions?.map((session: any) => {
            const classData =
              Array.isArray(session.classes)
                ? session.classes[0]
                : session.classes;

            const records =
              session.attendance_records ?? [];

            return (
              <Link
                key={session.id}
                href={`/dashboard/attendance/session/${session.id}`}
                className="flex items-center justify-between px-6 py-5 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {classData?.name ?? "Class"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {session.attendance_date}
                  </p>
                </div>

                <span className="text-sm text-slate-500">
                  {records.length} students
                </span>
              </Link>
            );
          })}

        </div>

      </section>

    </div>
  );
}

function StatCard({
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

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
          <Icon size={21} />
        </div>

      </div>

    </div>
  );
}