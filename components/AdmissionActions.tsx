"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Check,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";


type ClassItem = {
  id: string;
  name: string;
  academic_year_id: string | null;
};


export default function AdmissionActions({
  applicationId,
  classes,
}: {
  applicationId: string;
  classes: ClassItem[];
}) {

  const router =
    useRouter();

  const supabase =
    createClient();

  const [classId, setClassId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function approve() {

    if (!classId) {

      setError(
        "Please select a class."
      );

      return;
    }


    setLoading(true);
    setError("");


    const {
      data,
      error,
    } = await supabase.rpc(
      "approve_application",
      {
        p_application_id:
          applicationId,

        p_class_id:
          classId,
      }
    );


    if (error) {

      setError(error.message);

      setLoading(false);

      return;
    }


    router.push(
      `/dashboard/students/${data}`
    );

    router.refresh();

  }


  async function reject() {

    setLoading(true);


    const { error } =
      await supabase
        .from("applications")
        .update({
          status: "rejected",
          reviewed_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          applicationId
        );


    if (error) {

      setError(error.message);

      setLoading(false);

      return;
    }


    router.push(
      "/dashboard/admissions"
    );

    router.refresh();

  }


  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6">

      <h2 className="font-semibold text-slate-900">
        Application Decision
      </h2>


      <p className="mt-1 text-sm leading-6 text-slate-500">
        Assign a class before approving the application.
      </p>


      <div className="mt-4 w-full sm:mt-5 sm:max-w-md">

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Class
        </label>

        <select
          value={classId}
          onChange={(e) =>
            setClassId(
              e.target.value
            )
          }
          className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:px-4"
        >

          <option value="">
            Select class
          </option>


          {classes.map(
            (item) => (

              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>

            )
          )}

        </select>

      </div>


      {error && (
        <p className="mt-4 break-words text-sm leading-6 text-red-600">
          {error}
        </p>
      )}


      <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row">

        <button
          disabled={loading}
          onClick={approve}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <Check size={17} />

          Approve & Enrol
        </button>


        <button
          disabled={loading}
          onClick={reject}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <X size={17} />

          Reject
        </button>

      </div>

    </div>
  );

}