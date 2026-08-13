import Link from "next/link";
import {
  Wallet,
  ReceiptText,
  CircleDollarSign,
  AlertCircle,
  Plus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function FinancePage() {
  const supabase = await createClient();

  const { data: invoices } =
    await supabase
      .from("student_fees")
      .select(`
        id,
        invoice_no,
        amount,
        discount_amount,
        status,
        students (
          id,
          full_name,
          student_no
        ),
        fee_categories (
          name
        )
      `)
      .order("created_at", {
        ascending: false,
      });

  const { data: payments } =
    await supabase
      .from("payments")
      .select(`
        id,
        amount
      `);

  const totalInvoiced =
    invoices?.reduce(
      (sum, item) =>
        sum +
        Number(item.amount) -
        Number(item.discount_amount ?? 0),
      0
    ) ?? 0;

  const totalPaid =
    payments?.reduce(
      (sum, item) =>
        sum + Number(item.amount),
      0
    ) ?? 0;

  const outstanding =
    totalInvoiced - totalPaid;

  const overdueCount =
    invoices?.filter(
      (item) =>
        item.status === "overdue" ||
        item.status === "unpaid" ||
        item.status === "partial"
    ).length ?? 0;

  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Finance
          </h1>

          <p className="mt-2 text-slate-500">
            Manage student fees, invoices and payments.
          </p>
        </div>

        <Link
          href="/dashboard/finance/invoices/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus size={18} />
          New Invoice
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={ReceiptText}
          label="Total Invoiced"
          value={`RM${totalInvoiced.toFixed(2)}`}
        />

        <StatCard
          icon={CircleDollarSign}
          label="Total Paid"
          value={`RM${totalPaid.toFixed(2)}`}
        />

        <StatCard
          icon={Wallet}
          label="Outstanding"
          value={`RM${outstanding.toFixed(2)}`}
        />

        <StatCard
          icon={AlertCircle}
          label="Outstanding Invoices"
          value={overdueCount.toString()}
        />

      </div>

      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              Recent Invoices
            </h2>
          </div>

          <Link
            href="/dashboard/finance/fees"
            className="text-sm font-medium text-emerald-700"
          >
            Fee Structure
          </Link>
        </div>

        <div className="divide-y divide-slate-100">

          {!invoices?.length && (
            <div className="p-8 text-center text-sm text-slate-500">
              No invoices generated yet.
            </div>
          )}

          {invoices?.map((invoice: any) => {
            const student =
              Array.isArray(invoice.students)
                ? invoice.students[0]
                : invoice.students;

            const category =
              Array.isArray(invoice.fee_categories)
                ? invoice.fee_categories[0]
                : invoice.fee_categories;

            return (
              <Link
                key={invoice.id}
                href={`/dashboard/finance/invoices/${invoice.id}`}
                className="flex items-center justify-between px-6 py-5 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {student?.full_name ?? "Student"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {invoice.invoice_no ?? "-"}
                    {" · "}
                    {category?.name ?? "Fee"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-900">
                    RM{Number(invoice.amount).toFixed(2)}
                  </p>

                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {invoice.status}
                  </p>
                </div>
              </Link>
            );
          })}

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