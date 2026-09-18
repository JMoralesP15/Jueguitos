import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type ComparisonsPageProps = {
  searchParams: Promise<{ creada?: string }>;
};

export default async function ComparisonsPage({ searchParams }: ComparisonsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/ingresar?origen=comparaciones");
  }

  const [{ creada }, { data: comparisons, error: comparisonsError }] = await Promise.all([
    searchParams,
    supabase.from("comparisons").select("id, title, description, status, created_at").order("created_at", { ascending: false }),
  ]);

  return (
    <main>
      <section className="dashboard-heading" aria-labelledby="comparisons-title">
        <p className="eyebrow">Área protegida · MVP-002</p>
        <h1 id="comparisons-title">Mis comparaciones</h1>
        <p className="lede">Crea una pregunta con dos alternativas. Por ahora, cada una queda como borrador privado.</p>
        <div className="hero-actions">
          <Link className="button" href="/comparaciones/nueva">Crear comparación</Link>
          <Link className="button button-secondary" href="/cuenta">Volver a mi cuenta</Link>
        </div>
      </section>

      {creada === "1" ? <p className="notice" role="status">Borrador creado. La publicación y el voto se incorporan a continuación.</p> : null}

      <section aria-labelledby="drafts-title">
        <h2 id="drafts-title">Borradores</h2>
        {comparisonsError ? (
          <p className="form-message" role="alert">No pudimos cargar tus comparaciones. Vuelve a intentarlo.</p>
        ) : comparisons?.length ? (
          <ul className="comparison-list">
            {comparisons.map((comparison) => (
              <li key={comparison.id}>
                <p className="comparison-status">{comparison.status === "draft" ? "Borrador" : comparison.status}</p>
                <h3>{comparison.title}</h3>
                {comparison.description ? <p>{comparison.description}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">Todavía no tienes comparaciones. Crea la primera para probar el nuevo flujo.</p>
        )}
      </section>
    </main>
  );
}
