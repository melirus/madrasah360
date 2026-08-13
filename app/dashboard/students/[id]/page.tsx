import StudentDocumentLink from "@/components/StudentDocumentLink";
import StudentDocumentUpload
  from "@/components/StudentDocumentUpload";
import ParentPortalWhatsAppButton
  from "@/components/ParentPortalWhatsAppButton";
import Link from "next/link";
import {
  ArrowLeft,
  UserRound,
  Phone,
  MessageCircle,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Wallet,
  FileText,
  School,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  // =====================================================
  // STUDENT BASIC INFORMATION
  // =====================================================

  const { data: student, error: studentError } =
    await supabase
      .from("students")
      .select(`
        id,
        student_no,
        full_name,
        ic_number,
        birth_certificate_no,
        gender,
        date_of_birth,
        nationality,
        address_line1,
        address_line2,
        postcode,
        city,
        state,
        previous_school,
        admission_date,
        photo_url,
        status,

        enrolments (
          status,
          classes (
            name,
            level
          ),
          academic_years (
            name
          )
        ),

        student_guardians (
          relationship,
          is_primary,
          receives_whatsapp,

          guardians (
            id,
            full_name,
            phone,
            whatsapp_number,
            occupation
          )
        )
      `)
      .eq("id", id)
      .single();

  if (studentError || !student) {
    return (
      <div>
        <Link
          href="/dashboard/students"
          className="inline-flex items-center gap-2 text-sm text-slate-500"
        >
          <ArrowLeft size={16} />
          Back to Students
        </Link>

        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Student not found.
        </div>
      </div>
    );
  }


  // =====================================================
  // HAFAZAN
  // =====================================================


const { data: hafazanRecords } =
  await supabase
    .from("hafazan_records")
    .select(`
      id,
      record_date,

      hafazan_types (
        name,
        term
      ),

      juzuk,
      surah,
      maqra,
      ayat_from,
      ayat_to,

      grade,

      teacher_comment
    `)
    .eq("student_id", id)
    .order("record_date", {
      ascending: false,
    })
    .limit(5);


  // =====================================================
  // ATTENDANCE
  // =====================================================

  const { data: attendanceRecords } =
    await supabase
      .from("attendance_records")
      .select(`
        id,
        status,
        attendance_sessions (
          attendance_date
        )
      `)
      .eq("student_id", id);


  // =====================================================
  // ACADEMIC RESULTS
  // =====================================================

  const { data: academicResults } =
    await supabase
      .from("assessment_results")
      .select(`
        id,
        mark,
        grade,
        teacher_comment,

        assessments (
          name,
          maximum_mark,

          subjects (
            name
          )
        )
      `)
      .eq("student_id", id)
      .limit(5);


  // =====================================================
  // STUDENT FEES
  // =====================================================

  const { data: feeRecords } =
    await supabase
      .from("student_fees")
      .select(`
        id,
        invoice_no,
        description,
        billing_month,
        billing_year,
        amount,
        discount_amount,
        due_date,
        status,
        fee_categories (
          name
        )
      `)
      .eq("student_id", id)
      .order("created_at", {
        ascending: false,
      });

<StudentDocumentUpload
  studentId={student.id}
/>
  // =====================================================
  // DOCUMENTS
  // =====================================================

  const { data: documents } =
    await supabase
      .from("documents")
      .select(`
        id,
        document_type,
        file_name,
        storage_path,
        created_at
      `)
      .eq("student_id", id)
      .order("created_at", {
        ascending: false,
      });


  // =====================================================
  // NORMALIZE RELATIONSHIP DATA
  // =====================================================

  const enrolments =
    student.enrolments ?? [];

  const activeEnrolment =
    enrolments.find(
      (item: any) =>
        item.status === "active"
    );

type NamedRelation = {
  name: string | null;
};

const classData =
  activeEnrolment?.classes as
    | NamedRelation
    | NamedRelation[]
    | null
    | undefined;

const academicYearData =
  activeEnrolment?.academic_years as
    | NamedRelation
    | NamedRelation[]
    | null
    | undefined;

const className =
  Array.isArray(classData)
    ? classData[0]?.name ?? "-"
    : classData?.name ?? "-";

const academicYear =
  Array.isArray(academicYearData)
    ? academicYearData[0]?.name ?? "-"
    : academicYearData?.name ?? "-";


  const guardianLinks =
    student.student_guardians ?? [];


  // =====================================================
  // ATTENDANCE CALCULATION
  // =====================================================

  const attendanceCount =
    attendanceRecords?.length ?? 0;

  const presentCount =
    attendanceRecords?.filter(
      (record) =>
        record.status === "present"
    ).length ?? 0;

  const attendancePercentage =
    attendanceCount > 0
      ? Math.round(
          (presentCount /
            attendanceCount) *
            100
        )
      : 0;


  // =====================================================
  // FEE CALCULATION
  // =====================================================

  const totalFees =
    feeRecords?.reduce(
      (sum, fee) =>
        sum +
        Number(fee.amount) -
        Number(
          fee.discount_amount ?? 0
        ),
      0
    ) ?? 0;

  const outstandingFees =
    feeRecords
      ?.filter(
        (fee) =>
          fee.status === "unpaid" ||
          fee.status === "partial" ||
          fee.status === "overdue"
      )
      .reduce(
        (sum, fee) =>
          sum +
          Number(fee.amount) -
          Number(
            fee.discount_amount ?? 0
          ),
        0
      ) ?? 0;


  return (
    <div className="space-y-6">

      {/* ================================================= */}
      {/* BACK */}
      {/* ================================================= */}

      <Link
        href="/dashboard/students"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Students
      </Link>


      {/* ================================================= */}
      {/* STUDENT HEADER */}
      {/* ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-7">

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-5">

            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <UserRound size={36} />
            </div>

            <div>

              <div className="flex items-center gap-3">

                <h1 className="text-3xl font-bold text-slate-900">
                  {student.full_name}
                </h1>

                <StatusBadge
                  status={student.status}
                />

              </div>


              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

                <span>
                  {student.student_no}
                </span>

                <span>
                  {className ??
                    "Class not assigned"}
                </span>

                {academicYear && (
                  <span>
                    Academic Year{" "}
                    {academicYear}
                  </span>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* KPI CARDS */}
      {/* ================================================= */}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          icon={BookOpen}
          label="Latest Hafazan"
          value={
            hafazanRecords?.[0]?.juzuk
              ? `Juzuk ${hafazanRecords[0].juzuk}`
              : "No record"
          }
        />

        <SummaryCard
          icon={ClipboardCheck}
          label="Attendance"
          value={
            attendanceCount > 0
              ? `${attendancePercentage}%`
              : "No record"
          }
        />

        <SummaryCard
          icon={GraduationCap}
          label="Academic"
          value={
            academicResults?.length
              ? `${academicResults.length} results`
              : "No results"
          }
        />

        <SummaryCard
          icon={Wallet}
          label="Outstanding Fees"
          value={`RM${outstandingFees.toFixed(
            2
          )}`}
        />

      </div>


      {/* ================================================= */}
      {/* PERSONAL INFORMATION */}
      {/* ================================================= */}

      <ProfileSection
        title="Personal Information"
        description="Student identity and enrolment information."
        icon={UserRound}
      >

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <Info
            label="Student Number"
            value={student.student_no}
          />

          <Info
            label="IC Number"
            value={student.ic_number}
          />

          <Info
            label="Birth Certificate"
            value={
              student.birth_certificate_no
            }
          />

          <Info
            label="Gender"
            value={student.gender}
          />

          <Info
            label="Date of Birth"
            value={
              student.date_of_birth
            }
          />

          <Info
            label="Nationality"
            value={student.nationality}
          />

          <Info
            label="Admission Date"
            value={
              student.admission_date
            }
          />

          <Info
            label="Previous School"
            value={
              student.previous_school
            }
          />

        </div>

      </ProfileSection>


      {/* ================================================= */}
      {/* ADDRESS */}
      {/* ================================================= */}

      <ProfileSection
        title="Address"
        description="Current residential information."
        icon={School}
      >

        <p className="text-sm leading-7 text-slate-700">

          {[
            student.address_line1,
            student.address_line2,
            student.postcode,
            student.city,
            student.state,
          ]
            .filter(Boolean)
            .join(", ") || "No address recorded."}

        </p>

      </ProfileSection>


      {/* ================================================= */}
      {/* GUARDIANS */}
      {/* ================================================= */}

      <ProfileSection
        title="Guardians"
        description="Parents and guardian contact information."
        icon={UserRound}
      >

        {guardianLinks.length === 0 ? (

          <EmptyState
            text="No guardian information recorded."
          />

        ) : (

          <div className="grid gap-4 lg:grid-cols-2">

            {guardianLinks.map(
              (link: any) => {

                const guardian =
                  Array.isArray(
                    link.guardians
                  )
                    ? link.guardians[0]
                    : link.guardians;

                if (!guardian) {
                  return null;
                }

                const whatsappNumber =
                  guardian.whatsapp_number;

                const message =
                  encodeURIComponent(
                    `Assalamualaikum ${guardian.full_name}. Makluman berkaitan ${student.full_name} daripada pihak Madrasah MUTQAN.`
                  );

                const whatsappUrl =
                  whatsappNumber
                    ? `https://wa.me/${whatsappNumber}?text=${message}`
                    : null;

                return (
                  <div
                    key={guardian.id}
                    className="rounded-xl border border-slate-200 p-5"
                  >

                    <div className="flex items-start justify-between">

                      <div>

                        <div className="flex items-center gap-2">

                          <h3 className="font-semibold text-slate-900">
                            {
                              guardian.full_name
                            }
                          </h3>

                          {link.is_primary && (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                              Primary
                            </span>
                          )}

                        </div>


                        <p className="mt-1 text-sm text-slate-500">
                          {
                            link.relationship
                          }
                        </p>

                      </div>

                    </div>


                    <div className="mt-5 space-y-3 text-sm">

                      <div className="flex items-center gap-2 text-slate-600">

                        <Phone size={16} />

                        {guardian.phone ||
                          "-"}

                      </div>


                      <div className="text-slate-600">

                        Occupation:{" "}
                        {guardian.occupation ||
                          "-"}

                      </div>

                    </div>




                    <div className="mt-5 flex flex-wrap gap-3">

  {whatsappUrl && (

    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
    >
      <MessageCircle size={17} />

      WhatsApp
    </a>

  )}


  {whatsappNumber && (

    <ParentPortalWhatsAppButton
      guardianId={
        guardian.id
      }
      guardianName={
        guardian.full_name
      }
      whatsappNumber={
        whatsappNumber
      }
      studentName={
        student.full_name
      }
    />

  )}

</div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </ProfileSection>


      {/* ================================================= */}
      {/* HAFAZAN */}
      {/* ================================================= */}

<ProfileSection
  title="Hafazan"
  description="Latest hafazan, tasmi' and murajaah records."
  icon={BookOpen}
>

  {/* FULL HAFAZAN PROGRESS BUTTON */}
  <div className="mb-5 flex justify-end">

    <Link
      href={`/dashboard/hafazan/student/${student.id}`}
      className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
    >
      <BookOpen size={16} />

      View Full Hafazan Progress
    </Link>

  </div>


  {!hafazanRecords?.length ? (

    <EmptyState
      text="No hafazan records yet."
    />

  ) : (

    <div className="overflow-x-auto">

<table className="w-full">

  <thead className="text-left text-xs uppercase text-slate-400">

    <tr>
      <th className="pb-3">
        Date
      </th>

      <th className="pb-3">
        Jenis
      </th>

      <th className="pb-3">
        Istilah
      </th>

      <th className="pb-3">
        Surah : Ayat
      </th>

      <th className="pb-3">
        Juzuk / Maqra&apos;
      </th>

      <th className="pb-3">
        Gred
      </th>
    </tr>

  </thead>


  <tbody className="divide-y divide-slate-100">

    {hafazanRecords.map(
      (record: any) => {

        const type =
          Array.isArray(
            record.hafazan_types
          )
            ? record.hafazan_types[0]
            : record.hafazan_types;

        return (

          <tr key={record.id}>

            <td className="py-4 text-sm text-slate-600">
              {record.record_date}
            </td>

            <td className="py-4 text-sm text-slate-600">
              {type?.name || "-"}
            </td>

            <td className="py-4 text-sm font-medium text-slate-800">
              {type?.term || "-"}
            </td>

            <td className="py-4 text-sm text-slate-600">

              {record.surah || "-"}

              {record.ayat_from &&
               record.ayat_to
                ? ` : ${record.ayat_from}-${record.ayat_to}`
                : ""}

            </td>

            <td className="py-4 text-sm text-slate-600">

              {record.juzuk
                ? `Juzuk ${record.juzuk}`
                : ""}

              {record.maqra
                ? ` / ${record.maqra}`
                : ""}

            </td>

            <td className="py-4 text-sm font-semibold text-slate-800">
              {record.grade || "-"}
            </td>

          </tr>

        );
      }
    )}

  </tbody>

</table>

    </div>

  )}

</ProfileSection>


      {/* ================================================= */}
      {/* ATTENDANCE */}
      {/* ================================================= */}

      <ProfileSection
        title="Attendance"
        description="Attendance summary for this student."
        icon={ClipboardCheck}
      >

        {attendanceCount === 0 ? (

          <EmptyState
            text="No attendance records yet."
          />

        ) : (

          <div className="grid gap-5 md:grid-cols-3">

            <Metric
              label="Attendance Rate"
              value={`${attendancePercentage}%`}
            />

            <Metric
              label="Present"
              value={presentCount.toString()}
            />

            <Metric
              label="Total Sessions"
              value={attendanceCount.toString()}
            />

          </div>

        )}

      </ProfileSection>


      {/* ================================================= */}
      {/* ACADEMIC */}
      {/* ================================================= */}

      <ProfileSection
        title="Academic Results"
        description="Recent assessment and examination results."
        icon={GraduationCap}
      >

        {!academicResults?.length ? (

          <EmptyState
            text="No academic results recorded yet."
          />

        ) : (

          <div className="space-y-3">

            {academicResults.map(
              (result: any) => {

                const assessment =
                  Array.isArray(
                    result.assessments
                  )
                    ? result.assessments[0]
                    : result.assessments;

                const subject =
                  Array.isArray(
                    assessment?.subjects
                  )
                    ? assessment.subjects[0]
                    : assessment?.subjects;

                return (
                  <div
                    key={result.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-5 py-4"
                  >

                    <div>

                      <p className="font-medium text-slate-900">
                        {subject?.name ??
                          "Subject"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {assessment?.name ??
                          "Assessment"}
                      </p>

                    </div>


<div className="text-right">

  <p className="font-semibold text-slate-900">
    {result.mark ?? "-"}

    {assessment?.maximum_mark
      ? ` / ${assessment.maximum_mark}`
      : ""}
  </p>


  {result.mark !== null &&
   assessment?.maximum_mark && (

    <p className="mt-1 text-xs text-slate-400">
      {(
        (
          Number(result.mark) /
          Number(
            assessment.maximum_mark
          )
        ) *
        100
      ).toFixed(0)}
      %
    </p>

  )}


  <p className="mt-1 text-sm font-medium text-emerald-700">
    Grade{" "}
    {result.grade || "-"}
  </p>

</div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </ProfileSection>


      {/* ================================================= */}
      {/* FEES */}
      {/* ================================================= */}

      <ProfileSection
        title="Student Fees"
        description="Fee charges and outstanding balance."
        icon={Wallet}
      >

        {!feeRecords?.length ? (

          <EmptyState
            text="No fee records generated yet."
          />

        ) : (

          <>
            <div className="grid gap-5 md:grid-cols-3">

              <Metric
                label="Total Fees"
                value={`RM${totalFees.toFixed(
                  2
                )}`}
              />

              <Metric
                label="Outstanding"
                value={`RM${outstandingFees.toFixed(
                  2
                )}`}
              />

              <Metric
                label="Invoices"
                value={feeRecords.length.toString()}
              />

            </div>


            <div className="mt-6 space-y-3">

              {feeRecords.map(
                (fee: any) => (

                  <div
                    key={fee.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-5 py-4"
                  >

                    <div>

                      <p className="font-medium text-slate-900">
                        {fee.description ||
                          fee.fee_categories
                            ?.name ||
                          "Student Fee"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {fee.invoice_no ||
                          "No invoice number"}
                      </p>

                    </div>


                    <div className="text-right">

                      <p className="font-semibold text-slate-900">
                        RM
                        {Number(
                          fee.amount
                        ).toFixed(2)}
                      </p>

                      <span className="text-xs capitalize text-slate-500">
                        {fee.status}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          </>

        )}

      </ProfileSection>

      {/* ================================================= */}
      {/* DOCUMENT UPLOAD */}
      {/* ================================================= */}

      <StudentDocumentUpload
        studentId={student.id}
      />


      {/* ================================================= */}
      {/* DOCUMENTS */}
      {/* ================================================= */}

      <ProfileSection
        title="Documents"
        description="Student documents and supporting records."
        icon={FileText}
      >

        {!documents?.length ? (

          <EmptyState
            text="No documents uploaded yet."
          />

        ) : (

          <div className="space-y-3">

            {documents.map(
              (document) => (

<div
  key={document.id}
  className="flex items-center justify-between rounded-xl border border-slate-200 px-5 py-4"
>
  <div className="flex items-center gap-3">

    <FileText
      size={20}
      className="text-slate-400"
    />

    <div>
      <p className="font-medium text-slate-900">
        {document.file_name || "Document"}
      </p>

      <p className="mt-1 text-xs capitalize text-slate-500">
        {document.document_type?.replaceAll("_", " ") || "General"}
      </p>
    </div>

  </div>

  <StudentDocumentLink
    storagePath={document.storage_path}
  />

</div>

              )
            )}

          </div>

        )}

      </ProfileSection>

    </div>
  );
}


// =========================================================
// REUSABLE COMPONENTS
// =========================================================

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

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

        </div>


        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
          <Icon size={21} />
        </div>

      </div>

    </div>
  );
}


function ProfileSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white">

      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">

        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
          <Icon size={20} />
        </div>

        <div>

          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>

        </div>

      </div>


      <div className="p-6">
        {children}
      </div>

    </section>
  );
}


function Info({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number
    | null
    | undefined;
}) {
  return (
    <div>

      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-slate-800">
        {value || "-"}
      </p>

    </div>
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
    <div className="rounded-xl bg-slate-50 p-5">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}


function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}


function StatusBadge({
  status,
}: {
  status: string;
}) {
  const active =
    status === "active";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}