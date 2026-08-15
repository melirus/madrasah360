import Link from "next/link";
import PublicApplicationForm from "@/components/PublicApplicationForm";

export default function ApplicationPage() {
  return (
    <main className="min-h-screen bg-slate-100 py-12 px-5">

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-700 text-2xl font-bold text-white">
            M
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Permohonan Kemasukan Pelajar
          </h1>

          <h2 className="text-2xl font-semibold text-slate-700">
            Madrasah MUTQAN
          </h2>

          <p className="mt-2 text-slate-500">
            Sila lengkapkan maklumat berikut untuk membuat permohonan kemasukan.
            Pihak madrasah akan menghubungi tuan/puan selepas permohonan disemak.
          </p>

        </div>

        <PublicApplicationForm />
        <div className="mt-4 flex justify-center">
  <Link
    href="/login"
    className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-600 px-6 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 sm:w-auto"
  >
    Kembali ke halaman utama
  </Link>
</div>

      </div>



    </main>
  );
}