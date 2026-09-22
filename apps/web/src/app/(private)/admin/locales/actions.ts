"use server";

import { businessCategorySchema } from "@mvp/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AdminLocalActionState = {
  fieldErrors?: Record<string, string>;
  message?: string;
  success?: boolean;
};

const acceptedPhotoTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maximumPhotoBytes = 5 * 1024 * 1024;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/ingresar?origen=admin-locales");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/cuenta");

  return { supabase, user };
}

function textValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function createAdminLocalAction(
  _previousState: AdminLocalActionState,
  formData: FormData,
): Promise<AdminLocalActionState> {
  const name = textValue(formData, "name");
  const category = businessCategorySchema.safeParse(textValue(formData, "category"));
  const city = textValue(formData, "city");
  const address = textValue(formData, "address");
  const instagramUrl = textValue(formData, "instagramUrl");
  const websiteUrl = textValue(formData, "websiteUrl");
  const fieldErrors: Record<string, string> = {};

  if (name.length < 2 || name.length > 120) fieldErrors.name = "Usa entre 2 y 120 caracteres.";
  if (!category.success) fieldErrors.category = "Elige un rubro válido.";
  if (city.length < 2 || city.length > 80) fieldErrors.city = "Usa entre 2 y 80 caracteres.";
  if (address.length > 200) fieldErrors.address = "La dirección no puede superar 200 caracteres.";

  for (const [field, value] of [["instagramUrl", instagramUrl], ["websiteUrl", websiteUrl]] as const) {
    if (value && !/^https:\/\//i.test(value)) fieldErrors[field] = "Usa un enlace HTTPS.";
  }

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    fieldErrors.photo = "Selecciona una foto del local.";
  } else if (!acceptedPhotoTypes.has(photo.type)) {
    fieldErrors.photo = "Usa una imagen JPG, PNG o WebP.";
  } else if (photo.size > maximumPhotoBytes) {
    fieldErrors.photo = "La foto debe pesar como máximo 5 MB.";
  }

  if (Object.keys(fieldErrors).length) {
    return { fieldErrors, message: "Revisa los campos marcados antes de guardar el local." };
  }

  if (!(photo instanceof File)) {
    return { fieldErrors: { photo: "Selecciona una foto del local." }, message: "Falta la foto." };
  }

  const { supabase, user } = await requireAdmin();
  const extension = acceptedPhotoTypes.get(photo.type) ?? "jpg";
  const imagePath = `${user.id}/admin-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from("item-submissions").upload(imagePath, photo, {
    cacheControl: "3600",
    contentType: photo.type,
    upsert: false,
  });

  if (uploadError) return { message: "No pudimos subir la foto. Inténtalo nuevamente." };

  const { error: insertError } = await supabase.from("items").insert({
    address: address || null,
    category: category.data,
    city,
    created_by: user.id,
    image_path: imagePath,
    image_url: null,
    instagram_url: instagramUrl || null,
    latitude: null,
    location_accuracy_meters: null,
    location_source: null,
    longitude: null,
    name,
    status: "pending",
    type: "business_name",
    website_url: websiteUrl || null,
  });

  if (insertError) {
    await supabase.storage.from("item-submissions").remove([imagePath]);
    if (insertError.code === "23505") {
      return { message: "Ese local ya existe con el mismo nombre, rubro y comuna." };
    }
    return { message: "No pudimos guardar el local. Revisa los datos e inténtalo nuevamente." };
  }

  revalidatePath("/admin/locales");
  revalidatePath("/admin/aportes");
  return { message: "Local guardado como pendiente de revisión.", success: true };
}
