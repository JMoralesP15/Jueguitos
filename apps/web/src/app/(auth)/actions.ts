"use server";

import { registerCredentialsSchema, signInCredentialsSchema } from "@mvp/domain";
import { redirect } from "next/navigation";
import type { z } from "zod";

import type { AuthActionState } from "@/lib/auth/form-state";
import { createClient } from "@/lib/supabase/server";

function validationState(error: z.ZodError): AuthActionState {
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (
      (field === "email" || field === "username" || field === "password") &&
      !fieldErrors[field]
    ) {
      fieldErrors[field] = issue.message;
    }
  }

  return {
    fieldErrors,
    message: "Revisa los campos marcados antes de continuar.",
  };
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = registerCredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
  });

  if (!credentials.success) {
    return validationState(credentials.error);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: credentials.data.email,
    password: credentials.data.password,
    options: {
      data: { username: credentials.data.username },
    },
  });

  if (error) {
    return {
      message: "No pudimos crear la cuenta. Revisa los datos o prueba otro nombre de usuario.",
    };
  }

  if (data.session) {
    redirect("/cuenta");
  }

  redirect("/ingresar?registro=confirmar");
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = signInCredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!credentials.success) {
    return validationState(credentials.error);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials.data);

  if (error) {
    return { message: "Correo o contraseña incorrectos." };
  }

  redirect("/cuenta");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
