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
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-16">

        <div className="mx-auto w-full max-w-lg rounded-2xl border border-red-200 bg-white p-5 text-center sm:p-8">

          <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
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

        <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 font-bold text-white">
              M
            </div>

            <div className="min-w-0">
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


      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">

        <div>

          <p className="text-sm text-slate-500">
            Assalamualaikum
          </p>

          <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            {guardian?.name}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Maklumat anak di Madrasah MUTQAN.
          </p>

        </div>


        <section className="space-y-4">

          <h2 className="font-semibold text-slate-900">
            Anak / Pelajar
          </h2>


          <div className="mt-4 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">

            {students.map(
              (student: any) => (

                <a
                  key={student.id}
                  href={`/parent/${token}/student/${student.id}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 sm:p-6"
                >

                  <div className="flex items-start gap-3 sm:gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 sm:h-12 sm:w-12">
                      <UserRound
                        size={22}
                      />
                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="break-words font-semibold leading-snug text-slate-900">
                        {
                          student.full_name
                        }
                      </h3>

                      <p className="mt-1 break-words text-sm text-slate-500">
                        {
                          student.student_no
                        }
                      </p>

                      <p className="mt-1 break-words text-xs text-slate-400">
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