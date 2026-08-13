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

        <h1 className="text-3xl font-bold text-slate-900">
          Admissions
        </h1>

        <p className="mt-2 text-slate-500">
          Manage student applications and enrolment.
        </p>

      </div>


      <div className="grid gap-5 md:grid-cols-3">

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

        <div className="border-b border-slate-100 px-6 py-5">

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
                className="flex items-center justify-between px-6 py-5 hover:bg-slate-50"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">

                    <UserRound
                      size={20}
                    />

                  </div>


                  <div>

                    <p className="font-medium text-slate-900">
                      {
                        application.applicant_name
                      }
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
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


                <div className="flex items-center gap-5">

                  <ApplicationStatus
                    status={
                      application.status
                    }
                  />

                  <ChevronRight
                    size={18}
                    className="text-slate-400"
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">
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