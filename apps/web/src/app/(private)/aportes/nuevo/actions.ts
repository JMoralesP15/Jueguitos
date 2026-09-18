"use server";

import { createBusinessSubmissionSchema } from "@mvp/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";

import type { SubmissionActionState } from "@/lib/submissions/form-state";
import { createClient } from "@/lib/supabase/server";

const acceptedPhotoTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maximumPhotoBytes = 5 * 1024 * 1024;

function validationState(error: z.ZodError): SubmissionActionState {
  const fieldErrors: SubmissionActionState["fieldErrors"] = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if ((field === "address" || field === "category" || field === "city" || field === "name") && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
    if ((field === "latitude" || field === "longitude" || field === "locationSource") && !fieldErrors.location) {
      fieldErrors.location = "Confirma o ajusta el punto en el mapa.";
    }
  }

  return { fieldErrors, message: "Revisa los campos marcados antes de enviar el aporte." };
}

export async function createBusinessSubmissionAction(
  _previousState: SubmissionActionState,
  formData: FormData,
): Promise<SubmissionActionState> {
  const input = createBusinessSubmissionSchema.safeParse({
    address: formData.get("address"),
    category: formData.get("category"),
    city: formData.get("city"),
    latitude: formData.get("latitude"),
    locationAccuracyMeters: formData.get("locationAccuracyMeters") || undefined,
    locationSource: formData.get("locationSource"),
    longitude: formData.get("longitude"),
    name: formData.get("name"),
  });

  if (!input.success) return validationState(input.error);

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return { fieldErrors: { photo: "Selecciona una foto del local." }, message: "Falta la foto." };
  }

  const extension = acceptedPhotoTypes.get(photo.type);
  if (!extension) {
    return { fieldErrors: { photo: "Usa una imagen JPG, PNG o WebP." }, message: "El formato no está permitido." };
  }
  if (photo.size > maximumPhotoBytes) {
    return { fieldErrors: { photo: "La foto debe pesar como máximo 5 MB." }, message: "La foto es demasiado pesada." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/ingresar?origen=aportes");

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (!profile) {
    return { message: "Ingresa con una cuenta registrada para aportar un local." };
  }

  const imagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("item-submissions").upload(imagePath, photo, {
    cacheControl: "3600",
    contentType: photo.type,
    upsert: false,
  });

  if (uploadError) return { message: "No pudimos subir la foto. Inténtalo otra vez." };

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
    status: "pending",
    type: "business_name",
  });

  if (submissionError) {
    await supabase.storage.from("item-submissions").remove([imagePath]);
    return { message: "No pudimos guardar el aporte. Revisa si ese local ya fue enviado." };
  }

  revalidatePath("/aportes");
  redirect("/aportes?enviado=1");
}
