"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  User,
  Users,
  School,
  MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ClassItem = {
  id: string;
  name: string;
  academic_year_id: string | null;
};

export default function AddStudentForm({
  classes,
}: {
  classes: ClassItem[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    ic_number: "",
    birth_certificate_no: "",
    gender: "",
    date_of_birth: "",
    nationality: "Malaysia",

    address_line1: "",
    address_line2: "",
    postcode: "",
    city: "",
    state: "Melaka",

    previous_school: "",
    admission_date: "",

    class_id: "",

    guardian_name: "",
    guardian_ic: "",
    guardian_relationship: "Mother",
    guardian_phone: "",
    guardian_whatsapp: "",
    guardian_occupation: "",
  });

  function updateField(
    field: string,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }


  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {

      // ========================================
      // 1. Get logged-in user
      // ========================================

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User is not authenticated.");
      }


      // ========================================
      // 2. Get user's organization
      // ========================================

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single();

      if (profileError || !profile?.organization_id) {
        throw new Error(
          "Unable to determine organization."
        );
      }

      const organizationId =
        profile.organization_id;


      // ========================================
      // 3. Generate demo student number
      // ========================================

      const year = new Date().getFullYear();

      const uniquePart = Date.now()
        .toString()
        .slice(-5);

      const studentNo =
        `MUT${year}${uniquePart}`;


      // ========================================
      // 4. Insert student
      // ========================================

      const {
        data: student,
        error: studentError,
      } = await supabase
        .from("students")
        .insert({
          organization_id: organizationId,

          student_no: studentNo,

          full_name:
            form.full_name.trim(),

          ic_number:
            form.ic_number || null,

          birth_certificate_no:
            form.birth_certificate_no || null,

          gender:
            form.gender || null,

          date_of_birth:
            form.date_of_birth || null,

          nationality:
            form.nationality || "Malaysia",

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

          admission_date:
            form.admission_date || null,

          status: "active",
        })
        .select()
        .single();


      if (studentError || !student) {
        throw new Error(
          studentError?.message ??
            "Unable to create student."
        );
      }


      // ========================================
      // 5. Insert guardian
      // ========================================

      const {
        data: guardian,
        error: guardianError,
      } = await supabase
        .from("guardians")
        .insert({
          organization_id:
            organizationId,

          full_name:
            form.guardian_name.trim(),

          ic_number:
            form.guardian_ic || null,

          phone:
            form.guardian_phone || null,

          whatsapp_number:
            normalizeMalaysiaPhone(
              form.guardian_whatsapp ||
                form.guardian_phone
            ),

          occupation:
            form.guardian_occupation || null,
        })
        .select()
        .single();


      if (guardianError || !guardian) {
        throw new Error(
          guardianError?.message ??
            "Unable to create guardian."
        );
      }


      // ========================================
      // 6. Link student ↔ guardian
      // ========================================

      const { error: linkError } =
        await supabase
          .from("student_guardians")
          .insert({
            organization_id:
              organizationId,

            student_id:
              student.id,

            guardian_id:
              guardian.id,

            relationship:
              form.guardian_relationship,

            is_primary: true,

            receives_whatsapp: true,
          });


      if (linkError) {
        throw new Error(linkError.message);
      }


      // ========================================
      // 7. Create enrolment
      // ========================================

      if (form.class_id) {

        const selectedClass =
          classes.find(
            (item) =>
              item.id === form.class_id
          );

        if (
          selectedClass?.academic_year_id
        ) {

          const { error: enrolmentError } =
            await supabase
              .from("enrolments")
              .insert({
                organization_id:
                  organizationId,

                student_id:
                  student.id,

                academic_year_id:
                  selectedClass.academic_year_id,

                class_id:
                  selectedClass.id,

                status: "active",
              });


          if (enrolmentError) {
            throw new Error(
              enrolmentError.message
            );
          }

        }

      }


      // ========================================
      // SUCCESS
      // ========================================

      router.push(
        `/dashboard/students/${student.id}`
      );

      router.refresh();

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "An unexpected error occurred."
        );
      }

      setLoading(false);
    }
  }


  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}


      <Section
        title="Student Information"
        description="Basic identification information."
        icon={User}
      >

        <div className="grid gap-5 md:grid-cols-2">

          <Field
            label="Full Name"
            required
          >
            <input
              required
              value={form.full_name}
              onChange={(e) =>
                updateField(
                  "full_name",
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </Field>


          <Field label="IC Number">
            <input
              value={form.ic_number}
              onChange={(e) =>
                updateField(
                  "ic_number",
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </Field>


          <Field label="Birth Certificate No.">
            <input
              value={
                form.birth_certificate_no
              }
              onChange={(e) =>
                updateField(
                  "birth_certificate_no",
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </Field>


          <Field label="Gender">

            <select
              value={form.gender}
              onChange={(e) =>
                updateField(
                  "gender",
                  e.target.value
                )
              }
              className={inputStyle}
            >
              <option value="">
                Select
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>
            </select>

          </Field>


          <Field label="Date of Birth">

            <input
              type="date"
              value={form.date_of_birth}
              onChange={(e) =>
                updateField(
                  "date_of_birth",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>


          <Field label="Nationality">

            <input
              value={form.nationality}
              onChange={(e) =>
                updateField(
                  "nationality",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>

        </div>

      </Section>


      <Section
        title="Address"
        description="Student's current residential address."
        icon={MapPin}
      >

        <div className="grid gap-5 md:grid-cols-2">

          <Field
            label="Address"
            wide
          >
            <input
              value={form.address_line1}
              onChange={(e) =>
                updateField(
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
              value={form.address_line2}
              onChange={(e) =>
                updateField(
                  "address_line2",
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </Field>


          <Field label="Postcode">
            <input
              value={form.postcode}
              onChange={(e) =>
                updateField(
                  "postcode",
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </Field>


          <Field label="City">
            <input
              value={form.city}
              onChange={(e) =>
                updateField(
                  "city",
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </Field>


          <Field label="State">
            <input
              value={form.state}
              onChange={(e) =>
                updateField(
                  "state",
                  e.target.value
                )
              }
              className={inputStyle}
            />
          </Field>

        </div>

      </Section>


      <Section
        title="School & Enrolment"
        description="Previous education and current placement."
        icon={School}
      >

        <div className="grid gap-5 md:grid-cols-2">

          <Field label="Previous School">

            <input
              value={form.previous_school}
              onChange={(e) =>
                updateField(
                  "previous_school",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>


          <Field label="Admission Date">

            <input
              type="date"
              value={form.admission_date}
              onChange={(e) =>
                updateField(
                  "admission_date",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>


          <Field label="Class">

            <select
              value={form.class_id}
              onChange={(e) =>
                updateField(
                  "class_id",
                  e.target.value
                )
              }
              className={inputStyle}
            >

              <option value="">
                Select class
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

          </Field>

        </div>

      </Section>


      <Section
        title="Primary Guardian"
        description="Main parent or guardian contact."
        icon={Users}
      >

        <div className="grid gap-5 md:grid-cols-2">

          <Field
            label="Guardian Name"
            required
          >

            <input
              required
              value={form.guardian_name}
              onChange={(e) =>
                updateField(
                  "guardian_name",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>


          <Field label="Relationship">

            <select
              value={
                form.guardian_relationship
              }
              onChange={(e) =>
                updateField(
                  "guardian_relationship",
                  e.target.value
                )
              }
              className={inputStyle}
            >

              <option value="Father">
                Father
              </option>

              <option value="Mother">
                Mother
              </option>

              <option value="Guardian">
                Guardian
              </option>

            </select>

          </Field>


          <Field label="Guardian IC">

            <input
              value={form.guardian_ic}
              onChange={(e) =>
                updateField(
                  "guardian_ic",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>


          <Field label="Phone">

            <input
              value={form.guardian_phone}
              onChange={(e) =>
                updateField(
                  "guardian_phone",
                  e.target.value
                )
              }
              placeholder="0123456789"
              className={inputStyle}
            />

          </Field>


          <Field label="WhatsApp Number">

            <input
              value={
                form.guardian_whatsapp
              }
              onChange={(e) =>
                updateField(
                  "guardian_whatsapp",
                  e.target.value
                )
              }
              placeholder="0123456789"
              className={inputStyle}
            />

          </Field>


          <Field label="Occupation">

            <input
              value={
                form.guardian_occupation
              }
              onChange={(e) =>
                updateField(
                  "guardian_occupation",
                  e.target.value
                )
              }
              className={inputStyle}
            />

          </Field>

        </div>

      </Section>


      <div className="flex justify-end gap-3">

        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboard/students"
            )
          }
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700"
        >
          Cancel
        </button>


        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          <Save size={18} />

          {loading
            ? "Saving..."
            : "Register Student"}
        </button>

      </div>

    </form>
  );
}


const inputStyle =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";


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

      {children}
    </div>
  );
}


function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white">

      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">

        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
          <Icon size={20} />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>

      </div>


      <div className="p-6">
        {children}
      </div>

    </section>
  );
}


function normalizeMalaysiaPhone(
  phone: string
) {
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = `6${cleaned}`;
  }

  return cleaned;
}