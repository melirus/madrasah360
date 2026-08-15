import Link from "next/link";
import {
  UserRound,
  ChevronRight,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function AdmissionsPage() {

  const supabase =
    await createClient();


  const { data, error } =
    await supabase
      .from("applications")
      .select(`
        id,
        application_no,
        applicant_name,
        gender,
        requested_level,
        guardian_name,
        guardian_phone,
        application_date,
        status
      `)
      .order(
        "created_at",
        { ascending: false }
      );


  if (error) {

    return (
      <p className="text-red-600">
        {error.message}
      </p>
    );

  }


  const pending =
    data?.filter(
      (item) =>
        item.status === "pending"
    ).length ?? 0;


  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Admissions
        </h1>

        <p className="mt-1 text-sm leading-6 text-slate-500 sm:mt-2 sm:text-base">
          Manage student applications and enrolment.
        </p>

      </div>


      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">

        <StatCard
          title="Total Applications"
          value={
            data?.length.toString() ??
            "0"
          }
        />

        <StatCard
          title="Pending Review"
          value={
            pending.toString()
          }
        />

        <StatCard
          title="Approved"
          value={
            (
              data?.filter(
                (item) =>
                  item.status ===
                  "approved" ||
                  item.status ===
                  "enrolled"
              ).length ?? 0
            ).toString()
          }
        />

      </div>


      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">

          <h2 className="font-semibold text-slate-900">
            Applications
          </h2>

        </div>


        <div className="divide-y divide-slate-100">

          {!data?.length && (

            <div className="p-10 text-center text-sm text-slate-500">
              No applications.
            </div>

          )}


          {data?.map(
            (application) => (

              <Link
                key={application.id}
                href={`/dashboard/admissions/${application.id}`}
                className="flex flex-col gap-3 px-4 py-4 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5"
              >

                <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">

                  <div className="flex h-11 shrink-0 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">

                    <UserRound
                      size={20}
                    />

                  </div>


                  <div className="min-w-0 flex-1">

                    <p className="break-words font-medium leading-snug text-slate-900">
                      {
                        application.applicant_name
                      }
                    </p>

                    <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                      {
                        application.application_no
                      }
                      {" · "}
                      {
                        application.requested_level ??
                        "Level not specified"
                      }
                    </p>

                  </div>

                </div>


                <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end sm:gap-5">

                  <ApplicationStatus
                    status={
                      application.status
                    }
                  />

                  <ChevronRight
                    size={18}
                    className="shrink-0 text-slate-400"
                  />

                </div>

              </Link>

            )
          )}

        </div>

      </div>

    </div>
  );
}


function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6">

      <p className="break-words text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 break-words text-2xl font-bold leading-tight text-slate-900 sm:mt-3 sm:text-3xl">
        {value}
      </p>

    </div>
  );

}


function ApplicationStatus({
  status,
}: {
  status: string;
}) {

  let style =
    "bg-slate-100 text-slate-600";

  if (status === "pending") {
    style =
      "bg-amber-50 text-amber-700";
  }

  if (
    status === "approved" ||
    status === "enrolled"
  ) {
    style =
      "bg-emerald-50 text-emerald-700";
  }

  if (status === "rejected") {
    style =
      "bg-red-50 text-red-700";
  }


  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${style}`}
    >
      {status}
    </span>
  );

}