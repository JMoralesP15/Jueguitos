import Link from "next/link";
import { redirect } from "next/navigation";

import { approveSubmissionAction, hideSubmissionAction } from "./actions";
import { createClient } from "@/lib/supabase/server";

type Submission = {
  address: string | null;
  category: string;
  city: string;
  created_at: string;
  id: string;
  image_path: string | null;
  latitude: number | null;
  longitude: number | null;
  name: string;
};

function mapLink(latitude: number, longitude: number) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`;
}

type AdminSubmissionsPageProps = { searchParams: Promise<{ aprobado?: string; descartado?: string; error?: string }> };

export default async function AdminSubmissionsPage({ searchParams }: AdminSubmissionsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) redirect("/ingresar?origen=admin-aportes");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/cuenta");

  const [query, { data }] = await Promise.all([
    searchParams,
    supabase
    .from("items")
    .select("id, name, category, city, address, latitude, longitude, image_path, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true }),
  ]);
  const submissions = (data ?? []) as Submission[];

  const reviewed = await Promise.all(
    submissions.map(async (submission) => {
      const signed = submission.image_path
        ? await supabase.storage.from("item-submissions").createSignedUrl(submission.image_path, 900)
        : { data: null };
      return { ...submission, imageUrl: signed.data?.signedUrl ?? null };
    }),
  );

  return (
    <main className="admin-page">
      <section className="dashboard-heading">
        <p className="eyebrow">Administración · MVP-004b</p>
        <h1>Revisar locales</h1>
        <p className="lede">Aprueba sólo nombres, fotos y ubicaciones que representen correctamente un local real.</p>
        <div className="hero-actions"><Link className="button button-secondary" href="/cuenta">Volver a mi cuenta</Link></div>
      </section>

      {query.aprobado === "1" ? <p className="notice" role="status">El local ya está publicado.</p> : null}
      {query.descartado === "1" ? <p className="notice" role="status">El aporte fue descartado.</p> : null}
      {query.error ? <p className="form-message" role="alert">No pudimos completar la revisión. Inténtalo nuevamente.</p> : null}

      <section aria-labelledby="pending-title">
        <h2 id="pending-title">Pendientes ({reviewed.length})</h2>
        {reviewed.length ? (
          <ul className="review-list">
            {reviewed.map((submission) => (
              <li key={submission.id}>
                {submission.imageUrl ? <img alt={`Foto enviada de ${submission.name}`} className="review-image" src={submission.imageUrl} /> : null}
                <div className="review-content">
                  <p className="comparison-status">Pendiente de revisión</p>
                  <h3>{submission.name}</h3>
                  <p>{submission.category} · {submission.city}</p>
                  <p>{submission.address}</p>
                  {submission.latitude !== null && submission.longitude !== null ? <a className="text-link" href={mapLink(submission.latitude, submission.longitude)} rel="noreferrer" target="_blank">Ver punto en el mapa</a> : null}
                  <div className="review-actions">
                    <form action={approveSubmissionAction.bind(null, submission.id)}><button className="button" type="submit">Aprobar y publicar</button></form>
                    <form action={hideSubmissionAction.bind(null, submission.id)}><button className="button button-danger" type="submit">Descartar</button></form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="empty-state">No hay aportes pendientes. Cuando alguien agregue un local aparecerá aquí.</p>}
      </section>
    </main>
  );
}
