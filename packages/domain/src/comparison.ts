import { z } from "zod";

export const comparisonTitleSchema = z
  .string()
  .trim()
  .min(3, "El título debe tener al menos 3 caracteres")
  .max(120, "El título no puede superar 120 caracteres");

export const comparisonDescriptionSchema = z
  .string()
  .trim()
  .max(1000, "La descripción no puede superar 1.000 caracteres");

export const comparisonOptionLabelSchema = z
  .string()
  .trim()
  .min(2, "Cada opción debe tener al menos 2 caracteres")
  .max(80, "Cada opción no puede superar 80 caracteres");

export const createComparisonSchema = z.object({
  title: comparisonTitleSchema,
  description: comparisonDescriptionSchema.optional(),
  options: z.tuple([comparisonOptionLabelSchema, comparisonOptionLabelSchema]),
});

export const castVoteSchema = z.object({
  comparisonId: z.uuid(),
  optionId: z.uuid(),
});

export type CreateComparison = z.infer<typeof createComparisonSchema>;
export type CastVote = z.infer<typeof castVoteSchema>;
