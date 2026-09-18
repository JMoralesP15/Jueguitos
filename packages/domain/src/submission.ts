import { z } from "zod";

export const businessCategories = [
  "Restaurante",
  "Cafetería y pastelería",
  "Bar, pub y cervecería",
  "Comida rápida",
  "Panadería",
  "Heladería",
  "Peluquería y barbería",
  "Belleza y bienestar",
  "Moda y accesorios",
  "Hogar y decoración",
  "Mascotas",
  "Salud y farmacia",
  "Deporte y aire libre",
  "Tecnología y reparación",
  "Librería y educación",
  "Servicios profesionales",
  "Turismo y entretención",
  "Otro",
] as const;

export const businessCategorySchema = z.enum(businessCategories);

export const createBusinessSubmissionSchema = z.object({
  category: businessCategorySchema,
  city: z.string().trim().min(2, "Indica una ciudad.").max(80),
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(120),
});

export type BusinessCategory = z.infer<typeof businessCategorySchema>;
export type CreateBusinessSubmission = z.infer<typeof createBusinessSubmissionSchema>;
