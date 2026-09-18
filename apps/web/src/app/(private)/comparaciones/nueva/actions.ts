"use server";

import { createComparisonSchema } from "@mvp/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";

import type { ComparisonActionState } from "@/lib/comparisons/form-state";
import { createClient } from "@/lib/supabase/server";

function validationState(error: z.ZodError): ComparisonActionState {
  const fieldErrors: ComparisonActionState["fieldErrors"] = {};

  for (const issue of error.issues) {
    const rootField = issue.path[0];

    if (rootField === "options") {
      const optionIndex = issue.path[1];
      const optionField = optionIndex === 0 ? "firstOption" : optionIndex === 1 ? "secondOption" : undefined;

      if (optionField && !fieldErrors[optionField]) {
        fieldErrors[optionField] = issue.message;
      }
      continue;
    }

    if ((rootField === "title" || rootField === "description") && !fieldErrors[rootField]) {
      fieldErrors[rootField] = issue.message;
    }
  }

  return {
    fieldErrors,
    message: "Revisa los campos marcados antes de guardar el borrador.",
  };
}

export async function createComparisonAction(
  _previousState: ComparisonActionState,
  formData: FormData,
): Promise<ComparisonActionState> {
  const input = createComparisonSchema.safeParse({
    description: formData.get("description") || undefined,
    options: [formData.get("firstOption"), formData.get("secondOption")],
    title: formData.get("title"),
  });

  if (!input.success) {
    return validationState(input.error);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/ingresar?origen=comparaciones");
  }

  const { data: comparison, error: comparisonError } = await supabase
    .from("comparisons")
    .insert({
      created_by: user.id,
      description: input.data.description || null,
      status: "draft",
      title: input.data.title,
    })
    .select("id")
    .single();

  if (comparisonError || !comparison) {
    return { message: "No pudimos guardar el borrador. Inténtalo nuevamente." };
  }

  const { error: optionsError } = await supabase.from("comparison_options").insert([
    { comparison_id: comparison.id, label: input.data.options[0], position: 1 },
    { comparison_id: comparison.id, label: input.data.options[1], position: 2 },
  ]);

  if (optionsError) {
    return { message: "El borrador fue creado, pero no pudimos guardar sus opciones. Vuelve a intentarlo." };
  }

  revalidatePath("/comparaciones");
  redirect("/comparaciones?creada=1");
}
