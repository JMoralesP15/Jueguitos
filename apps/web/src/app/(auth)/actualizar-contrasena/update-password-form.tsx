"use client";

import { useActionState } from "react";

import { initialAuthActionState, type AuthFormAction } from "@/lib/auth/form-state";

export function UpdatePasswordForm({ action }: { action: AuthFormAction }) {
  const [state, formAction, isPending] = useActionState(action, initialAuthActionState);
  return <form action={formAction} className="auth-form" noValidate>
    <div className="form-heading"><p className="eyebrow">Nueva contraseña</p><h1>Elige una clave nueva.</h1><p className="lede">Usa al menos 10 caracteres y no la reutilices fuera de esta aplicación.</p></div>
    {state.message ? <p className="form-message" role="alert">{state.message}</p> : null}
    <div className="field-group"><label htmlFor="password">Nueva contraseña</label><input aria-invalid={Boolean(state.fieldErrors?.password)} autoComplete="new-password" id="password" minLength={10} name="password" required type="password" />{state.fieldErrors?.password ? <p className="field-error">{state.fieldErrors.password}</p> : null}</div>
    <div className="field-group"><label htmlFor="passwordConfirmation">Repite la contraseña</label><input autoComplete="new-password" id="passwordConfirmation" minLength={10} name="passwordConfirmation" required type="password" /></div>
    <button className="button" disabled={isPending} type="submit">{isPending ? "Actualizando…" : "Guardar nueva contraseña"}</button>
  </form>;
}
