import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { RankingViewTracker } from "./ranking-view-tracker";

type RankingItem = {
  city: string;
  duel_count: number;
  image_url: string;
  name: string;
  rank_position: number;
  rating: number;
  win_rate: number;
};

export default async function RankingPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_ranking");
  const ranking = (data ?? []) as RankingItem[];

  return (
    <main>
      <RankingViewTracker />
      <section className="dashboard-heading" aria-labelledby="ranking-title">
        <p className="eyebrow">Ranking público</p>
        <h1 id="ranking-title">Los nombres favoritos</h1>
        <p className="lede">El ranking se actualiza con cada duelo resuelto.</p>
        <div className="hero-actions">
          <Link className="button" href="/jugar">Jugar ahora</Link>
          <Link className="button button-secondary" href="/">Inicio</Link>
        </div>
      </section>

      <section aria-labelledby="ranking-list-title">
        <h2 id="ranking-list-title">Posiciones</h2>
        {error ? (
          <p className="form-message" role="alert">No pudimos cargar el ranking todavía.</p>
        ) : ranking.length ? (
          <ol className="ranking-list">
            {ranking.map((item) => (
              <li key={item.rank_position}>
                <span className="ranking-position">#{item.rank_position}</span>
                <img alt="" className="ranking-image" src={item.image_url} />
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.city} · {item.rating} Elo · {item.duel_count} duelos · {item.win_rate}% victorias</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty-state">El ranking aparecerá cuando carguemos el catálogo inicial de locales.</p>
        )}
      </section>
    </main>
  );
}
