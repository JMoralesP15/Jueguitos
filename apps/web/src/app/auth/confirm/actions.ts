"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/jugar";
}

export async function confirmMagicLinkAction(formData: FormData) {
  const tokenHash = formData.get("token_hash");
  const code = formData.get("code");
  const nextPath = safeNextPath(formData.get("next"));
  const supabase = await createClient();

  const { error } = typeof tokenHash === "string" && tokenHash.length > 0
    ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" })
    : typeof code === "string" && code.length > 0
      ? await supabase.auth.exchangeCodeForSession(code)
      : { error: new Error("Missing authentication token") };

  if (error) redirect("/ingresar?error=confirmacion");
  redirect(nextPath);
}
