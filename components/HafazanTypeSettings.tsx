"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";


type HafazanType = {
  id: string;
  code: string;
  name: string;
  term: string;
  minimum_quantity: number | null;
  minimum_unit: string | null;
  sort_order: number;
  is_active: boolean;
};


export default function HafazanTypeSettings({
  types,
}: {
  types: HafazanType[];
}) {

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">

      <div className="border-b border-slate-100 px-6 py-5">

        <h2 className="font-semibold text-slate-900">
          Hafazan Configuration
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Configure terminology and minimum requirements.
        </p>

      </div>


      <div className="divide-y divide-slate-100">

        {types.map(
          (type) => (

            <HafazanRow
              key={type.id}
              type={type}
            />

          )
        )}

      </div>

    </section>
  );
}


function HafazanRow({
  type,
}: {
  type: HafazanType;
}) {

  const supabase =
    createClient();

  const router =
    useRouter();


  const [name, setName] =
    useState(
      type.name
    );

  const [term, setTerm] =
    useState(
      type.term
    );

  const [quantity, setQuantity] =
    useState(
      String(
        type.minimum_quantity ??
        ""
      )
    );

  const [unit, setUnit] =
    useState(
      type.minimum_unit ??
      ""
    );

  const [active, setActive] =
    useState(
      type.is_active
    );


  async function save() {

    const { error } =
      await supabase
        .from("hafazan_types")
        .update({

          name,

          term,

          minimum_quantity:
            quantity
              ? Number(quantity)
              : null,

          minimum_unit:
            unit || null,

          is_active:
            active,

        })
        .eq(
          "id",
          type.id
        );


    if (error) {

      alert(
        error.message
      );

      return;

    }


    router.refresh();

  }


  return (
    <div className="grid gap-4 p-5 lg:grid-cols-[1fr_1fr_120px_150px_100px_100px]">

      <input
        value={name}
        onChange={(e) =>
          setName(
            e.target.value
          )
        }
        className={inputStyle}
      />


      <input
        value={term}
        onChange={(e) =>
          setTerm(
            e.target.value
          )
        }
        className={inputStyle}
      />


      <input
        type="number"
        value={quantity}
        onChange={(e) =>
          setQuantity(
            e.target.value
          )
        }
        className={inputStyle}
      />


      <input
        value={unit}
        onChange={(e) =>
          setUnit(
            e.target.value
          )
        }
        className={inputStyle}
      />


      <label className="flex items-center gap-2 text-sm">

        <input
          type="checkbox"
          checked={active}
          onChange={(e) =>
            setActive(
              e.target.checked
            )
          }
        />

        Active
      </label>


      <button
        type="button"
        onClick={save}
        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
      >
        Save
      </button>

    </div>
  );
}


const inputStyle =
  "rounded-lg border border-slate-200 px-3 py-2 text-sm";