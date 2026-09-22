import { z } from "zod";

export const COMMUNITY_VOTE_THRESHOLD = 5;

export const businessItemSchema = z.object({
  address: z.string().trim().max(200).nullable().optional(),
  category: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  id: z.uuid(),
  imageUrl: z.url(),
  instagramUrl: z.url().nullable().optional(),
  name: z.string().trim().min(2).max(120),
  rating: z.number(),
  type: z.literal("business_name"),
  websiteUrl: z.url().nullable().optional(),
});

export const profileDisplayNameSchema = z
  .string()
  .trim()
  .max(32, "El nombre puede tener hasta 32 caracteres.")
  .refine((value) => value.length === 0 || value.length >= 2, "Usa al menos 2 caracteres.")
  .transform((value) => value || null);

export const castDuelVoteSchema = z.object({
  duelId: z.uuid(),
  winnerId: z.uuid(),
});

export const duelPayloadSchema = z.object({
  duel_id: z.uuid(),
  first_item: businessItemSchema,
  round_position: z.coerce.number().int().positive(),
  round_size: z.coerce.number().int().positive().max(10),
  second_item: businessItemSchema,
});

export const duelVoteResultSchema = z.object({
  first_percentage: z.coerce.number().min(0).max(100),
  first_votes: z.coerce.number().int().nonnegative(),
  loser_rating: z.coerce.number(),
  second_percentage: z.coerce.number().min(0).max(100),
  second_votes: z.coerce.number().int().nonnegative(),
  winner_rating: z.coerce.number(),
});

export const roundSummarySchema = z.object({
  round_size: z.coerce.number().int().positive().max(10),
  votes_cast: z.coerce.number().int().nonnegative(),
});

export type BusinessItem = z.infer<typeof businessItemSchema>;
export type CastDuelVote = z.infer<typeof castDuelVoteSchema>;
export type DuelPayload = z.infer<typeof duelPayloadSchema>;
export type DuelVoteResult = z.infer<typeof duelVoteResultSchema>;
export type RoundSummary = z.infer<typeof roundSummarySchema>;
