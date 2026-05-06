import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH === "true") {
    redirect("/dashboard");
  }

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) redirect("/dashboard");
  redirect("/login");
}
