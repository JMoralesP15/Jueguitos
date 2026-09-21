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
  address: z.string().trim().min(5, "Indica una dirección o referencia del local.").max(200),
  category: businessCategorySchema,
  city: z.string().trim().min(2, "Indica una ciudad.").max(80),
  instagramUrl: z.union([
    z.string().trim().url("Usa un enlace válido de Instagram.").refine((value) => value.startsWith("https://"), "Usa un enlace HTTPS."),
    z.literal(""),
  ]).optional(),
  latitude: z.coerce.number().gte(-90).lte(90),
  locationAccuracyMeters: z.coerce.number().positive().max(50_000).optional(),
  locationConfirmed: z.string().refine((value) => value === "true", "Confirma el punto del local en el mapa."),
  locationSource: z.enum(["device", "manual"]),
  longitude: z.coerce.number().gte(-180).lte(180),
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(120),
  websiteUrl: z.union([
    z.string().trim().url("Usa un enlace válido para la página.").refine((value) => value.startsWith("https://"), "Usa un enlace HTTPS."),
    z.literal(""),
  ]).optional(),
});

export type BusinessCategory = z.infer<typeof businessCategorySchema>;
export type CreateBusinessSubmission = z.infer<typeof createBusinessSubmissionSchema>;
