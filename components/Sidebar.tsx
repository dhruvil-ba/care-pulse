import { createSupabaseServerClient } from "@/lib/supabase-server";
import { SidebarClient } from "@/components/sidebar-client";

export async function Sidebar() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  let role: "provider" | "patient" | null = null;

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    role = (profile?.role as "provider" | "patient" | null) ?? null;
  }

  return <SidebarClient role={role} />;
}
