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
      <div className="flex min-h-20 items-center justify-between gap-3 py-3 pl-16 pr-4 sm:px-6 lg:h-20 lg:px-8 lg:py-0">



        <div className="min-w-0 flex-1">
          <p className="hidden text-xs font-medium uppercase tracking-wide text-slate-400 sm:block">
            Organization
          </p>

            <h2 className="truncate text-sm font-semibold text-slate-900 sm:text-lg">
              {organizationName}
            </h2>

          <p className="mt-0.5 text-xs text-slate-500 lg:hidden">
            Madrasah Management System
          </p>
        </div>


        <div className="flex items-center gap-5">

          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-900">
              {fullName}
            </p>

            <p className="text-xs text-slate-500">
              {formatRole(role)}
            </p>
          </div>


          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 sm:h-10 sm:w-10">
            {fullName.charAt(0).toUpperCase()}
          </div>


          <div className="hidden sm:block">
            <LogoutButton />
          </div>

        </div>

      </div>
    </header>
  );
}