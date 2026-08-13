import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/PrintButton";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: payment,
    error,
  } = await supabase
    .from("payments")
    .select(`
      id,
      receipt_no,
      payment_date,
      amount,
      payment_method,
      reference_number,
      notes,

      students (
        id,
        student_no,
        full_name
      ),

      organizations (
        name,
        short_name,
        phone,
        address_line1,
        address_line2,
        postcode,
        city,
        state
      ),

      payment_allocations (
        amount,

        student_fees (
          invoice_no,
          description,

          fee_categories (
            name
          )
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !payment) {
    return (
      <p className="text-red-600">
        Receipt not found.
      </p>
    );
  }

  const student =
    Array.isArray(payment.students)
      ? payment.students[0]
      : payment.students;

  const organization =
    Array.isArray(payment.organizations)
      ? payment.organizations[0]
      : payment.organizations;

  const allocations =
    payment.payment_allocations ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      <div className="flex items-center justify-between print:hidden">

        <Link
          href="/dashboard/finance"
          className="inline-flex items-center gap-2 text-sm text-slate-500"
        >
          <ArrowLeft size={16} />
          Back to Finance
        </Link>

        <PrintButton />

      </div>

      <div className="bg-white p-10 print:p-0">

        <div className="border-b-2 border-slate-900 pb-6 text-center">

          <h1 className="text-2xl font-bold text-slate-900">
            {organization?.name ?? "Madrasah"}
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            {[
              organization?.address_line1,
              organization?.address_line2,
              organization?.postcode,
              organization?.city,
              organization?.state,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>

          {organization?.phone && (
            <p className="mt-1 text-sm text-slate-600">
              Tel: {organization.phone}
            </p>
          )}

          <h2 className="mt-6 text-xl font-bold uppercase tracking-wide">
            Official Receipt
          </h2>

        </div>

        <div className="mt-8 grid grid-cols-2 gap-6">

          <Info
            label="Receipt No."
            value={payment.receipt_no}
          />

          <Info
            label="Payment Date"
            value={payment.payment_date}
          />

          <Info
            label="Student"
            value={student?.full_name}
          />

          <Info
            label="Student No."
            value={student?.student_no}
          />

          <Info
            label="Payment Method"
            value={formatMethod(
              payment.payment_method
            )}
          />

          <Info
            label="Reference"
            value={payment.reference_number}
          />

        </div>

        <div className="mt-8">

          <table className="w-full border-collapse">

            <thead>
              <tr className="border-y border-slate-300 bg-slate-50 text-left text-sm">
                <th className="px-4 py-3">
                  Description
                </th>

                <th className="px-4 py-3">
                  Invoice
                </th>

                <th className="px-4 py-3 text-right">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>

              {allocations.map(
                (allocation: any, index: number) => {
                  const invoice =
                    Array.isArray(
                      allocation.student_fees
                    )
                      ? allocation.student_fees[0]
                      : allocation.student_fees;

                  const category =
                    Array.isArray(
                      invoice?.fee_categories
                    )
                      ? invoice.fee_categories[0]
                      : invoice?.fee_categories;

                  return (
                    <tr
                      key={index}
                      className="border-b border-slate-200"
                    >
                      <td className="px-4 py-4 text-sm">
                        {invoice?.description ||
                          category?.name ||
                          "Student Fee"}
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {invoice?.invoice_no ??
                          "-"}
                      </td>

                      <td className="px-4 py-4 text-right text-sm font-medium">
                        RM
                        {Number(
                          allocation.amount
                        ).toFixed(2)}
                      </td>
                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

        <div className="mt-8 flex justify-end">

          <div className="w-72 border-t-2 border-slate-900 pt-4">

            <div className="flex items-center justify-between">

              <span className="font-semibold">
                Total Paid
              </span>

              <span className="text-xl font-bold">
                RM
                {Number(
                  payment.amount
                ).toFixed(2)}
              </span>

            </div>

          </div>

        </div>

        <div className="mt-16 border-t border-slate-200 pt-5 text-center">

          <p className="text-xs text-slate-500">
            This receipt was generated electronically by Madrasah360.
          </p>

        </div>

      </div>

    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | null
    | undefined;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-medium text-slate-900">
        {value || "-"}
      </p>
    </div>
  );
}

function formatMethod(
  method:
    | string
    | null
) {
  if (!method) return "-";

  return method
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}