"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function PaymentForm({
  invoiceId,
  studentId,
  balance,
}: {
  invoiceId: string;
  studentId: string;
  balance: number;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [amount, setAmount] =
    useState(balance.toFixed(2));

  const [method, setMethod] =
    useState("bank_transfer");

  const [reference, setReference] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function savePayment() {
    setError("");

    const paidAmount =
      Number(amount);

    if (
      !paidAmount ||
      paidAmount <= 0
    ) {
      setError("Enter a valid amount.");
      return;
    }

    if (
      paidAmount > balance
    ) {
      setError(
        `Payment cannot exceed RM${balance.toFixed(2)}.`
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

      const receiptNo =
        `RCT-${new Date().getFullYear()}-${Date.now()
          .toString()
          .slice(-6)}`;

      const {
        data: payment,
        error: paymentError,
      } = await supabase
        .from("payments")
        .insert({
          organization_id:
            profile.organization_id,

          student_id:
            studentId,

          receipt_no:
            receiptNo,

          amount:
            paidAmount,

          payment_method:
            method,

          reference_number:
            reference || null,

          received_by:
            user.id,
        })
        .select()
        .single();

      if (
        paymentError ||
        !payment
      ) {
        throw new Error(
          paymentError?.message ??
            "Unable to record payment."
        );
      }

      const { error: allocationError } =
        await supabase
          .from("payment_allocations")
          .insert({
            organization_id:
              profile.organization_id,

            payment_id:
              payment.id,

            student_fee_id:
              invoiceId,

            amount:
              paidAmount,
          });

      if (allocationError) {
        throw new Error(
          allocationError.message
        );
      }

      const newBalance =
        balance - paidAmount;

      const newStatus =
        newBalance <= 0
          ? "paid"
          : "partial";

      const { error: updateError } =
        await supabase
          .from("student_fees")
          .update({
            status:
              newStatus,
          })
          .eq("id", invoiceId);

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

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

      <h2 className="font-semibold text-slate-900">
        Record Payment
      </h2>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-5 md:grid-cols-3">

        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          className={inputStyle}
        />

        <select
          value={method}
          onChange={(e) =>
            setMethod(e.target.value)
          }
          className={inputStyle}
        >
          <option value="cash">
            Cash
          </option>

          <option value="bank_transfer">
            Bank Transfer
          </option>

          <option value="duitnow">
            DuitNow
          </option>

          <option value="cheque">
            Cheque
          </option>

          <option value="other">
            Other
          </option>
        </select>

        <input
          placeholder="Reference number"
          value={reference}
          onChange={(e) =>
            setReference(e.target.value)
          }
          className={inputStyle}
        />

      </div>

      <button
        type="button"
        onClick={savePayment}
        disabled={loading}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        <Save size={17} />

        {loading
          ? "Saving..."
          : "Record Payment"}
      </button>

    </section>
  );
}

const inputStyle =
  "rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500";