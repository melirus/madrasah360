import { createClient } from "@/lib/supabase/server";
import NewInvoiceForm from "@/components/NewInvoiceForm";

export default async function NewInvoicePage() {
  const supabase = await createClient();

  const { data: students } =
    await supabase
      .from("students")
      .select(`
        id,
        full_name,
        student_no
      `)
      .eq("status", "active")
      .order("full_name");

  const { data: categories } =
    await supabase
      .from("fee_categories")
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
          New Student Invoice
        </h1>

        <p className="mt-2 text-slate-500">
          Generate a fee invoice for one student.
        </p>
      </div>

      <NewInvoiceForm
        students={students ?? []}
        categories={categories ?? []}
      />

    </div>
  );
}