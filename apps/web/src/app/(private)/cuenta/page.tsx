import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "../../(auth)/actions";

import { ProfileForm } from "./profile-form";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/ingresar?origen=cuenta");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = typeof profile?.display_name === "string" ? profile.display_name : "";

  return (
    <main>
      <section className="account-card" aria-labelledby="account-title">
        <p className="eyebrow">Área protegida</p>
        <h1 id="account-title">{displayName ? `Hola, ${displayName}` : "Tu perfil"}</h1>
        <p className="lede">
          Personaliza cómo te llamas en tu cuenta y guarda tus locales favoritos. Estas preferencias
          son privadas y no aparecen en el ranking.
        </p>

        <ProfileForm displayName={displayName} />

        <dl className="account-details">
          <div>
            <dt>Correo de acceso</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Nombre visible</dt>
            <dd>{displayName || "Todavía no elegiste un apodo"}</dd>
          </div>
        </dl>

        <nav aria-label="Opciones de cuenta" className="account-navigation">
          <div className="account-actions account-actions-primary">
            <Link className="button" href="/jugar">
              Seguir jugando
            </Link>
            <Link className="button button-secondary" href="/cuenta/favoritos">
              Mis favoritos
            </Link>
          </div>
          <details className="account-more">
            <summary>Más opciones de cuenta</summary>
            <div className="account-actions account-actions-secondary">
              <Link className="button button-secondary" href="/aportes">
                Mis aportes
              </Link>
              <Link className="button button-secondary" href="/comparaciones">
                Mis comparaciones
              </Link>
              {profile?.role === "admin" ? (
                <Link className="button button-secondary" href="/admin/locales">Cargar locales</Link>
              ) : null}
              {profile?.role === "admin" ? (
                <Link className="button button-secondary" href="/admin/aportes">Revisar locales</Link>
              ) : null}
              <Link className="button button-secondary" href="/">
                Ir al inicio
              </Link>
              <form action={signOutAction}>
                <button className="button button-secondary" type="submit">
                  Cerrar sesión
                </button>
              </form>
            </div>
          </details>
        </nav>
      </section>
    </main>
  );
}
