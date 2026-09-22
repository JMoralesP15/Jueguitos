import Link from "next/link";
import { redirect } from "next/navigation";

import { BusinessImage } from "@/components/business-image";
import { createClient } from "@/lib/supabase/server";

import { createAdminLocalAction } from "./actions";
import { LocalForm } from "./local-form";

type PendingLocal = {
  category: string;
  city: string;
  created_at: string;
  id: string;
  image_path: string | null;
  name: string;
};

export default async function AdminLocalesPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) redirect("/ingresar?origen=admin-locales");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/cuenta");

  const { data } = await supabase
    .from("items")
    .select("id, name, category, city, image_path, created_at")
    .eq("status", "pending")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });
  const pending = (data ?? []) as PendingLocal[];
  const withImages = await Promise.all(pending.map(async (local) => {
    const signed = local.image_path
      ? await supabase.storage.from("item-submissions").createSignedUrl(local.image_path, 900)
      : { data: null };
    return { ...local, imageUrl: signed.data?.signedUrl ?? null };
  }));

  return (
    <main className="admin-page">
      <section className="dashboard-heading">
        <p className="eyebrow">Administración · Catálogo</p>
        <h1>Cargar locales reales</h1>
        <p className="lede">Agrega locales de a uno. Quedarán privados y pendientes hasta que los revises y publiques.</p>
        <div className="hero-actions">
          <a className="button button-secondary" download href="/admin/locales/export">Exportar lote CSV</a>
          <Link className="button button-secondary" href="/admin/aportes">Revisar y publicar</Link>
          <Link className="text-link" href="/cuenta">Volver a mi cuenta</Link>
        </div>
      </section>

      <section aria-labelledby="new-local-title">
        <h2 id="new-local-title">Nuevo local</h2>
        <LocalForm action={createAdminLocalAction} />
      </section>

      <section aria-labelledby="pending-local-title">
        <h2 id="pending-local-title">Tu lote pendiente ({withImages.length})</h2>
        {withImages.length ? (
          <ul className="admin-local-list">
            {withImages.map((local) => (
              <li className="admin-local-card" key={local.id}>
                {local.imageUrl ? <BusinessImage alt={`Foto de ${local.name}`} className="admin-local-image" name={local.name} sizes="120px" src={local.imageUrl} /> : null}
                <div>
                  <p className="comparison-status">Pendiente</p>
                  <h3>{local.name}</h3>
                  <p>{local.category} · {local.city}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="empty-state">Todavía no has cargado locales en este lote.</p>}
      </section>
    </main>
  );
}
