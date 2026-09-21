"use server";

import { magicLinkCredentialsSchema, registerCredentialsSchema, signInCredentialsSchema } from "@mvp/domain";
import { headers } from "next/headers";
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

export async function sendMagicLinkAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = magicLinkCredentialsSchema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") || "/jugar",
  });

  if (!credentials.success) {
    return validationState(credentials.error);
  }

  const origin = (await headers()).get("origin");
  if (!origin) {
    return { message: "No pudimos preparar el enlace. Inténtalo nuevamente." };
  }

  const supabase = await createClient();
  const callback = new URL("/auth/confirm", origin);
  callback.searchParams.set("next", credentials.data.next);
  const { error } = await supabase.auth.signInWithOtp({
    email: credentials.data.email,
    options: {
      emailRedirectTo: callback.toString(),
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { message: "No pudimos enviar el enlace. Espera un momento e inténtalo nuevamente." };
  }

  return {
    message: "Revisa tu correo. El enlace te llevará directamente al juego.",
    success: true,
  };
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = typeof formData.get("email") === "string" ? String(formData.get("email")).trim() : "";

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { fieldErrors: { email: "Ingresa un correo válido." } };
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  if (origin) {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/confirm?next=/actualizar-contrasena`,
    });
  }

  // La misma respuesta protege contra la enumeración de cuentas.
  return { message: "Si existe una cuenta asociada, te enviamos un enlace para restablecer la contraseña." };
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = formData.get("password");
  const passwordConfirmation = formData.get("passwordConfirmation");
  const { passwordSchema } = await import("@mvp/domain");
  const validation = passwordSchema.safeParse(password);

  if (!validation.success) {
    return { fieldErrors: { password: validation.error.issues[0]?.message ?? "La contraseña no es válida." } };
  }
  if (password !== passwordConfirmation) {
    return { fieldErrors: { password: "Las contraseñas no coinciden." } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { message: "El enlace venció o no es válido. Solicita uno nuevo." };
  }

  const { error } = await supabase.auth.updateUser({ password: validation.data });
  if (error) return { message: "No pudimos actualizar la contraseña. Solicita un nuevo enlace." };

  redirect("/ingresar?recuperacion=ok");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
