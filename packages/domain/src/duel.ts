import { z } from "zod";

export const businessItemSchema = z.object({
  category: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  id: z.uuid(),
  imageUrl: z.url(),
  name: z.string().trim().min(2).max(120),
  rating: z.number(),
  type: z.literal("business_name"),
});

export const castDuelVoteSchema = z.object({
  duelId: z.uuid(),
  winnerId: z.uuid(),
});

export const duelPayloadSchema = z.object({
  duel_id: z.uuid(),
  first_item: businessItemSchema,
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

export type BusinessItem = z.infer<typeof businessItemSchema>;
export type CastDuelVote = z.infer<typeof castDuelVoteSchema>;
export type DuelPayload = z.infer<typeof duelPayloadSchema>;
export type DuelVoteResult = z.infer<typeof duelVoteResultSchema>;
