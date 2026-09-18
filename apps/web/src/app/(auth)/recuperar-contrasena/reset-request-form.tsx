"use client";

import { useActionState } from "react";

import { initialAuthActionState, type AuthFormAction } from "@/lib/auth/form-state";

export function PasswordResetRequestForm({ action }: { action: AuthFormAction }) {
  const [state, formAction, isPending] = useActionState(action, initialAuthActionState);
  return <form action={formAction} className="auth-form" noValidate>
    <div className="form-heading"><p className="eyebrow">Recuperar acceso</p><h1>Volvamos a entrar.</h1><p className="lede">Escribe tu correo y, si hay una cuenta asociada, recibirás un enlace seguro.</p></div>
    {state.message ? <p className="notice" role="status">{state.message}</p> : null}
    <div className="field-group"><label htmlFor="email">Correo electrónico</label><input aria-invalid={Boolean(state.fieldErrors?.email)} autoComplete="email" id="email" name="email" required type="email" />{state.fieldErrors?.email ? <p className="field-error">{state.fieldErrors.email}</p> : null}</div>
    <button className="button" disabled={isPending} type="submit">{isPending ? "Enviando…" : "Enviar enlace"}</button>
  </form>;
}
