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

export type BusinessItem = z.infer<typeof businessItemSchema>;
export type CastDuelVote = z.infer<typeof castDuelVoteSchema>;
export type DuelPayload = z.infer<typeof duelPayloadSchema>;
