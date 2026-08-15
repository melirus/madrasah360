"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Item = {
  id: string;
  name: string;
};

export default function TeacherAssignmentForm({
  teacherId,
  classes,
  subjects,
}: {
  teacherId: string;
  classes: Item[];
  subjects: Item[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [classTeacher, setClassTeacher] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function addAssignment() {
    if (!classId) {
      setError("Please select a class.");
      return;
    }

    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated.");
      setLoading(false);
      return;
    }

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

    if (!profile?.organization_id) {
      setError("Organization not found.");
      setLoading(false);
      return;
    }

    const { error } =
      await supabase
        .from("teacher_assignments")
        .insert({
          organization_id:
            profile.organization_id,

          teacher_id:
            teacherId,

          class_id:
            classId,

          subject_id:
            subjectId || null,

          is_class_teacher:
            classTeacher,
        });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setClassId("");
    setSubjectId("");
    setClassTeacher(false);
    setLoading(false);

    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6">

      <h2 className="font-semibold text-slate-900">
        Add Teaching Assignment
      </h2>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        Assign this teacher to a class and subject.
      </p>


      <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:gap-4 md:grid-cols-3">

        <select
          value={classId}
          onChange={(e) =>
            setClassId(e.target.value)
          }
          className={inputStyle}
        >
          <option value="">
            Select class
          </option>

          {classes.map((item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {item.name}
            </option>
          ))}
        </select>


        <select
          value={subjectId}
          onChange={(e) =>
            setSubjectId(e.target.value)
          }
          className={inputStyle}
        >
          <option value="">
            General / No subject
          </option>

          {subjects.map((item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {item.name}
            </option>
          ))}
        </select>


        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 md:col-span-3">

          <input
            type="checkbox"
            checked={classTeacher}
            onChange={(e) =>
              setClassTeacher(
                e.target.checked
              )
            }
          />

          <span className="whitespace-nowrap text-sm text-slate-700">
            Class Teacher
          </span>

        </label>

      </div>


      {error && (
        <p className="mt-4 break-words text-sm leading-6 text-red-600">
          {error}
        </p>
      )}


      <button
        type="button"
        disabled={loading}
        onClick={addAssignment}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <Plus size={17} />

        {loading
          ? "Adding..."
          : "Add Assignment"}
      </button>

    </section>
  );
}

const inputStyle =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:px-4";