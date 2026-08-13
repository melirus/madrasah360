import AddTeacherForm from "@/components/AddTeacherForm";

export default function NewTeacherPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Add Teacher
        </h1>

        <p className="mt-2 text-slate-500">
          Register a new teacher profile.
        </p>
      </div>

      <AddTeacherForm />
    </div>
  );
}