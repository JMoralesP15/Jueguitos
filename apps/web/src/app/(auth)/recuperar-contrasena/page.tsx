import Link from "next/link";

import { requestPasswordResetAction } from "../actions";
import { PasswordResetRequestForm } from "./reset-request-form";

export default function PasswordResetPage() {
  return (
    <main className="auth-page">
      <Link className="back-link" href="/ingresar">← Volver a ingresar</Link>
      <PasswordResetRequestForm action={requestPasswordResetAction} />
    </main>
  );
}
