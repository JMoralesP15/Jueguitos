export default function HomePage() {
  return (
    <main>
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Community Manager</p>
        <h1 id="page-title">Nombres de locales, cara a cara.</h1>
        <p className="lede">
          Descubre nombres curiosos de negocios reales y elige cuál te parece mejor. Cada elección
          ayuda a construir el ranking de la comunidad.
        </p>
        <div className="hero-actions">
          <a className="button" href="/jugar">
            Jugar ahora
          </a>
          <a className="button button-secondary" href="/ranking">
            Ver ranking
          </a>
          <a className="text-link" href="/ingresar?next=/aportes/nuevo">
            Ingresar para aportar
          </a>
        </div>
      </section>

      <section aria-labelledby="how-title">
        <h2 id="how-title">Así funciona</h2>
        <ol className="how-it-works">
          <li>Elige entre dos nombres.</li>
          <li>Repite y descubre nuevos locales.</li>
          <li>Mira cómo cambia el ranking.</li>
        </ol>
      </section>
    </main>
  );
}
