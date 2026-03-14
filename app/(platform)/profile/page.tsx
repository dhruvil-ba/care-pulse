import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Signed-in account details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-200">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">User ID</span>
          <div className="mt-1 text-slate-100">{data.user.id}</div>
        </div>
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</span>
          <div className="mt-1 text-slate-100">{data.user.email}</div>
        </div>
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Full name</span>
          <div className="mt-1 text-slate-100">{(data.user.user_metadata?.full_name as string) ?? "-"}</div>
        </div>
      </CardContent>
    </Card>
  );
}
