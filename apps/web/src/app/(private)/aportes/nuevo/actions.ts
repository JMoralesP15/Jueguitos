"use server";

import { createBusinessSubmissionSchema } from "@mvp/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";

import type { SubmissionActionState, SubmissionFormValues } from "@/lib/submissions/form-state";
import { createClient } from "@/lib/supabase/server";

const acceptedPhotoTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maximumPhotoBytes = 5 * 1024 * 1024;

function formValues(formData: FormData): SubmissionFormValues {
  const stringValue = (field: string) => {
    const value = formData.get(field);
    return typeof value === "string" ? value : "";
  };

  return {
    address: stringValue("address"),
    category: stringValue("category"),
    city: stringValue("city"),
    instagramUrl: stringValue("instagramUrl"),
    latitude: stringValue("latitude"),
    locationAccuracyMeters: stringValue("locationAccuracyMeters"),
    locationConfirmed: stringValue("locationConfirmed"),
    locationSource: stringValue("locationSource"),
    longitude: stringValue("longitude"),
    name: stringValue("name"),
    websiteUrl: stringValue("websiteUrl"),
  };
}

function validationState(error: z.ZodError, values: SubmissionFormValues): SubmissionActionState {
  const fieldErrors: SubmissionActionState["fieldErrors"] = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if ((field === "address" || field === "category" || field === "city" || field === "instagramUrl" || field === "name" || field === "websiteUrl") && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
    if ((field === "latitude" || field === "longitude" || field === "locationConfirmed" || field === "locationSource") && !fieldErrors.location) {
      fieldErrors.location = "Confirma o ajusta el punto en el mapa.";
    }
  }

  return { fieldErrors, message: "Revisa los campos marcados antes de enviar el aporte.", values };
}

export async function createBusinessSubmissionAction(
  _previousState: SubmissionActionState,
  formData: FormData,
): Promise<SubmissionActionState> {
  const values = formValues(formData);
  const input = createBusinessSubmissionSchema.safeParse({
    address: formData.get("address"),
    category: formData.get("category"),
    city: formData.get("city"),
    instagramUrl: formData.get("instagramUrl") || undefined,
    latitude: formData.get("latitude"),
    locationAccuracyMeters: formData.get("locationAccuracyMeters") || undefined,
    locationConfirmed: formData.get("locationConfirmed"),
    locationSource: formData.get("locationSource"),
    longitude: formData.get("longitude"),
    name: formData.get("name"),
    websiteUrl: formData.get("websiteUrl") || undefined,
  });

  if (!input.success) return validationState(input.error, values);

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return { fieldErrors: { photo: "Selecciona una foto del local." }, message: "Falta la foto.", values };
  }

  const extension = acceptedPhotoTypes.get(photo.type);
  if (!extension) {
    return { fieldErrors: { photo: "Usa una imagen JPG, PNG o WebP." }, message: "El formato no está permitido.", values };
  }
  if (photo.size > maximumPhotoBytes) {
    return { fieldErrors: { photo: "La foto debe pesar como máximo 5 MB." }, message: "La foto es demasiado pesada.", values };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/ingresar?origen=aportes");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (!profile) {
    return { message: "Ingresa con una cuenta registrada para aportar un local.", values };
  }

  const imagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("item-submissions").upload(imagePath, photo, {
    cacheControl: "3600",
    contentType: photo.type,
    upsert: false,
  });

  if (uploadError) return { message: "No pudimos subir la foto. Inténtalo otra vez.", values };

  const { error: submissionError } = await supabase.from("items").insert({
    category: input.data.category,
    city: input.data.city,
    created_by: user.id,
    address: input.data.address,
    image_path: imagePath,
    image_url: null,
    latitude: input.data.latitude,
    location_accuracy_meters: input.data.locationAccuracyMeters ?? null,
    location_source: input.data.locationSource,
    longitude: input.data.longitude,
    name: input.data.name,
    website_url: input.data.websiteUrl || null,
    instagram_url: input.data.instagramUrl || null,
    status: "pending",
    type: "business_name",
  });

  if (submissionError) {
    await supabase.storage.from("item-submissions").remove([imagePath]);
    return { message: "No pudimos guardar el aporte. Revisa si ese local ya fue enviado.", values };
  }

  revalidatePath("/aportes");
  redirect("/aportes?enviado=1");
}
