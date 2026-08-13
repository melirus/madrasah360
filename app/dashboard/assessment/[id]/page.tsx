import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import AssessmentMarksForm from "@/components/AssessmentMarksForm";

export default async function AssessmentDetailPage({
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
    data: assessment,
    error,
  } = await supabase
    .from("assessments")
    .select(`
      id,
      name,
      assessment_date,
      maximum_mark,
      class_id,

      classes (
        name,
        enrolments (
          status,
          students (
            id,
            student_no,
            full_name
          )
        )
      ),

      subjects (
        name
      ),

      assessment_results (
        id,
        student_id,
        mark,
        grade,
        teacher_comment
      )
    `)
    .eq("id", id)
    .single();

  if (
    error ||
    !assessment
  ) {
    return (
      <p className="text-red-600">
        Assessment not found.
      </p>
    );
  }

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

  const students =
    classData?.enrolments
      ?.filter(
        (item: any) =>
          item.status === "active"
      )
      .map((item: any) => {
        const student =
          Array.isArray(
            item.students
          )
            ? item.students[0]
            : item.students;

        return student;
      })
      .filter(Boolean) ?? [];

  return (
    <div className="space-y-6">

      <Link
        href="/dashboard/assessment"
        className="inline-flex items-center gap-2 text-sm text-slate-500"
      >
        <ArrowLeft size={16} />
        Back to Assessment
      </Link>

      <div>
        <p className="text-sm font-medium text-emerald-700">
          {subjectData?.name ?? "-"}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {assessment.name}
        </h1>

        <p className="mt-2 text-slate-500">
          {classData?.name ?? "-"}
          {" · "}
          {assessment.assessment_date}
          {" · "}
          Maximum{" "}
          {assessment.maximum_mark}
        </p>
      </div>

      <AssessmentMarksForm
        assessmentId={
          assessment.id
        }
        maximumMark={
          Number(
            assessment.maximum_mark
          )
        }
        students={students}
        existingResults={
          assessment.assessment_results ??
          []
        }
      />

    </div>
  );
}