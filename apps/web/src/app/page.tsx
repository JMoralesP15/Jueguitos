const decisions = [
  "Next.js 16 con App Router y TypeScript estricto",
  "Supabase como núcleo de datos y autenticación",
  "Correo, nombre de usuario público y contraseña para el MVP",
  "Cloudflare Workers mediante una ruta vinext verificada en CI",
];

export default function HomePage() {
  return (
    <main>
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">Fase 0</p>
        <h1 id="page-title">Arquitectura inicial preparada</h1>
        <p className="lede">
          El repositorio ya separa decisiones, dominio, aplicación web, infraestructura local y
          automatización. El siguiente incremento será el esquema de datos y las políticas RLS.
        </p>
      </section>

      <section aria-labelledby="decisions-title">
        <h2 id="decisions-title">Decisiones vigentes</h2>
        <ul>
          {decisions.map((decision) => (
            <li key={decision}>{decision}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="status-title">
        <h2 id="status-title">Estado del entorno</h2>
        <dl>
          <div>
            <dt>Aplicación</dt>
            <dd>Lista para desarrollo local</dd>
          </div>
          <div>
            <dt>Cloudflare</dt>
            <dd>Compatibilidad comprobada en cada pull request</dd>
          </div>
          <div>
            <dt>Supabase</dt>
            <dd>Configuración local preparada para las primeras migraciones</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
