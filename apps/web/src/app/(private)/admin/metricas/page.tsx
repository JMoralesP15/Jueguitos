import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type ProductEvent = {
  created_at: string;
  event_name: "duel_viewed" | "ranking_viewed" | "vote_cast";
  viewer_id: string;
};

function utcDay(timestamp: string) {
  return timestamp.slice(0, 10);
}

export default async function MetricsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar?origen=admin-metricas");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/cuenta");

  const { data, error } = await supabase
    .from("product_events")
    .select("created_at, event_name, viewer_id")
    .order("created_at", { ascending: false });
  const events = (data ?? []) as ProductEvent[];
  const count = (name: ProductEvent["event_name"]) => events.filter((event) => event.event_name === name).length;
  const duelViews = count("duel_viewed");
  const voteCasts = count("vote_cast");
  const playerDays = new Map<string, Set<string>>();
  for (const event of events) {
    if (event.event_name !== "duel_viewed") continue;
    const days = playerDays.get(event.viewer_id) ?? new Set<string>();
    days.add(utcDay(event.created_at));
    playerDays.set(event.viewer_id, days);
  }
  const uniquePlayers = playerDays.size;
  const returningPlayers = [...playerDays.values()].filter((days) => days.size > 1).length;
  const completion = duelViews ? Math.round((voteCasts / duelViews) * 100) : 0;
  const votesPerPlayer = uniquePlayers ? (voteCasts / uniquePlayers).toFixed(1) : "0";
  const returnRate = uniquePlayers ? Math.round((returningPlayers / uniquePlayers) * 100) : 0;

  return (
    <main className="admin-page">
      <section className="dashboard-heading">
        <p className="eyebrow">Administración · Prueba cerrada</p>
        <h1>Métricas del juego</h1>
        <p className="lede">Conteos agregados de la cohorte. No muestran votos individuales ni datos personales.</p>
        <div className="hero-actions"><Link className="button button-secondary" href="/admin/aportes">Revisar locales</Link></div>
      </section>

      {error ? <p className="form-message" role="alert">No pudimos cargar las métricas todavía.</p> : (
        <section aria-label="Métricas de la prueba" className="review-list">
          <article><p className="comparison-status">Jugadores</p><h2>{uniquePlayers}</h2><p>Personas que vieron al menos un duelo.</p></article>
          <article><p className="comparison-status">Duelos vistos</p><h2>{duelViews}</h2><p>Primera vista de cada duelo creado.</p></article>
          <article><p className="comparison-status">Votos emitidos</p><h2>{voteCasts}</h2><p>{votesPerPlayer} votos por jugador.</p></article>
          <article><p className="comparison-status">Finalización</p><h2>{completion}%</h2><p>Duelos vistos que terminaron en voto.</p></article>
          <article><p className="comparison-status">Ranking visto</p><h2>{count("ranking_viewed")}</h2><p>Visitas registradas al ranking público.</p></article>
          <article><p className="comparison-status">Retorno</p><h2>{returnRate}%</h2><p>{returningPlayers} jugadores volvieron en un día distinto.</p></article>
        </section>
      )}
    </main>
  );
}
