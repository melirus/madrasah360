import Link from "next/link";
import {
  CalendarDays,
  School,
  BookOpen,
  ChevronRight,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function AcademicPage() {
  const supabase = await createClient();

  const { data: years } = await supabase
    .from("academic_years")
    .select("*")
    .order("start_date", {
      ascending: false,
    });

  const { data: classes } = await supabase
    .from("classes")
    .select(`
      id,
      name,
      level,
      capacity,
      academic_years (
        name,
        is_current
      )
    `)
    .eq("is_active", true)
    .order("name");

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Academic
        </h1>

        <p className="mt-2 text-slate-500">
          Manage academic years, classes and subjects.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">

        <Stat
          label="Academic Years"
          value={(years?.length ?? 0).toString()}
          icon={CalendarDays}
        />

        <Stat
          label="Classes"
          value={(classes?.length ?? 0).toString()}
          icon={School}
        />

        <Stat
          label="Subjects"
          value={(subjects?.length ?? 0).toString()}
          icon={BookOpen}
        />

      </div>

      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Classes
          </h2>

        </div>

        <div className="divide-y divide-slate-100">

          {classes?.map((item: any) => (
            <Link
              key={item.id}
              href={`/dashboard/academic/classes/${item.id}`}
              className="flex items-center justify-between px-6 py-5 hover:bg-slate-50"
            >

              <div>
                <p className="font-medium text-slate-900">
                  {item.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {item.level || "-"}
                </p>
              </div>

              <ChevronRight
                size={18}
                className="text-slate-400"
              />

            </Link>
          ))}

        </div>

      </section>


      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Subjects
          </h2>

        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">

          {subjects?.map((subject) => (

            <div
              key={subject.id}
              className="rounded-xl border border-slate-200 p-5"
            >

              <p className="font-medium text-slate-900">
                {subject.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {subject.subject_code || "-"}
                {" · "}
                {subject.category || "General"}
              </p>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}


function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
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