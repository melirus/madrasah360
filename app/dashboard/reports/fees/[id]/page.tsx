import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/PrintButton";

export default async function StudentFeeStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: student,
    error,
  } = await supabase
    .from("students")
    .select(`
      id,
      student_no,
      full_name,

      enrolments (
        status,
        classes (
          name
        )
      ),

      student_fees (
        id,
        invoice_no,
        description,
        amount,
        discount_amount,
        due_date,
        status,

        fee_categories (
          name
        ),

        payment_allocations (
          amount
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !student) {
    return (
      <p className="text-red-600">
        Student not found.
      </p>
    );
  }

  const activeEnrolment =
    student.enrolments?.find(
      (item: any) =>
        item.status === "active"
    );

  const classData =
    Array.isArray(
      activeEnrolment?.classes
    )
      ? activeEnrolment?.classes[0]
      : activeEnrolment?.classes;

  const fees =
    student.student_fees ?? [];

  let totalCharges = 0;
  let totalPaid = 0;
  let totalBalance = 0;

  const rows =
    fees.map((fee: any) => {
      const category =
        Array.isArray(
          fee.fee_categories
        )
          ? fee.fee_categories[0]
          : fee.fee_categories;

      const net =
        Number(fee.amount) -
        Number(
          fee.discount_amount ??
            0
        );

      const paid =
        fee.payment_allocations?.reduce(
          (
            sum: number,
            allocation: any
          ) =>
            sum +
            Number(
              allocation.amount
            ),
          0
        ) ?? 0;

      const balance =
        Math.max(
          net - paid,
          0
        );

      totalCharges += net;
      totalPaid += paid;
      totalBalance += balance;

      return {
        ...fee,
        categoryName:
          category?.name ??
          "Fee",
        net,
        paid,
        balance,
      };
    });

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      <div className="flex items-center justify-between print:hidden">

        <Link
          href="/dashboard/reports/fees"
          className="inline-flex items-center gap-2 text-sm text-slate-500"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <PrintButton />

      </div>

      <div className="bg-white p-8 print:p-0">

        <div className="border-b border-slate-300 pb-6">

          <p className="text-sm font-medium text-emerald-700">
            Fee Statement
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {student.full_name}
          </h1>

          <p className="mt-2 text-slate-500">
            {student.student_no}
            {" · "}
            {classData?.name ??
              "No class"}
          </p>

        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-3">

          <Summary
            label="Total Charges"
            value={`RM${totalCharges.toFixed(2)}`}
          />

          <Summary
            label="Total Paid"
            value={`RM${totalPaid.toFixed(2)}`}
          />

          <Summary
            label="Balance"
            value={`RM${totalBalance.toFixed(2)}`}
          />

        </div>

        <div className="mt-8 overflow-x-auto">

          <table className="w-full">

            <thead className="border-y border-slate-300 bg-slate-50 text-left text-xs uppercase text-slate-500">

              <tr>
                <th className="px-4 py-3">
                  Invoice
                </th>

                <th className="px-4 py-3">
                  Description
                </th>

                <th className="px-4 py-3 text-right">
                  Charge
                </th>

                <th className="px-4 py-3 text-right">
                  Paid
                </th>

                <th className="px-4 py-3 text-right">
                  Balance
                </th>

                <th className="px-4 py-3">
                  Status
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-200">

              {rows.map(
                (fee: any) => (
                  <tr key={fee.id}>

                    <td className="px-4 py-4 text-sm">
                      {fee.invoice_no ??
                        "-"}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {fee.description ||
                        fee.categoryName}
                    </td>

                    <td className="px-4 py-4 text-right text-sm">
                      RM
                      {fee.net.toFixed(2)}
                    </td>

                    <td className="px-4 py-4 text-right text-sm">
                      RM
                      {fee.paid.toFixed(2)}
                    </td>

                    <td className="px-4 py-4 text-right text-sm font-medium">
                      RM
                      {fee.balance.toFixed(2)}
                    </td>

                    <td className="px-4 py-4 text-sm capitalize">
                      {fee.status}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-5 print:border print:border-slate-200">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}