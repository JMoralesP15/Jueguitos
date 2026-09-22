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
    .limit(3);
  const featuredItems = (data ?? []) as FeaturedItem[];
  const howSteps = [
    { title: "Conoce los locales", description: "Fotos, rubros y comunas para descubrirlos de verdad." },
    { title: "Elige tu favorito", description: "Un toque basta para votar por el nombre que te conquista." },
    { title: "Descubre la tendencia", description: "Mira cómo cambia el ranking y sigue con otro duelo." },
  ];

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
          {howSteps.map((step, index) => {
            const image = featuredItems[index % Math.max(featuredItems.length, 1)];
            return (
              <article className={`home-step-card home-step-card-${index + 1}`} key={step.title}>
                <div className="home-step-art" aria-hidden="true">
                  {image ? <BusinessImage alt="" className="home-step-photo" name={image.name} sizes="(max-width: 560px) 104px, 33vw" src={image.image_url} /> : null}
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="home-step-copy"><h3>{step.title}</h3><p>{step.description}</p></div>
              </article>
            );
          })}
        </div>
        <div className="home-contribute">
          <p>¿Conoces un local con un nombre inolvidable?</p>
          <Link className="text-link" href="/ingresar?next=/aportes/nuevo">Aporta un local real</Link>
        </div>
      </section>
    </main>
  );
}
