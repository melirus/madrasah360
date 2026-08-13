import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Star,
  AlertCircle,
  ListChecks,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";


export default async function StudentHafazanPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {

  const { id } =
    await params;

  const supabase =
    await createClient();


  const { data: student } =
    await supabase
      .from("students")
      .select(`
        id,
        full_name,
        student_no
      `)
      .eq("id", id)
      .single();


const { data: records } =
  await supabase
    .from("hafazan_records")
    .select(`
      id,
      record_date,

      hafazan_types (
        code,
        name,
        term
      ),

      juzuk,
      surah,
      maqra,
      ayat_from,
      ayat_to,

      grade,

      mistakes_count,

      teacher_comment,

      teachers (
        full_name
      )
    `)
    .eq("student_id", id)
    .order(
      "record_date",
      { ascending: false }
    );


  if (!student) {

    return (
      <p className="text-red-600">
        Student not found.
      </p>
    );

  }


  const latest =
    records?.[0];

  const ratedRecords =
    records?.filter(
      (record) =>
        record.grade !== null
    ) ?? [];






  const totalMistakes =
    records?.reduce(
      (sum, record) =>
        sum +
        Number(
          record.mistakes_count ??
          0
        ),
      0
    ) ?? 0;


  return (
    <div className="space-y-6">

      <Link
        href={`/dashboard/students/${id}`}
        className="inline-flex items-center gap-2 text-sm text-slate-500"
      >
        <ArrowLeft size={16} />
        Back to Student
      </Link>


      <div>

        <p className="text-sm font-medium text-emerald-700">
          {
            student.student_no
          }
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {student.full_name}
        </h1>

        <p className="mt-2 text-slate-500">
          Hafazan Progress
        </p>

      </div>


      <div className="grid gap-5 md:grid-cols-4">

        <Stat
          icon={BookOpen}
          label="Latest Juzuk"
          value={
            latest?.juzuk
              ? `Juzuk ${latest.juzuk}`
              : "-"
          }
        />

        <Stat
          icon={ListChecks}
          label="Total Records"
          value={
            (
              records?.length ??
              0
            ).toString()
          }
        />

        <Stat
          icon={AlertCircle}
          label="Total Mistakes"
          value={
            totalMistakes.toString()
          }
        />

      </div>


      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

  {[
    ["nazirah", "Nazirah"],
    ["saba", "Saba'"],
    ["pra_saba", "Pra Saba'"],
    ["mukhtar", "Mukhtar"],
    [
      "mukhtar_khatam",
      "Mukhtar Khatam"
    ],
  ].map(([code, label]) => {

    const count =
      records?.filter(
        (record: any) => {

          const type =
            Array.isArray(
              record.hafazan_types
            )
              ? record.hafazan_types[0]
              : record.hafazan_types;

          return type?.code === code;

        }
      ).length ?? 0;

    return (
      <div
        key={code}
        className="rounded-xl border border-slate-200 bg-white p-5"
      >

        <p className="text-sm text-slate-500">
          {label}
        </p>

        <p className="mt-2 text-2xl font-bold text-slate-900">
          {count}
        </p>

      </div>
    );

  })}

</div>

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Hafazan History
          </h2>

        </div>


        <div className="divide-y divide-slate-100">

          {!records?.length && (

            <div className="p-8 text-center text-sm text-slate-500">
              No hafazan records.
            </div>

          )}


{records?.map((record: any) => {
  const type =
    Array.isArray(
      record.hafazan_types
    )
      ? record.hafazan_types[0]
      : record.hafazan_types;

  const teacher =
    Array.isArray(
      record.teachers
    )
      ? record.teachers[0]
      : record.teachers;

  return (
    <div
      key={record.id}
      className="p-6"
    >
      <div className="flex items-start justify-between">

        <div>
          <p className="font-medium text-slate-900">
            {type?.term ?? "Hafazan"}
            {record.juzuk
              ? ` · Juzuk ${record.juzuk}`
              : ""}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {type?.name ?? "-"}
          </p>
        </div>

        <span className="text-sm text-slate-500">
          {record.record_date}
        </span>

      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-5">

        <SmallInfo
          label="Surah : Ayat"
          value={
            record.surah
              ? `${record.surah}${
                  record.ayat_from &&
                  record.ayat_to
                    ? ` : ${record.ayat_from}-${record.ayat_to}`
                    : ""
                }`
              : "-"
          }
        />

        <SmallInfo
          label="Juzuk"
          value={
            record.juzuk
              ? `Juzuk ${record.juzuk}`
              : "-"
          }
        />

        <SmallInfo
          label="Maqra'"
          value={
            record.maqra ?? "-"
          }
        />

        <SmallInfo
          label="Gred"
          value={
            record.grade ?? "-"
          }
        />

        <SmallInfo
          label="Mistakes"
          value={Number(
            record.mistakes_count ?? 0
          ).toString()}
        />

      </div>

      {record.teacher_comment && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">

          <p className="text-sm text-slate-600">
            {record.teacher_comment}
          </p>

          {teacher && (
            <p className="mt-2 text-xs text-slate-400">
              Recorded by{" "}
              {teacher.full_name}
            </p>
          )}

        </div>
      )}

    </div>
  );
})}

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

          <p className="text-xs text-slate-500">
            {label}
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}


function SmallInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div>

      <p className="text-xs uppercase text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {value}
      </p>

    </div>
  );
}