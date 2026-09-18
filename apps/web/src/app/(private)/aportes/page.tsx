import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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

      {enviado === "1" ? <p className="notice" role="status">Recibimos tu aporte. Quedó en revisión.</p> : null}

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
