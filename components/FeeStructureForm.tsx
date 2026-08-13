"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Item = {
  id: string;
  name: string;
};

type Year = {
  id: string;
  name: string;
  is_current: boolean;
};

export default function FeeStructureForm({
  categories,
  classes,
  years,
}: {
  categories: Item[];
  classes: Item[];
  years: Year[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [categoryId, setCategoryId] =
    useState("");

  const [classId, setClassId] =
    useState("");

  const [yearId, setYearId] =
    useState(
      years.find(
        (item) => item.is_current
      )?.id ?? ""
    );

  const [amount, setAmount] =
    useState("");

  const [frequency, setFrequency] =
    useState("monthly");

  const [dueDay, setDueDay] =
    useState("10");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function saveStructure() {
    setError("");

    if (!categoryId) {
      setError("Please select fee category.");
      return;
    }

    if (!yearId) {
      setError("Please select academic year.");
      return;
    }

    if (!amount) {
      setError("Please enter amount.");
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

      const { error } =
        await supabase
          .from("fee_structures")
          .insert({
            organization_id:
              profile.organization_id,

            academic_year_id:
              yearId,

            fee_category_id:
              categoryId,

            class_id:
              classId || null,

            amount:
              Number(amount),

            frequency,

            due_day:
              frequency === "monthly"
                ? Number(dueDay)
                : null,
          });

      if (error) {
        throw new Error(error.message);
      }

      setAmount("");
      setClassId("");
      setLoading(false);

      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error."
      );

      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">

      <h2 className="font-semibold text-slate-900">
        Add Fee Structure
      </h2>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

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

        <select
          value={yearId}
          onChange={(e) =>
            setYearId(e.target.value)
          }
          className={inputStyle}
        >
          <option value="">
            Academic Year
          </option>

          {years.map((item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={classId}
          onChange={(e) =>
            setClassId(e.target.value)
          }
          className={inputStyle}
        >
          <option value="">
            All Classes
          </option>

          {classes.map((item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {item.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          className={inputStyle}
        />

        <select
          value={frequency}
          onChange={(e) =>
            setFrequency(e.target.value)
          }
          className={inputStyle}
        >
          <option value="monthly">
            Monthly
          </option>

          <option value="one_time">
            One Time
          </option>

          <option value="term">
            Term
          </option>

          <option value="annual">
            Annual
          </option>
        </select>

        {frequency === "monthly" && (
          <input
            type="number"
            min="1"
            max="31"
            placeholder="Due day"
            value={dueDay}
            onChange={(e) =>
              setDueDay(e.target.value)
            }
            className={inputStyle}
          />
        )}

      </div>

      <button
        type="button"
        onClick={saveStructure}
        disabled={loading}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        <Save size={17} />

        {loading
          ? "Saving..."
          : "Save Fee Structure"}
      </button>

    </section>
  );
}

const inputStyle =
  "rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500";