import Link from "next/link";

import { createBusinessSubmissionAction } from "./actions";
import { SubmissionForm } from "./submission-form";

export default function NewSubmissionPage() {
  return (
    <main className="auth-page">
      <Link className="back-link" href="/aportes">← Volver a mis aportes</Link>
      <SubmissionForm action={createBusinessSubmissionAction} />
    </main>
  );
}
