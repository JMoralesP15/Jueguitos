import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
  .max(24, "El nombre de usuario no puede superar 24 caracteres")
  .regex(/^[a-z0-9_]+$/, "Usa sólo letras minúsculas, números y guion bajo");

export const passwordSchema = z
  .string()
  .min(10, "La contraseña debe tener al menos 10 caracteres")
  .max(128, "La contraseña es demasiado larga");

export const registerCredentialsSchema = z.object({
  email: z.email(),
  username: usernameSchema,
  password: passwordSchema,
});

export const signInCredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type RegisterCredentials = z.infer<typeof registerCredentialsSchema>;
export type SignInCredentials = z.infer<typeof signInCredentialsSchema>;
