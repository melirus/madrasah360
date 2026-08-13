import { createClient } from "@/lib/supabase/server";
import HafazanEntryForm from "@/components/HafazanEntryForm";

export default async function NewHafazanPage() {
  const supabase =
    await createClient();

  const { data: classes } =
    await supabase
      .from("classes")
      .select(`
        id,
        name,
        enrolments (
          status,
          students (
            id,
            full_name,
            student_no
          )
        )
      `)
      .eq("is_active", true)
      .order("name");

  const { data: teachers } =
    await supabase
      .from("teachers")
      .select(`
        id,
        full_name
      `)
      .eq("status", "active")
      .order("full_name");

  const { data: hafazanTypes } =
    await supabase
      .from("hafazan_types")
      .select(`
        id,
        code,
        name,
        term,
        minimum_quantity,
        minimum_unit
      `)
      .eq("is_active", true)
      .order("sort_order");

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Record Hafazan
        </h1>

        <p className="mt-2 text-slate-500">
          Record daily hafazan progress.
        </p>
      </div>

      <HafazanEntryForm
        classes={classes ?? []}
        teachers={teachers ?? []}
        hafazanTypes={
          hafazanTypes ?? []
        }
      />

    </div>
  );
}