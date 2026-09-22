import Link from "next/link";

import { BusinessImage } from "@/components/business-image";
import { createClient } from "@/lib/supabase/server";

type FeaturedItem = {
  category: string;
  city: string;
  id: string;
  image_url: string;
  name: string;
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("items")
    .select("id, name, category, city, image_url", { count: "exact" })
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(2);
  const featuredItems = (data ?? []) as FeaturedItem[];

  return (
    <main className="home-page">
      <section className="hero home-hero" aria-labelledby="page-title">
        <div className="home-hero-copy">
          <p className="eyebrow">El juego de los locales · Santiago</p>
          <h1 id="page-title">¿Qué nombre te dan ganas de conocer?</h1>
          <p className="lede">
            Elige entre dos locales reales. Tu voto ayuda a descubrir los nombres favoritos de Santiago.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/jugar">Jugar ahora</Link>
            <Link className="button button-secondary" href="/ranking">Ver el ranking</Link>
          </div>
          <p className="home-proof">
            <span aria-hidden="true">✦</span>{" "}
            {count === null ? "Fichas reales de Santiago" : `${count} locales aprobados en la prueba`}
          </p>
        </div>

        {error ? (
          <div className="home-preview home-preview-empty" role="status">
            <p className="eyebrow">No pudimos cargar las fichas</p>
            <p>Inténtalo de nuevo en un momento o explora el ranking público.</p>
            <Link className="text-link" href="/ranking">Abrir el ranking</Link>
          </div>
        ) : featuredItems.length === 2 ? (
          <div className="home-preview" aria-label="Ejemplos de locales que puedes descubrir">
            <div className="home-preview-heading">
              <span className="home-preview-kicker">Fichas reales</span>
              <span className="home-preview-count">
                {count === null ? "En juego" : `${count} en juego`}
              </span>
            </div>
            <div className="home-preview-grid">
              {featuredItems.map((item, index) => (
                <article className={`home-preview-card home-preview-card-${index + 1}`} key={item.id}>
                  <BusinessImage
                    alt={`Foto de ${item.name}`}
                    className="home-preview-image"
                    name={item.name}
                    priority
                    sizes="(max-width: 800px) 46vw, 260px"
                    src={item.image_url}
                  />
                  <div className="home-preview-copy">
                    <span className="category-chip">{item.category}</span>
                    <h2>{item.name}</h2>
                    <p>{item.city}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="home-preview-caption">Dos nombres. Una elección. El ranking cambia con cada voto.</p>
          </div>
        ) : (
          <div className="home-preview home-preview-empty">
            <p className="eyebrow">Estamos preparando la próxima ronda</p>
            <p>Pronto podrás elegir entre nuevos locales reales de Santiago.</p>
            <Link className="text-link" href="/ingresar?next=/aportes/nuevo">Ayudar a sumar locales</Link>
          </div>
        )}
      </section>

      <section aria-labelledby="how-title" className="home-how">
        <p className="eyebrow">Así de simple</p>
        <h2 id="how-title">Mira. Elige. Descubre el resultado.</h2>
        <div className="home-steps">
          <article className="home-step-card home-step-card-discover">
            <div className="home-step-art" aria-hidden="true">
              <svg viewBox="0 0 96 80" fill="none"><path d="M18 59c0-16 13-29 29-29s29 13 29 29v8H18v-8Z" fill="currentColor" opacity=".16"/><path d="M28 56c0-10 8-19 19-19s19 9 19 19v8H28v-8Z" fill="currentColor" opacity=".26"/><circle cx="48" cy="29" r="15" fill="white"/><path d="M59 40 76 57" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/><circle cx="48" cy="29" r="10" stroke="currentColor" strokeWidth="4"/><path d="M43 29h10M48 24v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
              <span>01</span>
            </div>
            <div className="home-step-copy"><h3>Conoce los locales</h3><p>Fotos, rubros y comunas para descubrirlos de verdad.</p></div>
          </article>
          <article className="home-step-card home-step-card-vote">
            <div className="home-step-art" aria-hidden="true">
              <svg viewBox="0 0 96 80" fill="none"><path d="M48 8 54 25l18 1-14 11 5 18-15-10-15 10 5-18-14-11 18-1 6-17Z" fill="currentColor" opacity=".2"/><path d="m48 15 5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1 5-12Z" fill="currentColor"/><path d="m32 61 10 7 6-5 6 5 10-7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M28 55h40" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
              <span>02</span>
            </div>
            <div className="home-step-copy"><h3>Elige tu favorito</h3><p>Un toque basta para votar por el nombre que te conquista.</p></div>
          </article>
          <article className="home-step-card home-step-card-results">
            <div className="home-step-art" aria-hidden="true">
              <svg viewBox="0 0 96 80" fill="none"><path d="M17 60h62" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/><path d="M25 58V43h13v15M43 58V30h13v28M61 58V19h13v39" fill="currentColor" opacity=".25"/><path d="M25 43h13v15H25zM43 30h13v28H43zM61 19h13v39H61z" stroke="currentColor" strokeWidth="3"/><path d="m24 33 18-9 12 2 17-14" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M64 12h8v8" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>03</span>
            </div>
            <div className="home-step-copy"><h3>Descubre la tendencia</h3><p>Mira cómo cambia el ranking y sigue con otro duelo.</p></div>
          </article>
        </div>
        <div className="home-contribute">
          <p>¿Conoces un local con un nombre inolvidable?</p>
          <Link className="text-link" href="/ingresar?next=/aportes/nuevo">Aporta un local real</Link>
        </div>
      </section>
    </main>
  );
}
