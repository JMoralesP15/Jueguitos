import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "../../(auth)/actions";
import { createClient } from "@/lib/supabase/server";

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
    .select("username, display_name")
    .eq("id", user.id)
    .maybeSingle();

  const profileName = profile?.display_name || profile?.username || user.user_metadata.username;
  const username = typeof profileName === "string" ? profileName : "miembro";

  return (
    <main>
      <section className="account-card" aria-labelledby="account-title">
        <p className="eyebrow">Área protegida</p>
        <h1 id="account-title">Hola, {username}</h1>
        <p className="lede">
          Esta sección sólo se muestra cuando Supabase valida una sesión activa. Aquí vivirán tus
          comparaciones, votos y preferencias.
        </p>

        <dl className="account-details">
          <div>
            <dt>Correo de acceso</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Nombre público</dt>
            <dd>{username}</dd>
          </div>
        </dl>

        <div className="account-actions">
          <Link className="button button-secondary" href="/">
            Ir al inicio
          </Link>
          <form action={signOutAction}>
            <button className="button" type="submit">
              Cerrar sesión
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
