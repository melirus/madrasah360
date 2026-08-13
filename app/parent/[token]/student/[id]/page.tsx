import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Wallet,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";


export default async function ParentStudentPage({
  params,
}: {
  params: Promise<{
    token: string;
    id: string;
  }>;
}) {

  const {
    token,
    id,
  } = await params;


  const supabase =
    await createClient();


  const {
    data,
    error,
  } = await supabase.rpc(
    "get_parent_student_summary",
    {
      p_token:
        token,

      p_student_id:
        id,
    }
  );


  if (
    error ||
    !data?.valid
  ) {

    return (
      <main className="min-h-screen bg-slate-50 p-8">

        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center">

          <h1 className="text-xl font-bold">
            Access denied
          </h1>

        </div>

      </main>
    );
  }


  const student =
    data.student;

  const hafazan =
    data.hafazan ?? [];

  const academic =
    data.academic ?? [];

  const fees =
    data.fees ?? [];

  const attendance =
    data.attendance;


  const attendanceRate =
    Number(
      attendance?.total ?? 0
    ) > 0

      ? Math.round(

          Number(
            attendance.present
          ) /

          Number(
            attendance.total
          ) *

          100
        )

      : 0;


  const feeBalance =
    fees.reduce(

      (
        sum: number,
        fee: any
      ) => {

        const net =
          Number(
            fee.amount
          ) -
          Number(
            fee.discount ?? 0
          );

        return (
          sum +
          Math.max(
            net -
              Number(
                fee.paid ?? 0
              ),
            0
          )
        );

      },

      0
    );


  return (
    <main className="min-h-screen bg-slate-50">

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-5xl px-5 py-5">

          <Link
            href={`/parent/${token}`}
            className="inline-flex items-center gap-2 text-sm text-slate-500"
          >
            <ArrowLeft size={16} />

            Back
          </Link>

        </div>

      </header>


      <div className="mx-auto max-w-5xl space-y-7 px-5 py-8">


        {/* STUDENT */}

        <div>

          <p className="text-sm font-medium text-emerald-700">
            {
              student.student_no
            }
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            {
              student.full_name
            }
          </h1>

          <p className="mt-2 text-slate-500">
            {
              student.class_name ??
              "Class not assigned"
            }
          </p>

        </div>


        {/* SUMMARY */}

        <div className="grid gap-4 md:grid-cols-3">

          <SummaryCard
            icon={BookOpen}
            label="Latest Hafazan"
            value={
              hafazan[0]?.type
                ? hafazan[0].type
                : "No record"
            }
          />

          <SummaryCard
            icon={ClipboardCheck}
            label="Attendance"
            value={
              attendance?.total
                ? `${attendanceRate}%`
                : "No record"
            }
          />

          <SummaryCard
            icon={Wallet}
            label="Fee Balance"
            value={`RM${feeBalance.toFixed(
              2
            )}`}
          />

        </div>


        {/* HAFAZAN */}

        <Section
          title="Hafazan"
          icon={BookOpen}
        >

          {!hafazan.length ? (

            <Empty text="Tiada rekod hafazan." />

          ) : (

            <div className="space-y-3">

              {hafazan.map(
                (
                  record: any,
                  index: number
                ) => (

                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 p-4"
                  >

                    <div className="flex justify-between gap-4">

                      <div>

                        <p className="font-medium text-slate-900">
                          {
                            record.type ??
                            "Hafazan"
                          }

                          {record.name
                            ? ` — ${record.name}`
                            : ""}
                        </p>


                        <p className="mt-1 text-sm text-slate-500">

                          {record.surah ??
                            "-"}

                          {record.ayat_from &&
                          record.ayat_to
                            ? ` : ${record.ayat_from}-${record.ayat_to}`
                            : ""}

                        </p>

                      </div>


                      <div className="text-right">

                        <p className="text-sm font-semibold text-emerald-700">
                          Gred{" "}
                          {
                            record.grade ??
                            "-"
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {
                            record.date
                          }
                        </p>

                      </div>

                    </div>


                    {record.comment && (

                      <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                        {
                          record.comment
                        }
                      </p>

                    )}

                  </div>

                )
              )}

            </div>

          )}

        </Section>


        {/* ATTENDANCE */}

        <Section
          title="Attendance"
          icon={ClipboardCheck}
        >

          <div className="grid grid-cols-3 gap-4">

            <Metric
              label="Attendance"
              value={`${attendanceRate}%`}
            />

            <Metric
              label="Present"
              value={
                String(
                  attendance?.present ??
                  0
                )
              }
            />

            <Metric
              label="Absent"
              value={
                String(
                  attendance?.absent ??
                  0
                )
              }
            />

          </div>

        </Section>


        {/* ACADEMIC */}

        <Section
          title="Academic"
          icon={GraduationCap}
        >

          {!academic.length ? (

            <Empty text="Tiada keputusan akademik." />

          ) : (

            <div className="space-y-3">

              {academic.map(
                (
                  result: any,
                  index: number
                ) => (

                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                  >

                    <div>

                      <p className="font-medium text-slate-900">
                        {
                          result.subject ??
                          "Subject"
                        }
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          result.assessment
                        }
                      </p>

                    </div>


                    <div className="text-right">

                      <p className="font-semibold text-slate-900">

                        {
                          result.mark ??
                          "-"
                        }

                        {result.maximum_mark
                          ? ` / ${result.maximum_mark}`
                          : ""}

                      </p>

                      <p className="text-sm font-medium text-emerald-700">
                        Grade{" "}
                        {
                          result.grade ??
                          "-"
                        }
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </Section>


        {/* FEES */}

        <Section
          title="Fees"
          icon={Wallet}
        >

          {!fees.length ? (

            <Empty text="Tiada rekod yuran." />

          ) : (

            <div className="space-y-3">

              {fees.map(
                (
                  fee: any,
                  index: number
                ) => {

                  const net =
                    Number(
                      fee.amount
                    ) -
                    Number(
                      fee.discount ??
                      0
                    );

                  const balance =
                    Math.max(
                      net -
                        Number(
                          fee.paid ??
                          0
                        ),
                      0
                    );


                  return (

                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                    >

                      <div>

                        <p className="font-medium text-slate-900">
                          {
                            fee.description ||
                            fee.invoice_no
                          }
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {
                            fee.invoice_no
                          }
                        </p>

                      </div>


                      <div className="text-right">

                        <p className="font-semibold text-slate-900">
                          RM
                          {
                            balance.toFixed(
                              2
                            )
                          }
                        </p>

                        <p className="mt-1 text-xs capitalize text-slate-500">
                          {
                            fee.status
                          }
                        </p>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </Section>

      </div>

    </main>
  );
}


function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-center gap-4">

        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
          <Icon size={20} />
        </div>

        <div>

          <p className="text-xs text-slate-500">
            {label}
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}


function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">

      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">

        <Icon
          size={20}
          className="text-emerald-700"
        />

        <h2 className="font-semibold text-slate-900">
          {title}
        </h2>

      </div>

      <div className="p-6">
        {children}
      </div>

    </section>
  );
}


function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div className="rounded-xl bg-slate-50 p-4 text-center">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}


function Empty({
  text,
}: {
  text: string;
}) {

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}