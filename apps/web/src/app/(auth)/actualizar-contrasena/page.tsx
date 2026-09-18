import Link from "next/link";

import { updatePasswordAction } from "../actions";
import { UpdatePasswordForm } from "./update-password-form";

export default function UpdatePasswordPage() {
  return <main className="auth-page"><Link className="back-link" href="/ingresar">← Volver a ingresar</Link><UpdatePasswordForm action={updatePasswordAction} /></main>;
}
