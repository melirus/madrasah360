import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import PaymentForm from "@/components/PaymentForm";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: invoice,
    error,
  } = await supabase
    .from("student_fees")
    .select(`
      id,
      invoice_no,
      description,
      amount,
      discount_amount,
      due_date,
      status,
      student_id,

      students (
        id,
        full_name,
        student_no,

        student_guardians (
          is_primary,
          guardians (
            full_name,
            whatsapp_number
          )
        )
      ),

      fee_categories (
        name
      ),

      payment_allocations (
        amount,
        payments (
          id,
          receipt_no,
          payment_date,
          amount,
          payment_method
        )
      )
    `)
    .eq("id", id)
    .single();

  if (
    error ||
    !invoice
  ) {
    return (
      <p className="text-red-600">
        Invoice not found.
      </p>
    );
  }

  const student =
    Array.isArray(invoice.students)
      ? invoice.students[0]
      : invoice.students;

  const category =
    Array.isArray(invoice.fee_categories)
      ? invoice.fee_categories[0]
      : invoice.fee_categories;

  const allocations =
    invoice.payment_allocations ?? [];

  const paid =
    allocations.reduce(
      (sum: number, item: any) =>
        sum +
        Number(item.amount),
      0
    );

  const netAmount =
    Number(invoice.amount) -
    Number(invoice.discount_amount ?? 0);

  const balance =
    Math.max(
      netAmount - paid,
      0
    );

  return (
    <div className="space-y-6">

      <Link
        href="/dashboard/finance"
        className="inline-flex items-center gap-2 text-sm text-slate-500"
      >
        <ArrowLeft size={16} />
        Back to Finance
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-7">

        <p className="text-sm font-medium text-emerald-700">
          {invoice.invoice_no}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {student?.full_name ?? "Student"}
        </h1>

        <p className="mt-2 text-slate-500">
          {category?.name ?? "Fee"}
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-4">

          <Info
            label="Invoice Amount"
            value={`RM${Number(invoice.amount).toFixed(2)}`}
          />

          <Info
            label="Discount"
            value={`RM${Number(
              invoice.discount_amount ?? 0
            ).toFixed(2)}`}
          />

          <Info
            label="Paid"
            value={`RM${paid.toFixed(2)}`}
          />

          <Info
            label="Balance"
            value={`RM${balance.toFixed(2)}`}
          />

        </div>

      </div>

      {balance > 0 && (
        <PaymentForm
          invoiceId={invoice.id}
          studentId={invoice.student_id}
          balance={balance}
        />
      )}

      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Payment History
          </h2>
        </div>

        <div className="divide-y divide-slate-100">

          {!allocations.length && (
            <div className="p-8 text-center text-sm text-slate-500">
              No payments yet.
            </div>
          )}

          {allocations.map(
            (allocation: any) => {
              const payment =
                Array.isArray(
                  allocation.payments
                )
                  ? allocation.payments[0]
                  : allocation.payments;

              return (
                <div
                  key={
                    payment?.id ??
                    Math.random()
                  }
                  className="flex items-center justify-between px-6 py-5"
                >
                  <div>
                    <Link
                        href={`/dashboard/finance/receipts/${payment?.id}`}
                        className="font-medium text-emerald-700 hover:underline"
  >
                      {payment?.receipt_no ?? "Receipt"}
                    </Link>

                    <p className="mt-1 text-sm text-slate-500">
                      {payment?.payment_date ?? "-"}
                      {" · "}
                      {payment?.payment_method ?? "-"}
                    </p>
                  </div>

                  <p className="font-semibold text-slate-900">
                    RM{Number(allocation.amount).toFixed(2)}
                  </p>
                </div>
              );
            }
          )}

        </div>

      </section>

    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}