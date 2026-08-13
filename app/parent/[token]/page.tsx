import { createClient } from "@/lib/supabase/server";
import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Wallet,
  UserRound,
} from "lucide-react";

export default async function ParentPortalPage({
  params,
}: {
  params: Promise<{
    token: string;
  }>;
}) {
  const { token } =
    await params;

  const supabase =
    await createClient();


  const {
    data,
    error,
  } = await supabase.rpc(
    "get_parent_portal",
    {
      p_token:
        token,
    }
  );


  if (
    error ||
    !data?.valid
  ) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16">

        <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center">

          <h1 className="text-xl font-bold text-slate-900">
            Link Tidak Sah
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Link portal ibu bapa tidak sah atau telah tamat tempoh.
          </p>

        </div>

      </main>
    );
  }


  const guardian =
    data.guardian;

  const students =
    data.students ?? [];


  return (
    <main className="min-h-screen bg-slate-50">

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-5xl px-5 py-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 font-bold text-white">
              M
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                Madrasah360
              </p>

              <p className="text-xs text-slate-500">
                Parent Portal
              </p>
            </div>

          </div>

        </div>

      </header>


      <div className="mx-auto max-w-5xl space-y-8 px-5 py-8">

        <div>

          <p className="text-sm text-slate-500">
            Assalamualaikum
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {guardian?.name}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Maklumat anak di Madrasah MUTQAN.
          </p>

        </div>


        <section>

          <h2 className="font-semibold text-slate-900">
            Anak / Pelajar
          </h2>


          <div className="mt-4 grid gap-5 md:grid-cols-2">

            {students.map(
              (student: any) => (

                <a
                  key={student.id}
                  href={`/parent/${token}/student/${student.id}`}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <UserRound
                        size={22}
                      />
                    </div>

                    <div>

                      <h3 className="font-semibold text-slate-900">
                        {
                          student.full_name
                        }
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          student.student_no
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {
                          student.relationship
                        }
                      </p>

                    </div>

                  </div>

                </a>

              )
            )}

          </div>

        </section>

      </div>

    </main>
  );
}