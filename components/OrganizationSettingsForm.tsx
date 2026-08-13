"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { createClient } from "@/lib/supabase/client";


type Organization = {
  id: string;
  name: string;
  short_name: string | null;
  slug: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address_line1: string | null;
  address_line2: string | null;
  postcode: string | null;
  city: string | null;
  state: string | null;
};


export default function OrganizationSettingsForm({
  organization,
}: {
  organization: Organization;
}) {

  const supabase =
    createClient();

  const router =
    useRouter();


  const [form, setForm] =
    useState({

      name:
        organization.name ?? "",

      short_name:
        organization.short_name ?? "",

      phone:
        organization.phone ?? "",

      email:
        organization.email ?? "",

      website:
        organization.website ?? "",

      address_line1:
        organization.address_line1 ?? "",

      address_line2:
        organization.address_line2 ?? "",

      postcode:
        organization.postcode ?? "",

      city:
        organization.city ?? "",

      state:
        organization.state ?? "",

    });


  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  function update(
    name: string,
    value: string
  ) {

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );

  }


  async function save() {

    setLoading(true);
    setError("");
    setMessage("");


    const { error } =
      await supabase
        .from("organizations")
        .update({

          name:
            form.name,

          short_name:
            form.short_name || null,

          phone:
            form.phone || null,

          email:
            form.email || null,

          website:
            form.website || null,

          address_line1:
            form.address_line1 || null,

          address_line2:
            form.address_line2 || null,

          postcode:
            form.postcode || null,

          city:
            form.city || null,

          state:
            form.state || null,

          updated_at:
            new Date()
              .toISOString(),

        })
        .eq(
          "id",
          organization.id
        );


    if (error) {

      setError(
        error.message
      );

    } else {

      setMessage(
        "Madrasah information updated."
      );

      router.refresh();

    }


    setLoading(false);

  }


  return (
    <section className="rounded-2xl border border-slate-200 bg-white">

      <div className="border-b border-slate-100 px-6 py-5">

        <h2 className="font-semibold text-slate-900">
          Madrasah Profile
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          General information used throughout the system.
        </p>

      </div>


      <div className="p-6">

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}


        {message && (
          <div className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </div>
        )}


        <div className="grid gap-5 md:grid-cols-2">

          <Field label="Madrasah Name">

            <input
              value={
                form.name
              }
              onChange={(e) =>
                update(
                  "name",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>


          <Field label="Short Name">

            <input
              value={
                form.short_name
              }
              onChange={(e) =>
                update(
                  "short_name",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>


          <Field label="Phone">

            <input
              value={
                form.phone
              }
              onChange={(e) =>
                update(
                  "phone",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>


          <Field label="Email">

            <input
              type="email"
              value={
                form.email
              }
              onChange={(e) =>
                update(
                  "email",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>


          <Field
            label="Address"
            wide
          >

            <input
              value={
                form.address_line1
              }
              onChange={(e) =>
                update(
                  "address_line1",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>


          <Field
            label="Address Line 2"
            wide
          >

            <input
              value={
                form.address_line2
              }
              onChange={(e) =>
                update(
                  "address_line2",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>


          <Field label="Postcode">

            <input
              value={
                form.postcode
              }
              onChange={(e) =>
                update(
                  "postcode",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>


          <Field label="City">

            <input
              value={
                form.city
              }
              onChange={(e) =>
                update(
                  "city",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>


          <Field label="State">

            <input
              value={
                form.state
              }
              onChange={(e) =>
                update(
                  "state",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>


          <Field label="Website">

            <input
              value={
                form.website
              }
              onChange={(e) =>
                update(
                  "website",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>

        </div>


        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          <Save size={17} />

          {loading
            ? "Saving..."
            : "Save Madrasah Profile"}
        </button>

      </div>

    </section>
  );
}


function Field({
  label,
  wide = false,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {

  return (
    <div
      className={
        wide
          ? "md:col-span-2"
          : ""
      }
    >

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      {children}

    </div>
  );
}


const inputStyle =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500";