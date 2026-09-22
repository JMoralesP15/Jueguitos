import Link from "next/link";

import { BusinessImage } from "@/components/business-image";
import { getPublicEnvironment } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

import { RankingViewTracker } from "./ranking-view-tracker";

type RankingItem = {
  city: string;
  duel_count: number;
  image_url: string;
  item_id: string;
  name: string;
  rank_position: number;
  rating: number;
  win_rate: number;
};

export default async function RankingPage() {
  const environment = getPublicEnvironment();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_ranking");
  const ranking = (data ?? []) as RankingItem[];

  return (
    <main>
      <RankingViewTracker environment={environment} />
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
              <li className={item.rank_position <= 3 ? "is-podium" : undefined} key={item.item_id}>
                <span className="ranking-position" aria-label={`Posición ${item.rank_position}`}>
                  {item.rank_position === 1 ? "🥇" : item.rank_position === 2 ? "🥈" : item.rank_position === 3 ? "🥉" : `#${item.rank_position}`}
                </span>
                <BusinessImage
                  alt={`Foto de ${item.name}`}
                  className="ranking-image"
                  name={item.name}
                  priority={item.rank_position <= 3}
                  sizes="64px"
                  src={item.image_url}
                />
                <div className="ranking-copy">
                  <h3>{item.name}</h3>
                  <p>{item.city}</p>
                  <strong>Gana el {Math.round(item.win_rate)}% de sus duelos</strong>
                  <p className="ranking-sample">
                    Basado en {item.duel_count} {item.duel_count === 1 ? "duelo" : "duelos"}
                  </p>
                  <details>
                    <summary>Ver detalle</summary>
                    <p>{Math.round(item.rating)} Elo</p>
                  </details>
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
