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

  if (error) {
    await supabase.rpc("record_auth_event", {
      p_error_code: "code" in error ? error.code : undefined,
      p_event_name: "magic_link_confirmation_failed",
      p_outcome: "error",
    });
    redirect("/ingresar?error=confirmacion");
  }

  await supabase.rpc("record_auth_event", {
    p_event_name: "magic_link_confirmed",
    p_outcome: "success",
  });
  redirect(nextPath);
}
