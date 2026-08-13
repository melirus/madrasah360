import { createClient } from "@/lib/supabase/server";
import AddStudentForm from "@/components/AddStudentForm";

export default async function NewStudentPage() {
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select(`
      id,
      name,
      academic_year_id,
      academic_years (
        name,
        is_current
      )
    `)
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Add Student
        </h1>

        <p className="mt-2 text-slate-500">
          Register a new student and primary guardian.
        </p>
      </div>


      <AddStudentForm
  classes={(classes ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    academic_year_id:
      item.academic_year_id,
  }))}
/>

    </div>
  );
}