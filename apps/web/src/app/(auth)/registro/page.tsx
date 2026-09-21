import Link from "next/link";

import { AuthForm } from "../auth-form";
import { sendMagicLinkAction } from "../actions";

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <Link className="back-link" href="/">
        ← Volver al inicio
      </Link>
      <AuthForm action={sendMagicLinkAction} />
    </main>
  );
}
