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
  students: Student | Student[] | null;
};

type ClassItem = {
  id: string;
  name: string;
  enrolments: Enrolment[] | null;
};

type Teacher = {
  id: string;
  full_name: string;
};

type HafazanType = {
  id: string;
  code: string;
  name: string;
  term: string;
  minimum_quantity: number | null;
  minimum_unit: string | null;
};

export default function HafazanEntryForm({
  classes,
  teachers,
  hafazanTypes,
}: {
  classes: ClassItem[];
  teachers: Teacher[];
  hafazanTypes: HafazanType[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const [recordDate, setRecordDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [hafazanTypeId, setHafazanTypeId] =
    useState("");

  const [juzuk, setJuzuk] = useState("");
  const [surah, setSurah] = useState("");
  const [maqra, setMaqra] = useState("");
  const [ayatFrom, setAyatFrom] = useState("");
  const [ayatTo, setAyatTo] = useState("");

  const [grade, setGrade] = useState("");
  const [mistakes, setMistakes] = useState("0");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const students = useMemo(() => {
    const selectedClass = classes.find(
      (item) => item.id === classId
    );

    if (!selectedClass?.enrolments) {
      return [];
    }

    return selectedClass.enrolments
      .filter(
        (enrolment) =>
          enrolment.status === "active"
      )
      .map((enrolment) => {
        const student = Array.isArray(
          enrolment.students
        )
          ? enrolment.students[0]
          : enrolment.students;

        return student;
      })
      .filter(Boolean) as Student[];
  }, [classes, classId]);

  const selectedHafazanType =
    useMemo(() => {
      return hafazanTypes.find(
        (item) =>
          item.id === hafazanTypeId
      );
    }, [
      hafazanTypes,
      hafazanTypeId,
    ]);

  async function saveRecord() {
    setError("");
    setSaved(false);

    if (!classId) {
      setError(
        "Please select a class."
      );
      return;
    }

    if (!studentId) {
      setError(
        "Please select a student."
      );
      return;
    }

    if (!hafazanTypeId) {
      setError(
        "Please select a hafazan type."
      );
      return;
    }

    if (!juzuk) {
      setError(
        "Please enter juzuk."
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "User not authenticated."
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

      const {
        error: insertError,
      } = await supabase
        .from("hafazan_records")
        .insert({
          organization_id:
            profile.organization_id,

          student_id:
            studentId,

          teacher_id:
            teacherId || null,

          record_date:
            recordDate,

          hafazan_type_id:
            hafazanTypeId,

          juzuk:
            Number(juzuk),

          surah:
            surah || null,

          maqra:
            maqra || null,

          ayat_from:
            ayatFrom
              ? Number(ayatFrom)
              : null,

          ayat_to:
            ayatTo
              ? Number(ayatTo)
              : null,

          grade:
            grade || null,

          mistakes_count:
            mistakes
              ? Number(mistakes)
              : 0,

          teacher_comment:
            comment || null,
        });

      if (insertError) {
        throw new Error(
          insertError.message
        );
      }

      setSaved(true);

      setSurah("");
      setMaqra("");
      setAyatFrom("");
      setAyatTo("");
      setGrade("");
      setMistakes("0");
      setComment("");

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

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Hafazan record saved successfully.
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Student Selection
          </h2>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">

          <Field label="Class">
            <select
              value={classId}
              onChange={(e) => {
                setClassId(
                  e.target.value
                );

                setStudentId("");
              }}
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
          </Field>

          <Field label="Student">
            <select
              value={studentId}
              onChange={(e) =>
                setStudentId(
                  e.target.value
                )
              }
              className={inputStyle}
            >
              <option value="">
                Select student
              </option>

              {students.map(
                (student) => (
                  <option
                    key={student.id}
                    value={student.id}
                  >
                    {
                      student.full_name
                    }
                  </option>
                )
              )}
            </select>
          </Field>

          <Field label="Teacher">
            <select
              value={teacherId}
              onChange={(e) =>
                setTeacherId(
                  e.target.value
                )
              }
              className={inputStyle}
            >
              <option value="">
                Select teacher
              </option>

              {teachers.map(
                (teacher) => (
                  <option
                    key={teacher.id}
                    value={teacher.id}
                  >
                    {
                      teacher.full_name
                    }
                  </option>
                )
              )}
            </select>
          </Field>

          <Field label="Date">
            <input
              type="date"
              value={recordDate}
              onChange={(e) =>
                setRecordDate(
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </Field>

        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Hafazan Record
          </h2>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">

          <Field label="Jenis Hafazan">
            <select
              value={hafazanTypeId}
              onChange={(e) =>
                setHafazanTypeId(
                  e.target.value
                )
              }
              className={inputStyle}
            >
              <option value="">
                Pilih jenis hafazan
              </option>

              {hafazanTypes.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.term} —{" "}
                    {item.name}
                  </option>
                )
              )}
            </select>
          </Field>

          <Field label="Juzuk">
            <input
              type="number"
              min="1"
              max="30"
              value={juzuk}
              onChange={(e) =>
                setJuzuk(
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </Field>

          {selectedHafazanType && (
            <div className="md:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4">

              <p className="font-semibold text-emerald-900">
                {
                  selectedHafazanType.term
                }
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                {
                  selectedHafazanType.name
                }
              </p>

              <p className="mt-2 text-sm text-emerald-700">
                Minimum:{" "}
                {
                  selectedHafazanType.minimum_quantity
                }{" "}
                {
                  selectedHafazanType.minimum_unit
                }
              </p>

            </div>
          )}

          <Field label="Surah">
            <input
              value={surah}
              onChange={(e) =>
                setSurah(
                  e.target.value
                )
              }
              placeholder="Al-Baqarah"
              className={inputStyle}
            />
          </Field>

          <Field label="Maqra'">
            <input
              value={maqra}
              onChange={(e) =>
                setMaqra(
                  e.target.value
                )
              }
              placeholder="Maqra 1"
              className={inputStyle}
            />
          </Field>

          <Field label="Ayat From">
            <input
              type="number"
              value={ayatFrom}
              onChange={(e) =>
                setAyatFrom(
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </Field>

          <Field label="Ayat To">
            <input
              type="number"
              value={ayatTo}
              onChange={(e) =>
                setAyatTo(
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </Field>

          <Field label="Gred">
            <select
              value={grade}
              onChange={(e) =>
                setGrade(
                  e.target.value
                )
              }
              className={inputStyle}
            >
              <option value="">
                Pilih gred
              </option>

              <option value="A">
                A
              </option>

              <option value="B">
                B
              </option>

              <option value="C">
                C
              </option>

              <option value="D">
                D
              </option>

              <option value="X">
                X
              </option>
            </select>
          </Field>

          <Field label="Mistakes">
            <input
              type="number"
              min="0"
              value={mistakes}
              onChange={(e) =>
                setMistakes(
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </Field>

          <Field
            label="Teacher Comment"
            wide
          >
            <textarea
              rows={4}
              value={comment}
              onChange={(e) =>
                setComment(
                  e.target.value
                )
              }
              placeholder="Catatan guru..."
              className={inputStyle}
            />
          </Field>

        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveRecord}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          <Save size={18} />

          {loading
            ? "Saving..."
            : "Save Hafazan"}
        </button>
      </div>

    </div>
  );
}

const inputStyle =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

function Field({
  label,
  wide = false,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        wide ? "md:col-span-2" : ""
      }
    >
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}