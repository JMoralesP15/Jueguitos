"use server";

import { profileDisplayNameSchema } from "@mvp/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = {
  message?: string;
  success?: boolean;
};

export async function updateDisplayNameAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const displayName = profileDisplayNameSchema.safeParse(formData.get("display_name"));

  if (!displayName.success) {
    return { message: "Usa entre 2 y 32 caracteres para el nombre visible." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/ingresar?origen=cuenta");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: displayName.data })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: "No pudimos guardar el nombre. Inténtalo nuevamente." };
  }

  revalidatePath("/cuenta");
  revalidatePath("/jugar");
  return { message: "Nombre guardado. Solo se muestra dentro de tu cuenta.", success: true };
}
