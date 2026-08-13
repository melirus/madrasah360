"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Send,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function PublicApplicationForm() {

  const supabase = createClient();

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [applicationNo, setApplicationNo] =
    useState("");

  const [error, setError] =
    useState("");


  const [form, setForm] = useState({

    applicant_name: "",
    ic_number: "",
    birth_certificate_no: "",
    date_of_birth: "",
    gender: "",
    nationality: "Malaysia",

    address_line1: "",
    address_line2: "",
    postcode: "",
    city: "",
    state: "Melaka",

    previous_school: "",
    requested_level: "",

    guardian_name: "",
    guardian_relationship: "Mother",
    guardian_ic: "",
    guardian_phone: "",
    guardian_whatsapp: "",
    guardian_occupation: "",

  });


  function updateField(
    name: string,
    value: string
  ) {

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

  }


  async function handleSubmit(
    event: React.FormEvent
  ) {

    event.preventDefault();

    setLoading(true);
    setError("");


    try {

      // ---------------------------------------
      // 1. Get MUTQAN organization ID
      // ---------------------------------------

      const {
        data: organizations,
        error: organizationError,
      } = await supabase.rpc(
        "get_public_organization",
        {
          organization_slug: "mutqan",
        }
      );


      if (
        organizationError ||
        !organizations?.length
      ) {
        throw new Error(
          "Madrasah information not found."
        );
      }


      const organizationId =
        organizations[0].id;


      // ---------------------------------------
      // 2. Generate application number
      // ---------------------------------------

      const year =
        new Date().getFullYear();

      const suffix =
        Date.now()
          .toString()
          .slice(-6);

      const generatedNo =
        `APP-${year}-${suffix}`;


      // ---------------------------------------
      // 3. Insert application
      // ---------------------------------------

      const { error: insertError } =
        await supabase
          .from("applications")
          .insert({

            organization_id:
              organizationId,

            application_no:
              generatedNo,

            applicant_name:
              form.applicant_name,

            ic_number:
              form.ic_number || null,

            birth_certificate_no:
              form.birth_certificate_no || null,

            date_of_birth:
              form.date_of_birth || null,

            gender:
              form.gender || null,

            nationality:
              form.nationality,

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

            previous_school:
              form.previous_school || null,

            requested_level:
              form.requested_level || null,

            guardian_name:
              form.guardian_name,

            guardian_relationship:
              form.guardian_relationship,

            guardian_ic:
              form.guardian_ic || null,

            guardian_phone:
              form.guardian_phone || null,

            guardian_whatsapp:
              normalizePhone(
                form.guardian_whatsapp ||
                form.guardian_phone
              ),

            guardian_occupation:
              form.guardian_occupation || null,

            status: "pending",

          });


      if (insertError) {
        throw new Error(
          insertError.message
        );
      }


      setApplicationNo(
        generatedNo
      );

      setSuccess(true);

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {

      setLoading(false);

    }

  }


  if (success) {

    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-10 text-center">

        <CheckCircle2
          size={54}
          className="mx-auto text-emerald-600"
        />

        <h2 className="mt-5 text-2xl font-bold text-slate-900">
          Permohonan Diterima
        </h2>

        <p className="mt-3 text-slate-500">
          Terima kasih. Permohonan anda
          telah berjaya dihantar.
        </p>


        <div className="mx-auto mt-7 max-w-sm rounded-xl bg-slate-50 p-5">

          <p className="text-sm text-slate-500">
            No. Permohonan
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {applicationNo}
          </p>

        </div>

      </div>
    );

  }


  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}


      <FormSection
        title="Maklumat Pemohon"
      >

        <Input
          label="Nama Penuh"
          required
          value={form.applicant_name}
          onChange={(value) =>
            updateField(
              "applicant_name",
              value
            )
          }
        />

        <Input
          label="No. MyKid / IC"
          value={form.ic_number}
          onChange={(value) =>
            updateField(
              "ic_number",
              value
            )
          }
        />

        <Input
          label="No. Sijil Kelahiran"
          value={
            form.birth_certificate_no
          }
          onChange={(value) =>
            updateField(
              "birth_certificate_no",
              value
            )
          }
        />


        <Input
          label="Tarikh Lahir"
          type="date"
          value={form.date_of_birth}
          onChange={(value) =>
            updateField(
              "date_of_birth",
              value
            )
          }
        />


        <Select
          label="Jantina"
          value={form.gender}
          onChange={(value) =>
            updateField(
              "gender",
              value
            )
          }
          options={[
            ["", "Pilih"],
            ["Male", "Lelaki"],
            ["Female", "Perempuan"],
          ]}
        />


        <Select
          label="Tahap Dipohon"
          value={form.requested_level}
          onChange={(value) =>
            updateField(
              "requested_level",
              value
            )
          }
          options={[
            ["", "Pilih tahap"],
            ["Tahun 1", "Tahun 1"],
            ["Tahun 2", "Tahun 2"],
            ["Tahun 3", "Tahun 3"],
            ["Tahun 4", "Tahun 4"],
            ["Tahun 5", "Tahun 5"],
            ["Tahun 6", "Tahun 6"],
          ]}
        />


        <Input
          label="Sekolah Terdahulu"
          value={form.previous_school}
          onChange={(value) =>
            updateField(
              "previous_school",
              value
            )
          }
        />

      </FormSection>


      <FormSection title="Alamat">

        <Input
          label="Alamat"
          wide
          value={form.address_line1}
          onChange={(value) =>
            updateField(
              "address_line1",
              value
            )
          }
        />

        <Input
          label="Alamat Baris 2"
          wide
          value={form.address_line2}
          onChange={(value) =>
            updateField(
              "address_line2",
              value
            )
          }
        />

        <Input
          label="Poskod"
          value={form.postcode}
          onChange={(value) =>
            updateField(
              "postcode",
              value
            )
          }
        />

        <Input
          label="Bandar"
          value={form.city}
          onChange={(value) =>
            updateField(
              "city",
              value
            )
          }
        />

        <Input
          label="Negeri"
          value={form.state}
          onChange={(value) =>
            updateField(
              "state",
              value
            )
          }
        />

      </FormSection>


      <FormSection
        title="Maklumat Ibu / Bapa / Penjaga"
      >

        <Input
          label="Nama Penjaga"
          required
          value={form.guardian_name}
          onChange={(value) =>
            updateField(
              "guardian_name",
              value
            )
          }
        />


        <Select
          label="Hubungan"
          value={
            form.guardian_relationship
          }
          onChange={(value) =>
            updateField(
              "guardian_relationship",
              value
            )
          }
          options={[
            ["Father", "Bapa"],
            ["Mother", "Ibu"],
            ["Guardian", "Penjaga"],
          ]}
        />


        <Input
          label="No. IC Penjaga"
          value={form.guardian_ic}
          onChange={(value) =>
            updateField(
              "guardian_ic",
              value
            )
          }
        />


        <Input
          label="No. Telefon"
          required
          value={form.guardian_phone}
          onChange={(value) =>
            updateField(
              "guardian_phone",
              value
            )
          }
        />


        <Input
          label="No. WhatsApp"
          value={form.guardian_whatsapp}
          onChange={(value) =>
            updateField(
              "guardian_whatsapp",
              value
            )
          }
        />


        <Input
          label="Pekerjaan"
          value={
            form.guardian_occupation
          }
          onChange={(value) =>
            updateField(
              "guardian_occupation",
              value
            )
          }
        />

      </FormSection>


      <div className="flex justify-end">

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-7 py-3.5 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >

          <Send size={18} />

          {loading
            ? "Menghantar..."
            : "Hantar Permohonan"}

        </button>

      </div>

    </form>
  );
}


const inputStyle =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";


function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">

      <div className="border-b border-slate-100 px-6 py-5">

        <h2 className="font-semibold text-slate-900">
          {title}
        </h2>

      </div>

      <div className="grid gap-5 p-6 md:grid-cols-2">
        {children}
      </div>

    </section>
  );

}


function Input({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  wide?: boolean;
}) {

  return (
    <div
      className={
        wide ? "md:col-span-2" : ""
      }
    >

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={inputStyle}
      />

    </div>
  );

}


function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {

  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={inputStyle}
      >

        {options.map(
          ([value, label]) => (

            <option
              key={value}
              value={value}
            >
              {label}
            </option>

          )
        )}

      </select>

    </div>
  );

}


function normalizePhone(
  phone: string
) {

  let cleaned =
    phone.replace(/\D/g, "");

  if (
    cleaned.startsWith("0")
  ) {
    cleaned = `6${cleaned}`;
  }

  return cleaned;

}