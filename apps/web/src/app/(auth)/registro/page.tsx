import Link from "next/link";

import { AuthForm } from "../auth-form";
import { registerAction } from "../actions";

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <Link className="back-link" href="/">
        ← Volver al inicio
      </Link>
      <AuthForm action={registerAction} mode="register" />
    </main>
  );
}
