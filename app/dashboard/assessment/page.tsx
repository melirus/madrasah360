import Link from "next/link";
import {
  FileText,
  GraduationCap,
  School,
  Plus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function AssessmentPage() {
  const supabase = await createClient();

  const { data: assessments } =
    await supabase
      .from("assessments")
      .select(`
        id,
        name,
        assessment_date,
        maximum_mark,

        classes (
          name
        ),

        subjects (
          name
        ),

        assessment_results (
          id
        )
      `)
      .order("assessment_date", {
        ascending: false,
      });

  const totalAssessments =
    assessments?.length ?? 0;

  const totalResults =
    assessments?.reduce(
      (sum: number, item: any) =>
        sum +
        (
          item.assessment_results?.length ??
          0
        ),
      0
    ) ?? 0;

  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Assessment
          </h1>

          <p className="mt-2 text-slate-500">
            Manage exams, assessments and student results.
          </p>
        </div>

        <Link
          href="/dashboard/assessment/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus size={18} />
          New Assessment
        </Link>

      </div>

      <div className="grid gap-5 md:grid-cols-3">

        <StatCard
          icon={FileText}
          label="Assessments"
          value={totalAssessments.toString()}
        />

        <StatCard
          icon={GraduationCap}
          label="Results Entered"
          value={totalResults.toString()}
        />

        <StatCard
          icon={School}
          label="Academic Year"
          value="2026"
        />

      </div>

      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Assessments
          </h2>
        </div>

        <div className="divide-y divide-slate-100">

          {!assessments?.length && (
            <div className="p-8 text-center text-sm text-slate-500">
              No assessments created yet.
            </div>
          )}

          {assessments?.map(
            (assessment: any) => {
              const classData =
                Array.isArray(
                  assessment.classes
                )
                  ? assessment.classes[0]
                  : assessment.classes;

              const subjectData =
                Array.isArray(
                  assessment.subjects
                )
                  ? assessment.subjects[0]
                  : assessment.subjects;

              return (
                <Link
                  key={assessment.id}
                  href={`/dashboard/assessment/${assessment.id}`}
                  className="flex items-center justify-between px-6 py-5 hover:bg-slate-50"
                >

                  <div>
                    <p className="font-medium text-slate-900">
                      {assessment.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {subjectData?.name ?? "-"}
                      {" · "}
                      {classData?.name ?? "-"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-slate-600">
                      {
                        assessment.assessment_date ??
                        "-"
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {
                        assessment.assessment_results
                          ?.length ?? 0
                      } results
                    </p>
                  </div>

                </Link>
              );
            }
          )}

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