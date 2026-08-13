import Link from "next/link";
import {
  BookOpen,
  Users,
  CheckCircle2,
  Plus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";


export default async function HafazanPage() {

  const supabase =
    await createClient();


  const today =
    new Date()
      .toISOString()
      .slice(0, 10);


  const { data: todayRecords } =
    await supabase
      .from("hafazan_records")
      .select(`
        id,
        record_type,
        student_id
      `)
      .eq("record_date", today);


  const { data: totalStudents } =
    await supabase
      .from("students")
      .select("id")
      .eq("status", "active");


  const uniqueStudentsToday =
    new Set(
      todayRecords?.map(
        (record) =>
          record.student_id
      )
    ).size;


  const hafazanBaruCount =
    todayRecords?.filter(
      (record) =>
        record.record_type ===
        "hafazan_baru"
    ).length ?? 0;


  const murajaahCount =
    todayRecords?.filter(
      (record) =>
        record.record_type ===
        "murajaah"
    ).length ?? 0;


  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-slate-900">
            Hafazan
          </h1>

          <p className="mt-2 text-slate-500">
            Manage daily hafazan, tasmi&apos; and murajaah.
          </p>

        </div>


        <Link
          href="/dashboard/hafazan/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus size={18} />
          Record Hafazan
        </Link>

      </div>


      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={Users}
          label="Active Students"
          value={
            (
              totalStudents?.length ??
              0
            ).toString()
          }
        />

        <StatCard
          icon={CheckCircle2}
          label="Recorded Today"
          value={
            uniqueStudentsToday.toString()
          }
        />

        <StatCard
          icon={BookOpen}
          label="Hafazan Baru"
          value={
            hafazanBaruCount.toString()
          }
        />

        <StatCard
          icon={BookOpen}
          label="Murajaah"
          value={
            murajaahCount.toString()
          }
        />

      </div>


      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Quick Actions
          </h2>

        </div>


        <div className="grid gap-4 p-6 md:grid-cols-2">

          <Link
            href="/dashboard/hafazan/new"
            className="rounded-xl border border-slate-200 p-5 hover:border-emerald-300 hover:bg-emerald-50"
          >

            <p className="font-medium text-slate-900">
              Daily Hafazan Entry
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Record hafazan, tasmi&apos; or murajaah for students.
            </p>

          </Link>


          <Link
            href="/dashboard/students"
            className="rounded-xl border border-slate-200 p-5 hover:border-emerald-300 hover:bg-emerald-50"
          >

            <p className="font-medium text-slate-900">
              Student Progress
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Open Student 360° to review hafazan history.
            </p>

          </Link>

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