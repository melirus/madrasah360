import { createClient } from "@/lib/supabase/server";
import FeeStructureForm from "@/components/FeeStructureForm";

export default async function FeeStructurePage() {
  const supabase = await createClient();

  const { data: categories } =
    await supabase
      .from("fee_categories")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

  const { data: classes } =
    await supabase
      .from("classes")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

  const { data: years } =
    await supabase
      .from("academic_years")
      .select("id, name, is_current")
      .order("start_date", {
        ascending: false,
      });

  const { data: structures } =
    await supabase
      .from("fee_structures")
      .select(`
        id,
        amount,
        frequency,
        due_day,

        fee_categories (
          name
        ),

        classes (
          name
        ),

        academic_years (
          name
        )
      `)
      .order("created_at", {
        ascending: false,
      });

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Fee Structure
        </h1>

        <p className="mt-2 text-slate-500">
          Configure fees by category, class and academic year.
        </p>
      </div>

      <FeeStructureForm
        categories={categories ?? []}
        classes={classes ?? []}
        years={years ?? []}
      />

      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Existing Fee Structures
          </h2>
        </div>

        <div className="divide-y divide-slate-100">

          {!structures?.length && (
            <div className="p-8 text-center text-sm text-slate-500">
              No fee structures created.
            </div>
          )}

          {structures?.map((item: any) => {
            const category =
              Array.isArray(item.fee_categories)
                ? item.fee_categories[0]
                : item.fee_categories;

            const classData =
              Array.isArray(item.classes)
                ? item.classes[0]
                : item.classes;

            const year =
              Array.isArray(item.academic_years)
                ? item.academic_years[0]
                : item.academic_years;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-6 py-5"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {category?.name ?? "Fee"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {classData?.name ?? "All Classes"}
                    {" · "}
                    {year?.name ?? "-"}
                    {" · "}
                    {item.frequency}
                  </p>
                </div>

                <p className="font-semibold text-slate-900">
                  RM{Number(item.amount).toFixed(2)}
                </p>
              </div>
            );
          })}

        </div>

      </section>

    </div>
  );
}