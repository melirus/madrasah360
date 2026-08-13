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
    <div className="rounded-2xl border border-slate-200 bg-white p-6">

      <h2 className="font-semibold text-slate-900">
        Application Decision
      </h2>


      <p className="mt-1 text-sm text-slate-500">
        Assign a class before approving the application.
      </p>


      <div className="mt-5 max-w-md">

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
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
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
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}


      <div className="mt-6 flex gap-3">

        <button
          disabled={loading}
          onClick={approve}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white"
        >
          <Check size={17} />

          Approve & Enrol
        </button>


        <button
          disabled={loading}
          onClick={reject}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-medium text-red-600"
        >
          <X size={17} />

          Reject
        </button>

      </div>

    </div>
  );

}