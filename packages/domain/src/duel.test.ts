import { describe, expect, it } from "vitest";

import { businessItemSchema, castDuelVoteSchema } from "./duel";

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
});
