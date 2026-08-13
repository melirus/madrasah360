"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/client";


type Category = {
  id: string;
  name: string;
  is_active: boolean;
};


export default function FeeCategorySettings({
  organizationId,
  categories,
}: {
  organizationId: string;
  categories: Category[];
}) {

  const supabase =
    createClient();

  const router =
    useRouter();

  const [name, setName] =
    useState("");

  const [error, setError] =
    useState("");


  async function addCategory() {

    if (!name.trim()) {
      return;
    }


    const { error } =
      await supabase
        .from("fee_categories")
        .insert({

          organization_id:
            organizationId,

          name:
            name.trim(),

          is_active:
            true,

        });


    if (error) {

      setError(
        error.message
      );

      return;

    }


    setName("");

    router.refresh();

  }


  return (
    <section className="rounded-2xl border border-slate-200 bg-white">

      <div className="border-b border-slate-100 px-6 py-5">

        <h2 className="font-semibold text-slate-900">
          Fee Categories
        </h2>

      </div>


      <div className="p-6">

        {error && (
          <p className="mb-4 text-sm text-red-600">
            {error}
          </p>
        )}


        <div className="flex gap-3">

          <input
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            placeholder="Example: Transport Fee"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />


          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-medium text-white"
          >
            <Plus size={17} />

            Add
          </button>

        </div>


        <div className="mt-6 flex flex-wrap gap-2">

          {categories.map(
            (category) => (

              <span
                key={category.id}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700"
              >
                {category.name}
              </span>

            )
          )}

        </div>

      </div>

    </section>
  );
}