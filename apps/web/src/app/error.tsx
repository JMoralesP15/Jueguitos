"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main>
      <h1>No pudimos cargar esta vista</h1>
      <p>El problema fue registrado. Puedes intentar nuevamente.</p>
      <button type="button" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}
