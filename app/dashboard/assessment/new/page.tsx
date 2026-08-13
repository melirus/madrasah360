import { createClient } from "@/lib/supabase/server";
import NewAssessmentForm from "@/components/NewAssessmentForm";

export default async function NewAssessmentPage() {
  const supabase = await createClient();

  const { data: classes } =
    await supabase
      .from("classes")
      .select(`
        id,
        name,
        academic_year_id
      `)
      .eq("is_active", true)
      .order("name");

  const { data: subjects } =
    await supabase
      .from("subjects")
      .select(`
        id,
        name
      `)
      .eq("is_active", true)
      .order("name");

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          New Assessment
        </h1>

        <p className="mt-2 text-slate-500">
          Create a new exam or assessment.
        </p>
      </div>

      <NewAssessmentForm
        classes={classes ?? []}
        subjects={subjects ?? []}
      />

    </div>
  );
}