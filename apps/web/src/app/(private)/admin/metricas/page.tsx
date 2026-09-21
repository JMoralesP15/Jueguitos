import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type ProductEvent = {
  created_at: string;
  event_name: "duel_viewed" | "ranking_viewed" | "vote_cast";
  viewer_id: string;
};

type GameSession = {
  viewer_id: string;
};

function utcDay(timestamp: string) {
  return timestamp.slice(0, 10);
}

type MetricCardProps = {
  description: string;
  label: string;
  target?: string;
  targetMet?: boolean;
  value: string | number;
};

function MetricCard({ description, label, target, targetMet, value }: MetricCardProps) {
  return (
    <article className="metric-card">
      <p className="comparison-status">{label}</p>
      <h2>{value}</h2>
      <p>{description}</p>
      {target ? <p className={`metric-target ${targetMet ? "is-met" : ""}`}>{targetMet ? "Meta alcanzada" : "Meta inicial"}: {target}</p> : null}
    </article>
  );
}

export default async function MetricsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar?origen=admin-metricas");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/cuenta");

  const [eventsQuery, sessionsQuery] = await Promise.all([
    supabase
      .from("product_events")
      .select("created_at, event_name, viewer_id")
      .order("created_at", { ascending: false }),
    supabase.from("game_sessions").select("viewer_id"),
  ]);
  const events = (eventsQuery.data ?? []) as ProductEvent[];
  const sessions = (sessionsQuery.data ?? []) as GameSession[];
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
  const votesPerPlayerNumber = Number(votesPerPlayer);
  const returnRate = uniquePlayers ? Math.round((returningPlayers / uniquePlayers) * 100) : 0;
  const playersWithRounds = new Set(sessions.map((session) => session.viewer_id)).size;
  const additionalRounds = Math.max(0, sessions.length - playersWithRounds);

  return (
    <main className="admin-page">
      <section className="dashboard-heading">
        <p className="eyebrow">Administración · Prueba cerrada</p>
        <h1>Métricas del juego</h1>
        <p className="lede">Conteos agregados de la cohorte. No muestran votos individuales ni datos personales.</p>
        <div className="hero-actions"><Link className="button button-secondary" href="/admin/aportes">Revisar locales</Link></div>
      </section>

      {eventsQuery.error || sessionsQuery.error ? <p className="form-message" role="alert">No pudimos cargar las métricas todavía.</p> : (
        <section aria-label="Métricas de la prueba" className="metrics-grid">
          <MetricCard description="Personas que vieron al menos un duelo." label="Jugadores" value={uniquePlayers} />
          <MetricCard description="Primera vista de cada duelo creado." label="Duelos vistos" value={duelViews} />
          <MetricCard description={`${votesPerPlayer} votos por jugador.`} label="Votos emitidos" target="≥ 5 por jugador" targetMet={votesPerPlayerNumber >= 5} value={voteCasts} />
          <MetricCard description="Duelos vistos que terminaron en voto." label="Finalización" target="≥ 70%" targetMet={completion >= 70} value={`${completion}%`} />
          <MetricCard description="Visitas registradas al ranking público." label="Ranking visto" value={count("ranking_viewed")} />
          <MetricCard description={`${returningPlayers} jugadores volvieron en un día distinto.`} label="Retorno" target="≥ 20%" targetMet={returnRate >= 20} value={`${returnRate}%`} />
          <MetricCard description="Rondas iniciadas después de la primera de cada jugador. Señal exploratoria, todavía sin meta." label="Rondas adicionales" value={additionalRounds} />
        </section>
      )}
    </main>
  );
}
