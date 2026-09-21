import Link from "next/link";

import { confirmMagicLinkAction } from "./actions";

type ConfirmPageProps = {
  searchParams: Promise<{
    code?: string | string[];
    next?: string | string[];
    token_hash?: string | string[];
  }>;
};

function singleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/jugar";
}

export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const params = await searchParams;
  const tokenHash = singleValue(params.token_hash);
  const code = singleValue(params.code);
  const nextPath = safeNextPath(singleValue(params.next));

  if (!tokenHash && !code) {
    return (
      <main className="auth-page">
        <section className="auth-success" aria-labelledby="confirm-title">
          <p className="eyebrow">El juego de los locales</p>
          <h1 id="confirm-title">Este enlace no está completo</h1>
          <p>Solicita un enlace nuevo desde tu correo para entrar a jugar.</p>
          <Link className="button" href={`/ingresar?next=${encodeURIComponent(nextPath)}`}>
            Pedir otro enlace
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-success" aria-labelledby="confirm-title">
        <div className="mail-icon" aria-hidden="true">✉</div>
        <p className="eyebrow">El juego de los locales</p>
        <h1 id="confirm-title">Confirma que quieres entrar</h1>
        <p>Por seguridad, el acceso se completa cuando presionas el botón. Después te llevaremos al juego.</p>
        <form action={confirmMagicLinkAction}>
          {tokenHash ? <input name="token_hash" type="hidden" value={tokenHash} /> : null}
          {code ? <input name="code" type="hidden" value={code} /> : null}
          <input name="next" type="hidden" value={nextPath} />
          <button className="button button-wide" type="submit">Entrar y continuar</button>
        </form>
        <Link className="text-link" href="/">Volver al inicio</Link>
      </section>
    </main>
  );
}
