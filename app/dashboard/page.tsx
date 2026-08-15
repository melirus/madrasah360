import Link from "next/link";

import {
  Users,
  GraduationCap,
  UserPlus,
  Wallet,
  ClipboardCheck,
  BookOpen,
  ArrowRight,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";


export default async function DashboardPage() {

  const supabase =
    await createClient();


  const today =
    new Date()
      .toISOString()
      .slice(0, 10);


  const [
    studentsResult,
    teachersResult,
    applicationsResult,
    invoicesResult,
    paymentsResult,
    attendanceResult,
    hafazanResult,
    recentApplicationsResult,
    recentHafazanResult,
  ] = await Promise.all([


    // ==========================================
    // ACTIVE STUDENTS
    // ==========================================

    supabase
      .from("students")
      .select(
        "id",
        { count: "exact" }
      )
      .eq(
        "status",
        "active"
      ),


    // ==========================================
    // ACTIVE TEACHERS
    // ==========================================

    supabase
      .from("teachers")
      .select(
        "id",
        { count: "exact" }
      )
      .eq(
        "status",
        "active"
      ),


    // ==========================================
    // PENDING APPLICATIONS
    // ==========================================

    supabase
      .from("applications")
      .select(
        "id",
        { count: "exact" }
      )
      .eq(
        "status",
        "pending"
      ),


    // ==========================================
    // STUDENT FEES
    // ==========================================

    supabase
      .from("student_fees")
      .select(`
        id,
        amount,
        discount_amount,
        status,

        payment_allocations (
          amount
        )
      `),


    // ==========================================
    // PAYMENTS
    // ==========================================

    supabase
      .from("payments")
      .select(`
        id,
        amount
      `),


    // ==========================================
    // ATTENDANCE TODAY
    // ==========================================

    supabase
      .from("attendance_sessions")
      .select(`
        id,

        attendance_records (
          status
        )
      `)
      .eq(
        "attendance_date",
        today
      ),


    // ==========================================
    // HAFAZAN TODAY
    // ==========================================

    supabase
      .from("hafazan_records")
      .select(`
        id,
        student_id
      `)
      .eq(
        "record_date",
        today
      ),


    // ==========================================
    // RECENT APPLICATIONS
    // ==========================================

    supabase
      .from("applications")
      .select(`
        id,
        application_no,
        applicant_name,
        requested_level,
        status,
        created_at
      `)
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(5),


    // ==========================================
    // RECENT HAFAZAN
    // ==========================================

    supabase
      .from("hafazan_records")
      .select(`
        id,
        record_date,
        juzuk,
        surah,
        grade,

        students (
          id,
          full_name
        ),

        hafazan_types (
          name,
          term
        )
      `)
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(5),

  ]);


  // ==========================================
  // BASIC COUNTS
  // ==========================================

  const activeStudents =
    studentsResult.count ?? 0;

  const activeTeachers =
    teachersResult.count ?? 0;

  const pendingApplications =
    applicationsResult.count ?? 0;


  // ==========================================
  // FINANCE
  // ==========================================

  const invoices =
    invoicesResult.data ?? [];


  let totalInvoiced = 0;

  let outstandingFees = 0;


  invoices.forEach(
    (invoice: any) => {

      const netAmount =
        Number(
          invoice.amount ?? 0
        ) -
        Number(
          invoice.discount_amount ?? 0
        );


      const paid =
        invoice.payment_allocations
          ?.reduce(
            (
              sum: number,
              allocation: any
            ) =>
              sum +
              Number(
                allocation.amount ?? 0
              ),
            0
          ) ?? 0;


      totalInvoiced +=
        netAmount;


      outstandingFees +=
        Math.max(
          netAmount - paid,
          0
        );

    }
  );


  const totalPaid =
    paymentsResult.data
      ?.reduce(
        (
          sum,
          payment
        ) =>
          sum +
          Number(
            payment.amount ?? 0
          ),
        0
      ) ?? 0;


  // ==========================================
  // ATTENDANCE
  // ==========================================

  const attendanceSessions =
    attendanceResult.data ?? [];


  const todayAttendance =
    attendanceSessions
      .flatMap(
        (session: any) =>
          session.attendance_records ??
          []
      );


const presentToday =
  todayAttendance.filter(
    (record: any) =>
      record.status === "present"
  ).length;

const lateToday =
  todayAttendance.filter(
    (record: any) =>
      record.status === "late"
  ).length;

const excusedToday =
  todayAttendance.filter(
    (record: any) =>
      record.status === "excused"
  ).length;

const absentToday =
  todayAttendance.filter(
    (record: any) =>
      record.status === "absent"
  ).length;


// Present + Late = physically attended
const attendedToday =
  presentToday + lateToday;


const attendanceRate =
  todayAttendance.length > 0
    ? Math.round(
        (
          attendedToday /
          todayAttendance.length
        ) * 100
      )
    : 0;


  // ==========================================
  // HAFAZAN TODAY
  // ==========================================

  const hafazanToday =
    hafazanResult.data?.length ??
    0;


  const hafazanStudentsToday =
    new Set(
      hafazanResult.data?.map(
        (record) =>
          record.student_id
      ) ?? []
    ).size;


  return (
    <div className="space-y-6 sm:space-y-8">


      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div>

        <p className="text-sm font-medium text-emerald-700">
          Madrasah Management System
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Dashboard
        </h1>

        <p className="mt-1 text-sm leading-6 text-slate-500 sm:mt-2 sm:text-base">
          Overview of madrasah operations.
        </p>

      </div>


      {/* ===================================== */}
      {/* MAIN KPI */}
      {/* ===================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">

        <KpiCard
          icon={Users}
          title="Active Students"
          value={
            activeStudents.toString()
          }
          href="/dashboard/students"
        />


        <KpiCard
          icon={GraduationCap}
          title="Teachers"
          value={
            activeTeachers.toString()
          }
          href="/dashboard/teachers"
        />


        <KpiCard
          icon={UserPlus}
          title="Pending Admissions"
          value={
            pendingApplications.toString()
          }
          href="/dashboard/admissions"
        />


        <KpiCard
          icon={Wallet}
          title="Outstanding Fees"
          value={
            `RM${outstandingFees.toFixed(
              2
            )}`
          }
          href="/dashboard/finance"
        />

      </div>


      {/* ===================================== */}
      {/* TODAY */}
      {/* ===================================== */}

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">


        {/* ATTENDANCE */}

        <section className="rounded-2xl border border-slate-200 bg-white">

          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">

            <div>

              <h2 className="font-semibold text-slate-900">
                Attendance Today
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Daily attendance overview
              </p>

            </div>


            <ClipboardCheck
              size={22}
              className="text-emerald-700"
            />

          </div>


<div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-5 lg:p-6">

  <Metric
    label="Attendance"
    value={
      todayAttendance.length
        ? `${attendanceRate}%`
        : "-"
    }
  />

  <Metric
    label="Present"
    value={presentToday.toString()}
  />

  <Metric
    label="Late"
    value={lateToday.toString()}
  />

  <Metric
    label="Excused"
    value={excusedToday.toString()}
  />

  <Metric
    label="Absent"
    value={absentToday.toString()}
  />

</div>


          <div className="border-t border-slate-100 px-4 py-4 sm:px-6">

            <Link
              href="/dashboard/attendance"
              className="inline-flex items-center gap-2 rounded-lg py-1 text-sm font-medium text-emerald-700"
            >
              Attendance module
              <ArrowRight size={15} />
            </Link>

          </div>

        </section>


        {/* HAFAZAN */}

        <section className="rounded-2xl border border-slate-200 bg-white">

          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">

            <div>

              <h2 className="font-semibold text-slate-900">
                Hafazan Today
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Daily hafazan activity
              </p>

            </div>

            <BookOpen
              size={22}
              className="text-emerald-700"
            />

          </div>


          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:p-6">

            <Metric
              label="Students Recorded"
              value={
                hafazanStudentsToday.toString()
              }
            />

            <Metric
              label="Records"
              value={
                hafazanToday.toString()
              }
            />

          </div>


          <div className="border-t border-slate-100 px-4 py-4 sm:px-6">

            <Link
              href="/dashboard/hafazan"
              className="inline-flex items-center gap-2 rounded-lg py-1 text-sm font-medium text-emerald-700"
            >
              Hafazan module
              <ArrowRight size={15} />
            </Link>

          </div>

        </section>

      </div>


      {/* ===================================== */}
      {/* FINANCE SUMMARY */}
      {/* ===================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">

          <h2 className="font-semibold text-slate-900">
            Finance Overview
          </h2>

        </div>


        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-3 lg:p-6">

          <Metric
            label="Total Invoiced"
            value={`RM${totalInvoiced.toFixed(
              2
            )}`}
          />

          <Metric
            label="Payments Received"
            value={`RM${totalPaid.toFixed(
              2
            )}`}
          />

          <Metric
            label="Outstanding"
            value={`RM${outstandingFees.toFixed(
              2
            )}`}
          />

        </div>


        <div className="border-t border-slate-100 px-4 py-4 sm:px-6">

          <Link
            href="/dashboard/finance"
            className="inline-flex items-center gap-2 rounded-lg py-1 text-sm font-medium text-emerald-700"
          >
            View Finance
            <ArrowRight size={15} />
          </Link>

        </div>

      </section>


      {/* ===================================== */}
      {/* RECENT DATA */}
      {/* ===================================== */}

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">


        {/* APPLICATIONS */}

        <section className="rounded-2xl border border-slate-200 bg-white">

          <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">

            <h2 className="font-semibold text-slate-900">
              Recent Applications
            </h2>

          </div>


          <div className="divide-y divide-slate-100">

            {!recentApplicationsResult
              .data?.length && (

              <Empty
                text="No recent applications."
              />

            )}


            {recentApplicationsResult
              .data?.map(
                (application) => (

                  <Link
                    key={
                      application.id
                    }
                    href={`/dashboard/admissions/${application.id}`}
                    className="flex flex-col gap-3 px-4 py-4 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >

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
                          "-"
                        }
                      </p>

                    </div>


                    <StatusBadge
                      status={
                        application.status
                      }
                    />

                  </Link>

                )
              )}

          </div>

        </section>


        {/* RECENT HAFAZAN */}

        <section className="rounded-2xl border border-slate-200 bg-white">

          <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">

            <h2 className="font-semibold text-slate-900">
              Recent Hafazan
            </h2>

          </div>


          <div className="divide-y divide-slate-100">

            {!recentHafazanResult
              .data?.length && (

              <Empty
                text="No hafazan records."
              />

            )}


            {recentHafazanResult
              .data?.map(
                (record: any) => {

                  const student =
                    Array.isArray(
                      record.students
                    )
                      ? record.students[0]
                      : record.students;


                  const type =
                    Array.isArray(
                      record.hafazan_types
                    )
                      ? record.hafazan_types[0]
                      : record.hafazan_types;


                  return (

                    <Link
                      key={
                        record.id
                      }
                      href={
                        student?.id
                          ? `/dashboard/hafazan/student/${student.id}`
                          : "/dashboard/hafazan"
                      }
                      className="flex flex-col gap-3 px-4 py-4 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >

                      <div className="min-w-0 flex-1">

                        <p className="break-words font-medium leading-snug text-slate-900">
                          {
                            student?.full_name ??
                            "Student"
                          }
                        </p>

                        <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                          {
                            type?.term ??
                            "Hafazan"
                          }


                          {record.surah
                            ? ` · ${record.surah}`
                            : ""}

                          {record.juzuk
                            ? ` · Juzuk ${record.juzuk}`
                            : ""}
                        </p>

                      </div>


                      <div className="text-left sm:text-right">

                        <p className="text-sm font-semibold text-emerald-700 sm:whitespace-nowrap">
                          {
                            record.grade ??
                            "-"
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {
                            record.record_date
                          }
                        </p>

                      </div>

                    </Link>

                  );

                }
              )}

          </div>

        </section>

      </div>

    </div>
  );
}


// =============================================
// COMPONENTS
// =============================================

function KpiCard({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  href: string;
}) {

  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm sm:p-5 xl:p-6"
    >

      <div className="flex items-center justify-between gap-4">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 sm:mt-3 sm:text-3xl">
            {value}
          </p>

        </div>

        <div className="shrink-0 rounded-xl bg-emerald-50 p-2.5 text-emerald-700 sm:p-3">

          <Icon size={22} />

        </div>

      </div>

    </Link>
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
    <div className="rounded-xl bg-slate-50 p-3 sm:p-4 lg:p-5">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1.5 break-words text-xl font-bold leading-tight text-slate-900 sm:mt-2 sm:text-2xl">
        {value}
      </p>

    </div>
  );
}


function StatusBadge({
  status,
}: {
  status: string;
}) {

  let style =
    "bg-slate-100 text-slate-600";


  if (
    status === "pending"
  ) {
    style =
      "bg-amber-50 text-amber-700";
  }


  if (
    status === "enrolled" ||
    status === "approved"
  ) {
    style =
      "bg-emerald-50 text-emerald-700";
  }


  if (
    status === "rejected"
  ) {
    style =
      "bg-red-50 text-red-700";
  }


  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium capitalize ${style}`}
    >
      {status}
    </span>
  );
}


function Empty({
  text,
}: {
  text: string;
}) {

  return (
    <div className="px-4 py-6 text-center text-sm leading-6 text-slate-500 sm:p-8">
      {text}
    </div>
  );
}