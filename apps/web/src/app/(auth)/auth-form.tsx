"use client";

import { useActionState } from "react";

import {
  initialAuthActionState,
  type AuthFormAction,
} from "@/lib/auth/form-state";

type AuthFormProps = {
  action: AuthFormAction;
  nextPath?: string;
};

export function AuthForm({ action, nextPath = "/jugar" }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialAuthActionState);

  return (
    <form action={formAction} className="auth-form" noValidate>
      <input name="next" type="hidden" value={nextPath} />
      <div className="form-heading">
        <p className="eyebrow">Community Manager</p>
        <h1>Entrar a jugar</h1>
        <p className="lede">
          Escribe tu correo y te enviaremos un enlace seguro. No necesitas crear una contraseña.
        </p>
      </div>

      {state.message ? (
        <p className="form-message" role={state.success ? "status" : "alert"}>
          {state.message}
        </p>
      ) : null}

      <div className="field-group">
        <label htmlFor="email">Correo electrónico</label>
        <input
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          autoComplete="email"
          id="email"
          name="email"
          required
          type="email"
        />
        {state.fieldErrors?.email ? (
          <p className="field-error" id="email-error">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <button className="button" disabled={isPending} type="submit">
        {isPending ? "Enviando…" : "Enviarme el enlace"}
      </button>
      <p className="form-footer">El mismo enlace crea tu cuenta si es tu primera visita.</p>
    </form>
  );
}
