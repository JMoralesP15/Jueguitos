import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">El juego de los locales</p>
        <h1 id="page-title">¿Qué local tiene el nombre más memorable?</h1>
        <p className="lede">
          Compara dos locales de Santiago, descubre qué hace cada uno y elige tu favorito. Cada voto
          ayuda a crear un ranking hecho por la comunidad.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/jugar">Jugar ahora</Link>
          <Link className="text-link" href="/ranking">Ver el ranking</Link>
        </div>
      </section>

      <section aria-labelledby="how-title" className="home-demo">
        <div>
          <p className="eyebrow">Una decisión por vez</p>
          <h2 id="how-title">Dos locales. Una elección. ¡Y seguimos!</h2>
          <p className="lede">Toca una tarjeta, mira la tendencia cuando haya suficientes votos y sigue con el próximo duelo.</p>
        </div>
        <div aria-hidden="true" className="demo-cards">
          <div><span>La Picá de Siempre</span><small>Independencia</small></div>
          <span className="demo-versus">VS</span>
          <div><span>Pan Comido</span><small>Ñuñoa</small></div>
        </div>
        <Link className="text-link" href="/ingresar?next=/aportes/nuevo">¿Conoces un nombre memorable? Aporta un local</Link>
      </section>
    </main>
  );
}
