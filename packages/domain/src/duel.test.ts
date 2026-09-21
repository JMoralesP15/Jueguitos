import { describe, expect, it } from "vitest";

import { businessItemSchema, castDuelVoteSchema, duelVoteResultSchema } from "./duel";

describe("contrato del motor de duelos", () => {
  it("acepta un ítem público completo", () => {
    expect(
      businessItemSchema.safeParse({
        category: "Peluquería",
        city: "Santiago",
        id: "9af0d9b6-5e5d-4ff2-b3d4-9d3a4e5f2001",
        imageUrl: "https://example.com/pelo-lais.jpg",
        name: "Pelo Lais",
        rating: 1500,
        type: "business_name",
      }).success,
    ).toBe(true);
  });

  it("exige identificadores UUID para un voto", () => {
    expect(castDuelVoteSchema.safeParse({ duelId: "duelo", winnerId: "ganador" }).success).toBe(false);
  });

  it("acepta porcentajes devueltos por PostgreSQL", () => {
    const result = duelVoteResultSchema.parse({
      first_percentage: "62.5",
      first_votes: 5,
      loser_rating: 1492,
      second_percentage: "37.5",
      second_votes: 3,
      winner_rating: 1508,
    });

    expect(result.first_percentage).toBe(62.5);
    expect(result.second_votes).toBe(3);
  });
});
