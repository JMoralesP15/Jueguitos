"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

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
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (!state.sentAt) return;

    let interval = 0;

    function updateCountdown() {
      const elapsedSeconds = Math.floor((Date.now() - (state.sentAt ?? 0)) / 1000);
      const nextValue = Math.max(0, 60 - elapsedSeconds);
      setSecondsRemaining(nextValue);
      if (nextValue === 0) window.clearInterval(interval);
    }

    interval = window.setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => window.clearInterval(interval);
  }, [state.sentAt]);

  if (state.success && state.email) {
    return (
      <section className="auth-success" aria-labelledby="email-sent-title">
        <div className="mail-icon" aria-hidden="true">✉</div>
        <p className="eyebrow">Enlace enviado</p>
        <h1 id="email-sent-title">Revisa tu correo</h1>
        <p className="lede">Enviamos el acceso a <strong>{state.email}</strong>. El enlace te llevará directamente al juego.</p>
        <p className="field-help">
          Abre el enlace más reciente en este mismo navegador. Si no aparece en unos minutos, revisa
          spam; los enlaces anteriores dejan de ser válidos por seguridad.
        </p>
        <form action={formAction}>
          <input name="email" type="hidden" value={state.email} />
          <input name="next" type="hidden" value={nextPath} />
          <button className="button button-secondary" disabled={isPending || secondsRemaining > 0} type="submit">
            {isPending
              ? "Reenviando…"
              : secondsRemaining > 0
                ? `Reenviar en ${secondsRemaining}s`
                : "Reenviar enlace"}
          </button>
        </form>
        <Link className="text-link" href={`/ingresar?next=${encodeURIComponent(nextPath)}`}>Usar otro correo</Link>
      </section>
    );
  }

  return (
    <form action={formAction} className="auth-form" noValidate>
      <input name="next" type="hidden" value={nextPath} />
      <div className="form-heading">
        <p className="eyebrow">El juego de los locales</p>
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
