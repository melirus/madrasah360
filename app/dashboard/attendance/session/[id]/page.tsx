import Link from "next/link";
import {
  ArrowLeft,
  UserCheck,
  UserX,
  Clock3,
  CircleCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function AttendanceSessionPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: session,
    error,
  } = await supabase
    .from("attendance_sessions")
    .select(`
      id,
      attendance_date,

      classes (
        name
      ),

      attendance_records (
        id,
        status,
        remarks,

        students (
          id,
          student_no,
          full_name
        )
      )
    `)
    .eq("id", id)
    .single();

  if (
    error ||
    !session
  ) {
    return (
      <p className="text-red-600">
        Attendance session not found.
      </p>
    );
  }

  const records =
    session.attendance_records ??
    [];

  const classData =
    Array.isArray(
      session.classes
    )
      ? session.classes[0]
      : session.classes;

  const present =
    records.filter(
      (item: any) =>
        item.status === "present"
    ).length;

  const absent =
    records.filter(
      (item: any) =>
        item.status === "absent"
    ).length;

  const late =
    records.filter(
      (item: any) =>
        item.status === "late"
    ).length;

  const excused =
    records.filter(
      (item: any) =>
        item.status === "excused"
    ).length;

  return (
    <div className="space-y-6">

      <Link
        href="/dashboard/attendance"
        className="inline-flex items-center gap-2 text-sm text-slate-500"
      >
        <ArrowLeft size={16} />
        Back to Attendance
      </Link>

      <div>
        <p className="text-sm font-medium text-emerald-700">
          {session.attendance_date}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {classData?.name ??
            "Attendance Session"}
        </h1>
      </div>

      <div className="grid gap-5 md:grid-cols-4">

        <Stat
          icon={UserCheck}
          label="Present"
          value={present.toString()}
        />

        <Stat
          icon={UserX}
          label="Absent"
          value={absent.toString()}
        />

        <Stat
          icon={Clock3}
          label="Late"
          value={late.toString()}
        />

        <Stat
          icon={CircleCheck}
          label="Excused"
          value={excused.toString()}
        />

      </div>

      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Attendance Records
          </h2>

        </div>

        <div className="divide-y divide-slate-100">

          {records.map(
            (record: any) => {
              const student =
                Array.isArray(
                  record.students
                )
                  ? record.students[0]
                  : record.students;

              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between px-6 py-5"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {
                        student?.full_name ??
                        "Student"
                      }
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        student?.student_no ??
                        "-"
                      }
                    </p>
                  </div>

                  <AttendanceBadge
                    status={
                      record.status
                    }
                  />
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-center gap-4">

        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
          <Icon size={20} />
        </div>

        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

      </div>

    </div>
  );
}

function AttendanceBadge({
  status,
}: {
  status: string;
}) {
  let style =
    "bg-slate-100 text-slate-600";

  if (status === "present") {
    style =
      "bg-emerald-50 text-emerald-700";
  }

  if (status === "absent") {
    style =
      "bg-red-50 text-red-700";
  }

  if (status === "late") {
    style =
      "bg-amber-50 text-amber-700";
  }

  if (status === "excused") {
    style =
      "bg-blue-50 text-blue-700";
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${style}`}
    >
      {status}
    </span>
  );
}