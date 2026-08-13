import LogoutButton from "@/components/LogoutButton";

type TopbarProps = {
  fullName: string;
  role: string;
  organizationName: string;
};

function formatRole(role: string) {
  switch (role) {
    case "super_admin":
      return "Super Admin";

    case "school_admin":
      return "School Admin";

    case "finance":
      return "Finance";

    case "teacher":
      return "Teacher";

    case "parent":
      return "Parent";

    default:
      return role;
  }
}

export default function Topbar({
  fullName,
  role,
  organizationName,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="flex h-20 items-center justify-between px-8">

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Organization
          </p>

          <h2 className="text-lg font-semibold text-slate-900">
            {organizationName}
          </h2>
        </div>


        <div className="flex items-center gap-5">

          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">
              {fullName}
            </p>

            <p className="text-xs text-slate-500">
              {formatRole(role)}
            </p>
          </div>


          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
            {fullName.charAt(0).toUpperCase()}
          </div>


          <LogoutButton />

        </div>

      </div>
    </header>
  );
}