"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AddTeacherForm() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    ic_number: "",
    gender: "",
    phone: "",
    whatsapp_number: "",
    email: "",
    address: "",
    joining_date: "",
  });

  function updateField(field: string, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated.");
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single();

      if (profileError || !profile?.organization_id) {
        throw new Error("Organization not found.");
      }

      const year = new Date().getFullYear();

      const staffNo =
        `TCH-${year}-${Date.now().toString().slice(-4)}`;

      const {
        data: teacher,
        error: teacherError,
      } = await supabase
        .from("teachers")
        .insert({
          organization_id: profile.organization_id,
          staff_no: staffNo,
          full_name: form.full_name.trim(),
          ic_number: form.ic_number || null,
          gender: form.gender || null,
          phone: form.phone || null,
          whatsapp_number: normalizePhone(
            form.whatsapp_number || form.phone
          ),
          email: form.email || null,
          address: form.address || null,
          joining_date: form.joining_date || null,
          status: "active",
        })
        .select()
        .single();

      if (teacherError || !teacher) {
        throw new Error(
          teacherError?.message ?? "Unable to create teacher."
        );
      }

      router.push(
        `/dashboard/teachers/${teacher.id}`
      );

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
    <form onSubmit={handleSubmit} className="space-y-6">

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <div className="grid gap-5 md:grid-cols-2">

          <Field label="Full Name" required>
            <input
              required
              value={form.full_name}
              onChange={(e) =>
                updateField("full_name", e.target.value)
              }
              className={inputStyle}
            />
          </Field>

          <Field label="IC Number">
            <input
              value={form.ic_number}
              onChange={(e) =>
                updateField("ic_number", e.target.value)
              }
              className={inputStyle}
            />
          </Field>

          <Field label="Gender">
            <select
              value={form.gender}
              onChange={(e) =>
                updateField("gender", e.target.value)
              }
              className={inputStyle}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </Field>

          <Field label="Phone">
            <input
              value={form.phone}
              onChange={(e) =>
                updateField("phone", e.target.value)
              }
              className={inputStyle}
            />
          </Field>

          <Field label="WhatsApp">
            <input
              value={form.whatsapp_number}
              onChange={(e) =>
                updateField(
                  "whatsapp_number",
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                updateField("email", e.target.value)
              }
              className={inputStyle}
            />
          </Field>

          <Field label="Joining Date">
            <input
              type="date"
              value={form.joining_date}
              onChange={(e) =>
                updateField(
                  "joining_date",
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </Field>

          <Field label="Address" wide>
            <textarea
              value={form.address}
              onChange={(e) =>
                updateField("address", e.target.value)
              }
              rows={3}
              className={inputStyle}
            />
          </Field>

        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          <Save size={18} />

          {loading ? "Saving..." : "Register Teacher"}
        </button>
      </div>
    </form>
  );
}

const inputStyle =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

function Field({
  label,
  required = false,
  wide = false,
  children,
}: {
  label: string;
  required?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function normalizePhone(phone: string) {
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = `6${cleaned}`;
  }

  return cleaned;
}