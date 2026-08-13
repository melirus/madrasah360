"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type ClassItem = {
  id: string;
  name: string;
  academic_year_id: string | null;
};

type Subject = {
  id: string;
  name: string;
};

export default function NewAssessmentForm({
  classes,
  subjects,
}: {
  classes: ClassItem[];
  subjects: Subject[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] =
    useState("");

  const [classId, setClassId] =
    useState("");

  const [subjectId, setSubjectId] =
    useState("");

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const [maximumMark, setMaximumMark] =
    useState("100");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function saveAssessment() {
    setError("");

    if (!name) {
      setError(
        "Please enter assessment name."
      );
      return;
    }

    if (!classId) {
      setError(
        "Please select class."
      );
      return;
    }

    if (!subjectId) {
      setError(
        "Please select subject."
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

      const { data: profile } =
        await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single();

      if (!profile?.organization_id) {
        throw new Error(
          "Organization not found."
        );
      }

      const selectedClass =
        classes.find(
          (item) =>
            item.id === classId
        );

      if (
        !selectedClass?.academic_year_id
      ) {
        throw new Error(
          "Academic year not found."
        );
      }

      const {
        data: assessment,
        error: assessmentError,
      } = await supabase
        .from("assessments")
        .insert({
          organization_id:
            profile.organization_id,

          academic_year_id:
            selectedClass.academic_year_id,

          subject_id:
            subjectId,

          class_id:
            classId,

          name:
            name.trim(),

          assessment_date:
            date,

          maximum_mark:
            Number(maximumMark),
        })
        .select()
        .single();

      if (
        assessmentError ||
        !assessment
      ) {
        throw new Error(
          assessmentError?.message ??
            "Unable to create assessment."
        );
      }

      router.push(
        `/dashboard/assessment/${assessment.id}`
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6">

        <div className="grid gap-5 md:grid-cols-2">

          <Field label="Assessment Name">
            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Ujian Pertengahan Tahun"
              className={inputStyle}
            />
          </Field>

          <Field label="Date">
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
          </Field>

          <Field label="Class">
            <select
              value={classId}
              onChange={(e) =>
                setClassId(
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
          </Field>

          <Field label="Subject">
            <select
              value={subjectId}
              onChange={(e) =>
                setSubjectId(
                  e.target.value
                )
              }
              className={inputStyle}
            >
              <option value="">
                Select subject
              </option>

              {subjects.map(
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
          </Field>

          <Field label="Maximum Mark">
            <input
              type="number"
              min="1"
              value={maximumMark}
              onChange={(e) =>
                setMaximumMark(
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </Field>

        </div>

      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveAssessment}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          <Save size={18} />

          {loading
            ? "Saving..."
            : "Create Assessment"}
        </button>
      </div>

    </div>
  );
}

const inputStyle =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}