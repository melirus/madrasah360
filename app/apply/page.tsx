import PublicApplicationForm from "@/components/PublicApplicationForm";

export default function ApplicationPage() {
  return (
    <main className="min-h-screen bg-slate-100 py-12 px-5">

      <div className="mx-auto max-w-4xl">

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-700 text-2xl font-bold text-white">
            M
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Permohonan Kemasukan
          </h1>

          <p className="mt-2 text-slate-500">
            Madrasah MUTQAN
          </p>

        </div>

        <PublicApplicationForm />

      </div>

    </main>
  );
}