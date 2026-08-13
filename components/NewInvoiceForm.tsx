"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Item = {
  id: string;
  name?: string;
  full_name?: string;
  student_no?: string | null;
};

export default function NewInvoiceForm({
  students,
  categories,
}: {
  students: Item[];
  categories: Item[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [studentId, setStudentId] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [discount, setDiscount] =
    useState("0");

  const [billingMonth, setBillingMonth] =
    useState(
      String(new Date().getMonth() + 1)
    );

  const [billingYear, setBillingYear] =
    useState(
      String(new Date().getFullYear())
    );

  const [dueDate, setDueDate] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function saveInvoice() {
    setError("");

    if (!studentId || !categoryId || !amount) {
      setError(
        "Student, category and amount are required."
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated.");
      }

      const { data: profile } =
        await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single();

      if (!profile?.organization_id) {
        throw new Error("Organization not found.");
      }

      const invoiceNo =
        `INV-${billingYear}-${Date.now()
          .toString()
          .slice(-6)}`;

      const {
        data: invoice,
        error: invoiceError,
      } = await supabase
        .from("student_fees")
        .insert({
          organization_id:
            profile.organization_id,

          student_id:
            studentId,

          fee_category_id:
            categoryId,

          invoice_no:
            invoiceNo,

          description:
            description || null,

          billing_month:
            Number(billingMonth),

          billing_year:
            Number(billingYear),

          amount:
            Number(amount),

          discount_amount:
            Number(discount),

          due_date:
            dueDate || null,

          status:
            "unpaid",
        })
        .select()
        .single();

      if (
        invoiceError ||
        !invoice
      ) {
        throw new Error(
          invoiceError?.message ??
            "Unable to create invoice."
        );
      }

      router.push(
        `/dashboard/finance/invoices/${invoice.id}`
      );

      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">

        <select
          value={studentId}
          onChange={(e) =>
            setStudentId(e.target.value)
          }
          className={inputStyle}
        >
          <option value="">
            Select Student
          </option>

          {students.map((item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {item.full_name}
            </option>
          ))}
        </select>

        <select
          value={categoryId}
          onChange={(e) =>
            setCategoryId(e.target.value)
          }
          className={inputStyle}
        >
          <option value="">
            Fee Category
          </option>

          {categories.map((item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {item.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className={inputStyle}
        />

        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          className={inputStyle}
        />

        <input
          type="number"
          step="0.01"
          placeholder="Discount"
          value={discount}
          onChange={(e) =>
            setDiscount(e.target.value)
          }
          className={inputStyle}
        />

        <input
          type="number"
          min="1"
          max="12"
          value={billingMonth}
          onChange={(e) =>
            setBillingMonth(e.target.value)
          }
          className={inputStyle}
        />

        <input
          type="number"
          value={billingYear}
          onChange={(e) =>
            setBillingYear(e.target.value)
          }
          className={inputStyle}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) =>
            setDueDate(e.target.value)
          }
          className={inputStyle}
        />

      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={saveInvoice}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          <Save size={18} />

          {loading
            ? "Saving..."
            : "Create Invoice"}
        </button>
      </div>

    </section>
  );
}

const inputStyle =
  "rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500";