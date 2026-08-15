"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search,
  UserRound,
  ChevronRight,
} from "lucide-react";

type Student = {
  id: string;
  student_no: string | null;
  full_name: string;
  gender: string | null;
  status: string;
  class_name: string;
};

export default function StudentTable({
  students,
}: {
  students: Student[];
}) {
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    const keyword = search.toLowerCase();

    return students.filter((student) => {
      return (
        student.full_name.toLowerCase().includes(keyword) ||
        student.student_no?.toLowerCase().includes(keyword) ||
        student.class_name.toLowerCase().includes(keyword)
      );
    });
  }, [students, search]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">

      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">

        <div>
          <h2 className="font-semibold text-slate-900">
            Student Directory
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {students.length} students registered
          </p>
        </div>

        <div className="relative w-full sm:w-80">

          <Search
            size={17}
            className="absolute left-3 top-3.5 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />

        </div>

      </div>

      {/* MOBILE STUDENT LIST */}
      <div className="divide-y divide-slate-100 md:hidden">
        {filteredStudents.map((student) => (
        <Link
          key={student.id}
          href={`/dashboard/students/${student.id}`}
          className="block px-4 py-4 transition hover:bg-slate-50"
        >
        <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <UserRound size={18} />
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">
              <p className="break-words font-medium leading-snug text-slate-900">
                {student.full_name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {student.student_no ?? "-"}
              </p>
            </div>

            <ChevronRight
              size={17}
              className="mt-1 shrink-0 text-slate-400"
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">

            <div>
              <p className="text-xs text-slate-400">
                Class
              </p>

              <p className="mt-0.5 break-words text-sm text-slate-600">
                {student.class_name}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Gender
              </p>

              <p className="mt-0.5 text-sm capitalize text-slate-600">
                {student.gender ?? "-"}
              </p>
            </div>

          </div>

          <div className="mt-3">
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">
              {student.status}
            </span>
          </div>

        </div>
      </div>
    </Link>
  ))}
</div>

      {/* DESKTOP */}
      <div className="hidden overflow-x-auto md:block">

        <table className="w-full">

          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">

            <tr>
              <th className="px-6 py-4">
                Student
              </th>

              <th className="px-6 py-4">
                Student ID
              </th>

              <th className="px-6 py-4">
                Class
              </th>

              <th className="px-6 py-4">
                Gender
              </th>

              <th className="px-6 py-4">
                Status
              </th>

              <th className="px-6 py-4"></th>
            </tr>

          </thead>


          <tbody className="divide-y divide-slate-100">

            {filteredStudents.map((student) => (

              <tr
                key={student.id}
                className="hover:bg-slate-50"
              >

                <td className="px-6 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                      <UserRound size={18} />
                    </div>

                    <div>
                      <p className="font-medium text-slate-900">
                        {student.full_name}
                      </p>
                    </div>

                  </div>

                </td>


                <td className="px-6 py-4 text-sm text-slate-600">
                  {student.student_no ?? "-"}
                </td>


                <td className="px-6 py-4 text-sm text-slate-600">
                  {student.class_name}
                </td>


                <td className="px-6 py-4 text-sm text-slate-600">
                  {student.gender ?? "-"}
                </td>


                <td className="px-6 py-4">

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">
                    {student.status}
                  </span>

                </td>


                <td className="px-6 py-4">

                  <Link
                    href={`/dashboard/students/${student.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    View
                    <ChevronRight size={15} />
                  </Link>

                </td>

              </tr>

            ))}

          </tbody>

        </table>
    </div>

        {filteredStudents.length === 0 && (

          <div className="py-16 text-center text-sm text-slate-500">
            No students found.
          </div>

        )}

      

    </div>
  );
}