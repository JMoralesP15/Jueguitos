import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { SubmissionDraftCleanup } from "./submission-draft-cleanup";

type ContributionsPageProps = { searchParams: Promise<{ enviado?: string }> };

function statusLabel(status: string) {
  if (status === "active") return "Publicado";
  if (status === "hidden") return "No publicado";
  return "En revisión";
}

export default async function ContributionsPage({ searchParams }: ContributionsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/ingresar?origen=aportes");

  const [{ enviado }, { data: submissions }] = await Promise.all([
    searchParams,
    supabase
      .from("items")
      .select("id, name, category, city, status, created_at")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <main>
      <section className="dashboard-heading">
        <p className="eyebrow">Área protegida · MVP-004</p>
        <h1>Mis aportes</h1>
        <p className="lede">Aquí puedes enviar nombres reales de locales con una foto propia. Revisaremos cada aporte antes de publicarlo.</p>
        <div className="hero-actions"><Link className="button" href="/aportes/nuevo">Agregar un local</Link><Link className="button button-secondary" href="/cuenta">Mi cuenta</Link></div>
      </section>

      {enviado === "1" ? (
        <section aria-live="polite" className="submission-success-card">
          <div aria-hidden="true" className="submission-success-mark">🎉</div>
          <div>
            <p className="eyebrow">¡Aporte recibido!</p>
            <h2>Tu hallazgo ya está ayudando a que crezca Santiago.</h2>
            <p>Quedó en revisión humana. Cuando se apruebe, aparecerá en los duelos para que otras personas lo descubran.</p>
            <div className="submission-success-meta">
              <span>✦ {submissions?.length ?? 1} aporte{(submissions?.length ?? 1) === 1 ? "" : "s"} enviado{(submissions?.length ?? 1) === 1 ? "" : "s"}</span>
              <span>🔒 Foto privada hasta la aprobación</span>
            </div>
            <div className="hero-actions">
              <Link className="button" href="/jugar">Ir a jugar</Link>
              <Link className="button button-secondary" href="/aportes/nuevo">Aportar otro local</Link>
            </div>
          </div>
          <SubmissionDraftCleanup />
        </section>
      ) : null}

      <section aria-labelledby="submission-list-title">
        <h2 id="submission-list-title">Estado de los aportes</h2>
        {submissions?.length ? (
          <ul className="submission-list">
            {submissions.map((submission) => (
              <li key={submission.id}>
                <p className="comparison-status">{statusLabel(submission.status)}</p>
                <h3>{submission.name}</h3>
                <p>{submission.category} · {submission.city}</p>
                <p className="submission-photo">Foto privada recibida</p>
              </li>
            ))}
          </ul>
        ) : <p className="empty-state">Aún no has enviado locales para revisión.</p>}
      </section>
    </main>
  );
}
