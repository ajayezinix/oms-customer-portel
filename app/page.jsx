import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const session = data?.session ?? null;

  if (session) redirect("/dashboard");
  redirect("/login");
}
