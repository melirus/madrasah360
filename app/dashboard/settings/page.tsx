import { createClient } from "@/lib/supabase/server";

import OrganizationSettingsForm
  from "@/components/OrganizationSettingsForm";

import AcademicYearSettings
  from "@/components/AcademicYearSettings";

import FeeCategorySettings
  from "@/components/FeeCategorySettings";

import HafazanTypeSettings
  from "@/components/HafazanTypeSettings";


export default async function SettingsPage() {

  const supabase =
    await createClient();


  const {
    data: { user },
  } = await supabase.auth.getUser();


  if (!user) {
    return (
      <p className="text-red-600">
        Not authenticated.
      </p>
    );
  }


  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select(`
      organization_id
    `)
    .eq("id", user.id)
    .single();


  if (!profile?.organization_id) {
    return (
      <p className="text-red-600">
        Organization not found.
      </p>
    );
  }


  const organizationId =
    profile.organization_id;


  const [
    organizationResult,
    yearsResult,
    categoriesResult,
    hafazanResult,
  ] = await Promise.all([

    supabase
      .from("organizations")
      .select(`
        id,
        name,
        short_name,
        slug,
        phone,
        email,
        website,
        address_line1,
        address_line2,
        postcode,
        city,
        state
      `)
      .eq(
        "id",
        organizationId
      )
      .single(),

    supabase
      .from("academic_years")
      .select(`
        id,
        name,
        start_date,
        end_date,
        is_current
      `)
      .order(
        "start_date",
        {
          ascending: false,
        }
      ),

    supabase
      .from("fee_categories")
      .select(`
        id,
        name,
        is_active
      `)
      .order("name"),

    supabase
      .from("hafazan_types")
      .select(`
        id,
        code,
        name,
        term,
        minimum_quantity,
        minimum_unit,
        sort_order,
        is_active
      `)
      .order("sort_order"),

  ]);


  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Settings
        </h1>

        <p className="mt-2 text-slate-500">
          Configure madrasah information and system settings.
        </p>
      </div>


      {organizationResult.data && (

        <OrganizationSettingsForm
          organization={
            organizationResult.data
          }
        />

      )}


      <AcademicYearSettings
        organizationId={
          organizationId
        }
        years={
          yearsResult.data ?? []
        }
      />


      <FeeCategorySettings
        organizationId={
          organizationId
        }
        categories={
          categoriesResult.data ?? []
        }
      />


      <HafazanTypeSettings
        types={
          hafazanResult.data ?? []
        }
      />

    </div>
  );
}