import Link from "next/link";

import { AuthForm } from "../auth-form";
import { signInAction } from "../actions";

type SignInPageProps = {
  searchParams: Promise<{ error?: string; origen?: string; registro?: string; recuperacion?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error, origen, registro, recuperacion } = await searchParams;

  return (
    <main className="auth-page">
      <Link className="back-link" href="/">
        ← Volver al inicio
      </Link>
      {registro === "confirmar" ? (
        <p className="notice" role="status">
          Revisa tu correo para confirmar la cuenta antes de ingresar.
        </p>
      ) : null}
      {origen === "cuenta" ? (
        <p className="notice" role="status">
          Ingresa para acceder a tu área privada.
        </p>
      ) : null}
      {error === "confirmacion" ? (
        <p className="notice" role="status">
          El enlace de confirmación no es válido o ya venció. Puedes intentar ingresar o crear la
          cuenta nuevamente.
        </p>
      ) : null}
      {recuperacion === "ok" ? <p className="notice" role="status">Tu contraseña fue actualizada. Ya puedes ingresar.</p> : null}
      <AuthForm action={signInAction} mode="sign-in" />
    </main>
  );
}
