"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Student = {
  id: string;
  full_name: string;
  student_no: string | null;
};

type Enrolment = {
  status: string;
  students:
    | Student
    | Student[]
    | null;
};

type ClassItem = {
  id: string;
  name: string;
  enrolments:
    | Enrolment[]
    | null;
};

type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused";

export default function AttendanceEntryForm({
  classes,
}: {
  classes: ClassItem[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [classId, setClassId] =
    useState("");

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const [attendance, setAttendance] =
    useState<
      Record<string, AttendanceStatus>
    >({});

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const students =
    useMemo(() => {
      const selectedClass =
        classes.find(
          (item) =>
            item.id === classId
        );

      if (!selectedClass?.enrolments) {
        return [];
      }

      return selectedClass.enrolments
        .filter(
          (item) =>
            item.status === "active"
        )
        .map((item) => {
          const student =
            Array.isArray(item.students)
              ? item.students[0]
              : item.students;

          return student;
        })
        .filter(Boolean) as Student[];
    }, [classes, classId]);

  function chooseClass(value: string) {
    setClassId(value);

    const selectedClass =
      classes.find(
        (item) =>
          item.id === value
      );

    const initial: Record<
      string,
      AttendanceStatus
    > = {};

    selectedClass?.enrolments
      ?.filter(
        (item) =>
          item.status === "active"
      )
      .forEach((item) => {
        const student =
          Array.isArray(item.students)
            ? item.students[0]
            : item.students;

        if (student) {
          initial[student.id] =
            "present";
        }
      });

    setAttendance(initial);
  }

  function setStatus(
    studentId: string,
    status: AttendanceStatus
  ) {
    setAttendance((current) => ({
      ...current,
      [studentId]: status,
    }));
  }

  async function saveAttendance() {
    setError("");

    if (!classId) {
      setError(
        "Please select a class."
      );
      return;
    }

    if (!students.length) {
      setError(
        "No active students found in this class."
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "Not authenticated."
        );
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (
        profileError ||
        !profile?.organization_id
      ) {
        throw new Error(
          "Organization not found."
        );
      }

      const organizationId =
        profile.organization_id;

      const {
        data: existingSession,
      } = await supabase
        .from("attendance_sessions")
        .select("id")
        .eq("class_id", classId)
        .eq("attendance_date", date)
        .maybeSingle();

      let sessionId =
        existingSession?.id;

      if (!sessionId) {
        const {
          data: session,
          error: sessionError,
        } = await supabase
          .from("attendance_sessions")
          .insert({
            organization_id:
              organizationId,

            class_id:
              classId,

            attendance_date:
              date,

            recorded_by:
              user.id,
          })
          .select()
          .single();

        if (
          sessionError ||
          !session
        ) {
          throw new Error(
            sessionError?.message ??
              "Unable to create attendance session."
          );
        }

        sessionId =
          session.id;
      }

      for (const student of students) {
        const status =
          attendance[student.id] ??
          "present";

        const {
          data: existingRecord,
        } = await supabase
          .from("attendance_records")
          .select("id")
          .eq(
            "attendance_session_id",
            sessionId
          )
          .eq(
            "student_id",
            student.id
          )
          .maybeSingle();

        if (existingRecord) {
          const { error } =
            await supabase
              .from("attendance_records")
              .update({
                status,
              })
              .eq(
                "id",
                existingRecord.id
              );

          if (error) {
            throw new Error(
              error.message
            );
          }
        } else {
          const { error } =
            await supabase
              .from("attendance_records")
              .insert({
                organization_id:
                  organizationId,

                attendance_session_id:
                  sessionId,

                student_id:
                  student.id,

                status,
              });

          if (error) {
            throw new Error(
              error.message
            );
          }
        }
      }

      router.push(
        `/dashboard/attendance/session/${sessionId}`
      );

      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="grid gap-5 p-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Class
            </label>

            <select
              value={classId}
              onChange={(e) =>
                chooseClass(
                  e.target.value
                )
              }
              className={inputStyle}
            >
              <option value="">
                Select class
              </option>

              {classes.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </div>

        </div>

      </section>

      {students.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-semibold text-slate-900">
              Student Roster
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              All students default to Present.
            </p>
          </div>

          <div className="divide-y divide-slate-100">

            {students.map(
              (student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between gap-5 px-6 py-5"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {
                        student.full_name
                      }
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        student.student_no ??
                        "-"
                      }
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">

                    {(
                      [
                        [
                          "present",
                          "Present",
                        ],
                        [
                          "absent",
                          "Absent",
                        ],
                        [
                          "late",
                          "Late",
                        ],
                        [
                          "excused",
                          "Excused",
                        ],
                      ] as [
                        AttendanceStatus,
                        string
                      ][]
                    ).map(
                      ([
                        value,
                        label,
                      ]) => {
                        const active =
                          attendance[
                            student.id
                          ] === value;

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setStatus(
                                student.id,
                                value
                              )
                            }
                            className={`rounded-lg px-3 py-2 text-xs font-medium ${
                              active
                                ? "bg-emerald-700 text-white"
                                : "border border-slate-200 bg-white text-slate-600"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      }
                    )}

                  </div>
                </div>
              )
            )}

          </div>

        </section>
      )}

      <div className="flex justify-end">

        <button
          type="button"
          onClick={saveAttendance}
          disabled={
            loading ||
            !classId
          }
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          <Save size={18} />

          {loading
            ? "Saving..."
            : "Save Attendance"}
        </button>

      </div>

    </div>
  );
}

const inputStyle =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";