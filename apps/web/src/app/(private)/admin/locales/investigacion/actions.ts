"use server";

import { businessResearchBatchSchema, businessResearchCandidateSchema } from "@mvp/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const acceptedPhotoTypes = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);
const maximumPhotoBytes = 5 * 1024 * 1024;

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/ingresar?origen=investigacion-locales");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/cuenta");
  return { supabase, user };
}

function messageRedirect(message: string): never {
  redirect(`/admin/locales/investigacion?mensaje=${encodeURIComponent(message)}`);
}

export async function importResearchCandidatesAction(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin();
  const raw = formData.get("candidates");
  if (typeof raw !== "string" || raw.length > 100_000) messageRedirect("El archivo de fichas está vacío o es demasiado grande.");

  let decoded: unknown;
  try { decoded = JSON.parse(raw); } catch { messageRedirect("No pudimos leer el JSON. Revisa que esté completo y tenga formato válido."); }
  const parsed = businessResearchBatchSchema.safeParse(decoded);
  if (!parsed.success) messageRedirect("Hay datos incompletos. Cada ficha necesita nombre, rubro, comuna, dirección y fuentes https; máximo 50.");

  const { data: batch, error: batchError } = await supabase.from("local_research_batches")
    .select("id").eq("status", "collecting").eq("created_by", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  let batchId = batch?.id;
  if (batchError) messageRedirect("No pudimos abrir la bandeja. Revisa que la migración de investigación esté aplicada.");
  if (!batchId) {
    const { data: createdBatch, error } = await supabase.from("local_research_batches").insert({ created_by: user.id }).select("id").single();
    if (error || !createdBatch) messageRedirect("No pudimos crear el lote de investigación.");
    batchId = createdBatch.id;
  }

  const { count, error: countError } = await supabase.from("local_research_candidates")
    .select("id", { count: "exact", head: true }).eq("batch_id", batchId).neq("status", "archived");
  if (countError) messageRedirect("No pudimos comprobar el tamaño del lote.");
  if ((count ?? 0) + parsed.data.length > 50) messageRedirect(`Este lote ya tiene ${count ?? 0} fichas. Puedes agregar ${Math.max(0, 50 - (count ?? 0))} más, hasta llegar a 50.`);

  const { data: existing, error: existingError } = await supabase.from("local_research_candidates")
    .select("name, city").eq("batch_id", batchId).neq("status", "archived");
  if (existingError) messageRedirect("No pudimos revisar posibles duplicados.");
  const key = (name: string, city: string) => `${name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase()}|${city.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase()}`;
  const seen = new Set((existing ?? []).map((candidate) => key(candidate.name, candidate.city)));
  for (const candidate of parsed.data) {
    const candidateKey = key(candidate.name, candidate.city);
    if (seen.has(candidateKey)) messageRedirect(`“${candidate.name}” en ${candidate.city} ya está en el lote. No se agregaron fichas.`);
    seen.add(candidateKey);
  }
  const { error: insertError } = await supabase.from("local_research_candidates").insert(parsed.data.map((candidate) => ({
    address: candidate.address,
    address_source_url: candidate.addressSourceUrl,
    batch_id: batchId,
    category: candidate.category,
    city: candidate.city,
    created_by: user.id,
    instagram_url: candidate.instagramUrl ?? null,
    instagram_source_url: candidate.instagramSourceUrl ?? null,
    name: candidate.name,
    notes: candidate.notes ?? null,
    source_url: candidate.sourceUrl,
    website_url: candidate.websiteUrl ?? null,
    website_source_url: candidate.websiteSourceUrl ?? null,
  })));
  if (insertError) messageRedirect(insertError.code === "23505" ? "Hay locales repetidos por nombre y comuna; corrige los duplicados y vuelve a importar." : "No pudimos guardar las fichas. Inténtalo nuevamente.");
  revalidatePath("/admin/locales/investigacion");
  messageRedirect(`${parsed.data.length} fichas agregadas al lote privado.`);
}

export async function submitResearchCandidateAction(candidateId: string, formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin();
  const { data: candidate, error: candidateError } = await supabase.from("local_research_candidates").select("*").eq("id", candidateId).maybeSingle();
  if (candidateError || !candidate || candidate.status === "submitted" || candidate.status === "archived") messageRedirect("Esta ficha ya fue enviada o ya no está disponible.");

  const valid = businessResearchCandidateSchema.safeParse({
    address: candidate.address,
    addressSourceUrl: candidate.address_source_url,
    category: candidate.category,
    city: candidate.city,
    instagramUrl: candidate.instagram_url ?? undefined,
    instagramSourceUrl: candidate.instagram_source_url ?? undefined,
    name: candidate.name,
    notes: candidate.notes ?? undefined,
    sourceUrl: candidate.source_url,
    websiteUrl: candidate.website_url ?? undefined,
    websiteSourceUrl: candidate.website_source_url ?? undefined,
  });
  if (!valid.success) messageRedirect("La ficha tiene datos que hay que corregir antes de enviarla.");
  if (formData.get("photoPermission") !== "authorized") messageRedirect("Confirma que tienes permiso para usar esta foto.");
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) messageRedirect("Selecciona una foto legible del letrero.");
  if (!acceptedPhotoTypes.has(photo.type) || photo.size > maximumPhotoBytes) messageRedirect("Usa JPG, PNG o WebP de máximo 5 MB.");

  const extension = acceptedPhotoTypes.get(photo.type) ?? "jpg";
  const imagePath = `${user.id}/research-${candidate.id}-${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("item-submissions").upload(imagePath, photo, { cacheControl: "3600", contentType: photo.type, upsert: false });
  if (uploadError) messageRedirect("No pudimos guardar la foto privada. Inténtalo nuevamente.");

  const { data: item, error: itemError } = await supabase.from("items").insert({
    address: candidate.address, category: candidate.category, city: candidate.city, created_by: user.id,
    image_path: imagePath, image_url: null, instagram_url: candidate.instagram_url, latitude: null,
    location_accuracy_meters: null, location_source: null, longitude: null, name: candidate.name,
    status: "pending", type: "business_name", website_url: candidate.website_url,
  }).select("id").single();
  if (itemError || !item) {
    await supabase.storage.from("item-submissions").remove([imagePath]);
    messageRedirect(itemError?.code === "23505" ? "Ese local ya existe en el catálogo. No se envió." : "No pudimos crear el aporte; la foto temporal se retiró.");
  }

  const { error: updateError } = await supabase.from("local_research_candidates").update({
    photo_rights_attested_by: user.id,
    photo_rights_attested_at: new Date().toISOString(),
    status: "submitted",
    promoted_item_id: item.id,
    updated_at: new Date().toISOString(),
  }).eq("id", candidate.id);
  if (updateError) {
    messageRedirect("El aporte quedó en la cola privada de revisión. Si esta ficha sigue abierta, comprueba el listado de aportes antes de reenviarla.");
  }
  revalidatePath("/admin/locales/investigacion");
  revalidatePath("/admin/aportes");
  messageRedirect(`“${candidate.name}” pasó al flujo habitual de revisión, todavía privado.`);
}
