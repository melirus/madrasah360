"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Student = {
  id: string;
  student_no: string | null;
  full_name: string;
};

type ExistingResult = {
  id: string;
  student_id: string;
  mark: number | null;
  grade: string | null;
  teacher_comment: string | null;
};

export default function AssessmentMarksForm({
  assessmentId,
  maximumMark,
  students,
  existingResults,
}: {
  assessmentId: string;
  maximumMark: number;
  students: Student[];
  existingResults: ExistingResult[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const initialMarks =
    students.reduce(
      (
        acc: Record<string, string>,
        student
      ) => {
        const existing =
          existingResults.find(
            (item) =>
              item.student_id ===
              student.id
          );

        acc[student.id] =
          existing?.mark !== null &&
          existing?.mark !== undefined
            ? String(existing.mark)
            : "";

        return acc;
      },
      {}
    );

  const [marks, setMarks] =
    useState<
      Record<string, string>
    >(initialMarks);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  function updateMark(
    studentId: string,
    value: string
  ) {
    setMarks((current) => ({
      ...current,
      [studentId]: value,
    }));
  }

  function calculateGrade(
    mark: number
  ) {
    const percentage =
      (mark / maximumMark) *
      100;

    if (percentage >= 80)
      return "A";

    if (percentage >= 65)
      return "B";

    if (percentage >= 50)
      return "C";

    if (percentage >= 40)
      return "D";

    return "E";
  }

  async function saveResults() {
    setError("");
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
      } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error(
          "Organization not found."
        );
      }

      for (const student of students) {
        const raw =
          marks[student.id];

        if (
          raw === "" ||
          raw === undefined
        ) {
          continue;
        }

        const mark =
          Number(raw);

        if (
          Number.isNaN(mark)
        ) {
          throw new Error(
            `Invalid mark for ${student.full_name}.`
          );
        }

        if (
          mark < 0 ||
          mark > maximumMark
        ) {
          throw new Error(
            `${student.full_name}: mark must be between 0 and ${maximumMark}.`
          );
        }

        const grade =
          calculateGrade(mark);

        const existing =
          existingResults.find(
            (item) =>
              item.student_id ===
              student.id
          );

        if (existing) {
          const { error } =
            await supabase
              .from(
                "assessment_results"
              )
              .update({
                mark,
                grade,
              })
              .eq(
                "id",
                existing.id
              );

          if (error) {
            throw new Error(
              error.message
            );
          }
        } else {
          const { error } =
            await supabase
              .from(
                "assessment_results"
              )
              .insert({
                organization_id:
                  profile.organization_id,

                assessment_id:
                  assessmentId,

                student_id:
                  student.id,

                mark,

                grade,
              });

          if (error) {
            throw new Error(
              error.message
            );
          }
        }
      }

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
    <section className="rounded-2xl border border-slate-200 bg-white">

      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="font-semibold text-slate-900">
          Student Marks
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Enter marks for the whole class.
        </p>
      </div>

      {error && (
        <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="divide-y divide-slate-100">

        {students.map(
          (student) => {
            const mark =
              marks[student.id];

            let grade = "-";

            if (
              mark !== "" &&
              !Number.isNaN(
                Number(mark)
              )
            ) {
              grade =
                calculateGrade(
                  Number(mark)
                );
            }

            return (
              <div
                key={student.id}
                className="grid items-center gap-4 px-6 py-5 md:grid-cols-[1fr_160px_100px]"
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

                <input
                  type="number"
                  min="0"
                  max={
                    maximumMark
                  }
                  value={mark}
                  onChange={(e) =>
                    updateMark(
                      student.id,
                      e.target.value
                    )
                  }
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />

                <div className="text-center">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                    {grade}
                  </span>
                </div>

              </div>
            );
          }
        )}

      </div>

      <div className="flex justify-end border-t border-slate-100 p-6">

        <button
          type="button"
          onClick={saveResults}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          <Save size={18} />

          {loading
            ? "Saving..."
            : "Save Results"}
        </button>

      </div>

    </section>
  );
}