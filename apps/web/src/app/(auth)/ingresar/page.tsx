import Link from "next/link";

import { AuthForm } from "../auth-form";
import { sendMagicLinkAction } from "../actions";

type SignInPageProps = {
  searchParams: Promise<{ error?: string; next?: string; origen?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error, next, origen } = await searchParams;
  const nextPath = next?.startsWith("/") && !next.startsWith("//") ? next : "/jugar";

  return (
    <main className="auth-page">
      <Link className="back-link" href="/">
        ← Volver al inicio
      </Link>
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
      <AuthForm action={sendMagicLinkAction} nextPath={nextPath} />
    </main>
  );
}
