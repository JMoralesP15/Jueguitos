"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) redirect("/ingresar?origen=admin-aportes");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/cuenta");
  return supabase;
}

function extensionFromPath(path: string) {
  const match = path.match(/\.(jpg|jpeg|png|webp)$/i);
  return match?.[1]?.toLowerCase() ?? "jpg";
}

export async function approveSubmissionAction(itemId: string, _formData: FormData): Promise<void> {
  const supabase = await requireAdmin();
  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("id, image_path, name, status")
    .eq("id", itemId)
    .maybeSingle();

  if (itemError || !item || item.status !== "pending" || !item.image_path) {
    redirect("/admin/aportes?error=no-disponible");
  }

  const { data: privateImage, error: downloadError } = await supabase.storage
    .from("item-submissions")
    .download(item.image_path);
  if (downloadError || !privateImage) redirect("/admin/aportes?error=foto-privada");

  const publicPath = `${item.id}.${extensionFromPath(item.image_path)}`;
  const uploadOptions = privateImage.type
    ? { cacheControl: "31536000", contentType: privateImage.type, upsert: false }
    : { cacheControl: "31536000", upsert: false };
  const { error: uploadError } = await supabase.storage.from("item-images").upload(publicPath, privateImage, uploadOptions);
  if (uploadError) redirect("/admin/aportes?error=foto-publica");

  const { data: publicImage } = supabase.storage.from("item-images").getPublicUrl(publicPath);
  const { error: updateError } = await supabase
    .from("items")
    .update({ image_url: publicImage.publicUrl, status: "active" })
    .eq("id", item.id)
    .eq("status", "pending");

  if (updateError) redirect("/admin/aportes?error=publicacion");

  revalidatePath("/admin/aportes");
  revalidatePath("/aportes");
  revalidatePath("/jugar");
  revalidatePath("/ranking");
  redirect("/admin/aportes?aprobado=1");
}

export async function hideSubmissionAction(itemId: string, _formData: FormData): Promise<void> {
  const supabase = await requireAdmin();
  const { data: item, error } = await supabase
    .from("items")
    .update({ status: "hidden" })
    .eq("id", itemId)
    .eq("status", "pending")
    .select("name")
    .maybeSingle();

  if (error || !item) redirect("/admin/aportes?error=descartar");
  revalidatePath("/admin/aportes");
  revalidatePath("/aportes");
  redirect("/admin/aportes?descartado=1");
}
