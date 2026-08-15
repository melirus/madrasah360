import Link from "next/link";
import {
  ArrowLeft,
  UserRound,
  Phone,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import AdmissionActions from "@/components/AdmissionActions";


export default async function AdmissionDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {

  const { id } =
    await params;

  const supabase =
    await createClient();


  const {
    data: application,
    error,
  } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();


  if (
    error ||
    !application
  ) {

    return (
      <div>
        Application not found.
      </div>
    );

  }


  const { data: classes } =
    await supabase
      .from("classes")
      .select(`
        id,
        name,
        academic_year_id
      `)
      .eq("is_active", true)
      .order("name");


  return (
    <div className="space-y-6">

      <Link
        href="/dashboard/admissions"
        className="inline-flex items-center gap-2 text-sm text-slate-500"
      >
        <ArrowLeft size={16} />
        Back to Admissions
      </Link>


      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <p className="break-all text-sm font-medium text-emerald-700">
            {
              application.application_no
            }
          </p>

          <h1 className="mt-1 break-words text-2xl font-bold leading-tight text-slate-900 sm:mt-2 sm:text-3xl">
            {
              application.applicant_name
            }
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Application Status:{" "}
            <span className="font-medium capitalize">
              {application.status}
            </span>
          </p>

        </div>

      </div>


      <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2 xl:gap-6">

        <Section title="Student Information">

          <Info
            label="Full Name"
            value={
              application.applicant_name
            }
          />

          <Info
            label="IC / MyKid"
            value={
              application.ic_number
            }
          />

          <Info
            label="Birth Certificate"
            value={
              application.birth_certificate_no
            }
          />

          <Info
            label="Date of Birth"
            value={
              application.date_of_birth
            }
          />

          <Info
            label="Gender"
            value={
              application.gender
            }
          />

          <Info
            label="Requested Level"
            value={
              application.requested_level
            }
          />

          <Info
            label="Previous School"
            value={
              application.previous_school
            }
          />

        </Section>


        <Section title="Guardian">

          <Info
            label="Name"
            value={
              application.guardian_name
            }
          />

          <Info
            label="Relationship"
            value={
              application.guardian_relationship
            }
          />

          <Info
            label="Phone"
            value={
              application.guardian_phone
            }
          />

          <Info
            label="WhatsApp"
            value={
              application.guardian_whatsapp
            }
          />

          <Info
            label="Occupation"
            value={
              application.guardian_occupation
            }
          />

        </Section>

      </div>


      {application.status ===
        "pending" && (

        <AdmissionActions
          applicationId={
            application.id
          }
          classes={
            classes ?? []
          }
        />

      )}

    </div>
  );
}


function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">

      <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">

        <h2 className="break-words font-semibold leading-snug text-slate-900">
          {title}
        </h2>

      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:gap-5 sm:p-5 md:grid-cols-2 md:gap-6 md:p-6">
        {children}
      </div>

    </section>
  );

}


function Info({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {

  return (
    <div className="min-w-0">

      <p className="break-words text-xs uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-medium leading-6 text-slate-800 sm:mt-2">
        {value || "-"}
      </p>

    </div>
  );

}