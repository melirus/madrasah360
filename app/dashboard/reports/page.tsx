import Link from "next/link";
import {
  Users,
  Wallet,
  ClipboardCheck,
  BookOpen,
  FileText,
  ReceiptText,
} from "lucide-react";

export default function ReportsPage() {
  const reports = [
    {
      title: "Student Summary",
      description:
        "View student profile, class and guardian information.",
      href: "/dashboard/reports/students",
      icon: Users,
    },
    {
      title: "Fee Statement",
      description:
        "Generate student fee and payment statement.",
      href: "/dashboard/reports/fees",
      icon: Wallet,
    },
    {
      title: "Attendance Report",
      description:
        "Review attendance records by class and student.",
      href: "/dashboard/attendance",
      icon: ClipboardCheck,
    },
    {
      title: "Hafazan Progress",
      description:
        "Review student hafazan progress and history.",
      href: "/dashboard/hafazan",
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Reports
        </h1>

        <p className="mt-2 text-slate-500">
          Generate operational and student reports.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">

        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <Link
              key={report.href}
              href={report.href}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-sm"
            >
              <div className="flex items-start gap-4">

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                  <Icon size={22} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    {report.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {report.description}
                  </p>
                </div>

              </div>
            </Link>
          );
        })}

      </div>

    </div>
  );
}