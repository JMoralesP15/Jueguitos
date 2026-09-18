"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  initialAuthActionState,
  type AuthFormAction,
} from "@/lib/auth/form-state";

type AuthFormProps = {
  action: AuthFormAction;
  mode: "register" | "sign-in";
};

export function AuthForm({ action, mode }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialAuthActionState);
  const isRegistration = mode === "register";
  const title = isRegistration ? "Crear cuenta" : "Ingresar";

  return (
    <form action={formAction} className="auth-form" noValidate>
      <div className="form-heading">
        <p className="eyebrow">Community Manager</p>
        <h1>{title}</h1>
        <p className="lede">
          {isRegistration
            ? "Crea tu identidad con un correo privado y un nombre que verá la comunidad."
            : "Ingresa con el correo y la contraseña de tu cuenta."}
        </p>
      </div>

      {state.message ? (
        <p className="form-message" role="alert">
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

      {isRegistration ? (
        <div className="field-group">
          <label htmlFor="username">Nombre de usuario</label>
          <input
            aria-describedby={state.fieldErrors?.username ? "username-error" : "username-help"}
            aria-invalid={Boolean(state.fieldErrors?.username)}
            autoCapitalize="none"
            autoComplete="username"
            id="username"
            maxLength={24}
            minLength={3}
            name="username"
            pattern="[a-z0-9_]+"
            required
          />
          <p className="field-help" id="username-help">
            Entre 3 y 24 caracteres: minúsculas, números o guion bajo.
          </p>
          {state.fieldErrors?.username ? (
            <p className="field-error" id="username-error">
              {state.fieldErrors.username}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="field-group">
        <label htmlFor="password">Contraseña</label>
        <input
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          autoComplete={isRegistration ? "new-password" : "current-password"}
          id="password"
          maxLength={128}
          minLength={isRegistration ? 10 : undefined}
          name="password"
          required
          type="password"
        />
        {state.fieldErrors?.password ? (
          <p className="field-error" id="password-error">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      <button className="button" disabled={isPending} type="submit">
        {isPending ? "Un momento…" : isRegistration ? "Crear cuenta" : "Ingresar"}
      </button>

      <p className="form-footer">
        {isRegistration ? "¿Ya tienes una cuenta?" : "¿Aún no tienes cuenta?"}{" "}
        <Link href={isRegistration ? "/ingresar" : "/registro"}>
          {isRegistration ? "Ingresa aquí" : "Crea una cuenta"}
        </Link>
      </p>
    </form>
  );
}
