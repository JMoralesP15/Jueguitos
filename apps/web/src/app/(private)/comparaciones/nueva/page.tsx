import Link from "next/link";

import { createComparisonAction } from "./actions";
import { ComparisonForm } from "./comparison-form";

export default function NewComparisonPage() {
  return (
    <main className="auth-page">
      <Link className="back-link" href="/comparaciones">
        ← Volver a mis comparaciones
      </Link>
      <ComparisonForm action={createComparisonAction} />
    </main>
  );
}
