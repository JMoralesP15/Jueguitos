import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { importResearchCandidatesAction, submitResearchCandidateAction } from "./actions";

type ResearchCandidate = {
  address: string;
  address_source_url: string;
  category: string;
  city: string;
  id: string;
  instagram_url: string | null;
  name: string;
  notes: string | null;
  source_url: string;
  status: string;
  website_url: string | null;
};

type PageProps = { searchParams: Promise<{ mensaje?: string }> };

export default async function LocalResearchPage({ searchParams }: PageProps) {
  const { mensaje } = await searchParams;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/ingresar?origen=investigacion-locales");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/cuenta");

  const { data: batch } = await supabase.from("local_research_batches")
    .select("id").eq("status", "collecting").eq("created_by", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const { data: records } = batch
    ? await supabase.from("local_research_candidates").select("*").eq("batch_id", batch.id).neq("status", "archived").order("created_at")
    : { data: [] };
  const candidates = (records ?? []) as ResearchCandidate[];
  const availableSlots = Math.max(0, 50 - candidates.length);

  return (
    <main className="admin-page">
      <section className="dashboard-heading">
        <p className="eyebrow">Administración · Catálogo</p>
        <h1>Investigación de locales</h1>
        <p className="lede">Prepara hasta 50 fichas con enlaces que respalden el nombre, la dirección y las redes. Quedan privadas. Las fotos se agregan después, con autorización, y recién entonces pasan a revisión.</p>
        <div className="hero-actions">
          <Link className="button button-secondary" href="/admin/locales">Cargar un local directamente</Link>
          <Link className="button button-secondary" href="/admin/aportes">Revisar aportes enviados</Link>
          <Link className="text-link" href="/cuenta">Volver a mi cuenta</Link>
        </div>
      </section>

      {mensaje ? <p className="notice" role="status">{mensaje}</p> : null}

      <section aria-labelledby="research-import-title">
        <div className="dashboard-heading">
          <p className="eyebrow">Lote privado · {candidates.length}/50</p>
          <h2 id="research-import-title">Agregar fichas investigadas</h2>
          <p className="field-help">Pega un arreglo JSON con los resultados verificados. No se descargan ni copian fotos de Google Maps o Instagram; cada ficha necesita enlaces públicos de origen.</p>
        </div>
        <form action={importResearchCandidatesAction} className="admin-local-form">
          <div className="field-group">
            <label htmlFor="research-candidates">Fichas (JSON)</label>
            <textarea id="research-candidates" maxLength={100000} name="candidates" placeholder={'[{\n  "name": "Nombre del local",\n  "category": "Cafetería y pastelería",\n  "city": "Ñuñoa",\n  "address": "Dirección, Santiago",\n  "sourceUrl": "https://sitio-fuente.cl/local",\n  "addressSourceUrl": "https://sitio-fuente.cl/contacto",\n  "websiteUrl": "https://local.cl",\n  "websiteSourceUrl": "https://sitio-fuente.cl/local",\n  "instagramUrl": "https://instagram.com/local",\n  "instagramSourceUrl": "https://sitio-fuente.cl/local",\n  "notes": "Cómo se verificó"\n}\n]'} required rows={14} />
            <p className="field-help">Requeridos: name, category, city, address, sourceUrl y addressSourceUrl; enlaces https://. Quedan {availableSlots} espacios.</p>
          </div>
          <button className="button" disabled={availableSlots === 0} type="submit">Guardar fichas privadas</button>
        </form>
      </section>

      <section aria-labelledby="research-queue-title">
        <h2 id="research-queue-title">Fichas y fuentes</h2>
        {candidates.length ? (
          <ul className="admin-local-list">
            {candidates.map((candidate) => (
              <li className="admin-local-card research-candidate" key={candidate.id}>
                <div className="research-candidate-details">
                  <p className="comparison-status">{candidate.status === "submitted" ? "En revisión privada" : "Falta foto autorizada"}</p>
                  <h3>{candidate.name}</h3>
                  <p>{candidate.category} · {candidate.city}</p>
                  <p>{candidate.address}</p>
                  <div className="research-source-links">
                    <a href={candidate.source_url} rel="noreferrer" target="_blank">Fuente del local ↗</a>
                    <a href={candidate.address_source_url} rel="noreferrer" target="_blank">Fuente de dirección ↗</a>
                    {candidate.website_url ? <a href={candidate.website_url} rel="noreferrer" target="_blank">Web ↗</a> : null}
                    {candidate.instagram_url ? <a href={candidate.instagram_url} rel="noreferrer" target="_blank">Instagram ↗</a> : null}
                  </div>
                  {candidate.notes ? <p className="field-help">{candidate.notes}</p> : null}
                </div>
                {candidate.status !== "submitted" ? (
                  <form action={submitResearchCandidateAction.bind(null, candidate.id)} className="research-photo-form" encType="multipart/form-data">
                    <label htmlFor={`research-photo-${candidate.id}`}>Foto del letrero, con el nombre legible</label>
                    <input accept="image/jpeg,image/png,image/webp" id={`research-photo-${candidate.id}`} name="photo" required type="file" />
                    <label className="research-permission-check">
                      <input name="photoPermission" required type="checkbox" value="authorized" />
                      Tengo permiso para usar esta foto (es propia o autorizada).
                    </label>
                    <button className="button button-secondary" type="submit">Enviar a revisión privada</button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        ) : <p className="empty-state">El lote está vacío. Al importar fichas, quedarán aquí hasta tener foto autorizada.</p>}
      </section>
    </main>
  );
}
