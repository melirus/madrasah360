"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  CalendarDays,
  Plus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";


type AcademicYear = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
};


export default function AcademicYearSettings({
  organizationId,
  years,
}: {
  organizationId: string;
  years: AcademicYear[];
}) {

  const supabase =
    createClient();

  const router =
    useRouter();


  const [name, setName] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function addYear() {

    if (
      !name ||
      !startDate ||
      !endDate
    ) {

      setError(
        "Complete all academic year fields."
      );

      return;
    }


    setLoading(true);
    setError("");


    const { error } =
      await supabase
        .from("academic_years")
        .insert({

          organization_id:
            organizationId,

          name,

          start_date:
            startDate,

          end_date:
            endDate,

          is_current:
            false,

        });


    if (error) {

      setError(
        error.message
      );

    } else {

      setName("");
      setStartDate("");
      setEndDate("");

      router.refresh();

    }


    setLoading(false);

  }


  async function setCurrent(
    id: string
  ) {

    setLoading(true);


    await supabase
      .from("academic_years")
      .update({
        is_current: false,
      })
      .eq(
        "organization_id",
        organizationId
      );


    const { error } =
      await supabase
        .from("academic_years")
        .update({
          is_current: true,
        })
        .eq(
          "id",
          id
        );


    if (error) {
      setError(
        error.message
      );
    }


    setLoading(false);

    router.refresh();

  }


  return (
    <section className="rounded-2xl border border-slate-200 bg-white">

      <div className="border-b border-slate-100 px-6 py-5">

        <h2 className="font-semibold text-slate-900">
          Academic Years
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage academic sessions and current year.
        </p>

      </div>


      <div className="p-6">

        {error && (
          <p className="mb-4 text-sm text-red-600">
            {error}
          </p>
        )}


        <div className="grid gap-4 md:grid-cols-4">

          <input
            placeholder="2027"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            className={inputStyle}
          />


          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(
                e.target.value
              )
            }
            className={inputStyle}
          />


          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(
                e.target.value
              )
            }
            className={inputStyle}
          />


          <button
            type="button"
            onClick={addYear}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-medium text-white"
          >
            <Plus size={17} />

            Add Year
          </button>

        </div>


        <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200">

          {years.map(
            (year) => (

              <div
                key={year.id}
                className="flex items-center justify-between px-5 py-4"
              >

                <div>

                  <p className="font-medium text-slate-900">
                    {year.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {year.start_date}
                    {" → "}
                    {year.end_date}
                  </p>

                </div>


                {year.is_current ? (

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    Current
                  </span>

                ) : (

                  <button
                    type="button"
                    onClick={() =>
                      setCurrent(
                        year.id
                      )
                    }
                    className="text-sm font-medium text-emerald-700"
                  >
                    Set Current
                  </button>

                )}

              </div>

            )
          )}

        </div>

      </div>

    </section>
  );
}


const inputStyle =
  "rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500";