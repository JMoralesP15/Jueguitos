import { describe, expect, it } from "vitest";

import {
  businessItemSchema,
  profileDisplayNameSchema,
  castDuelVoteSchema,
  duelPayloadSchema,
  duelVoteResultSchema,
  roundSummarySchema,
} from "./duel";

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

  it("acepta el progreso de la ronda junto al duelo", () => {
    const item = {
      category: "Cafetería",
      city: "Ñuñoa",
      id: "9af0d9b6-5e5d-4ff2-b3d4-9d3a4e5f2001",
      imageUrl: "https://example.com/local.jpg",
      name: "Café con Piernas",
      rating: 1500,
      type: "business_name",
    };

    expect(
      duelPayloadSchema.safeParse({
        duel_id: "7bf0d9b6-5e5d-4ff2-b3d4-9d3a4e5f2002",
        first_item: item,
        round_position: 3,
        round_size: 10,
        second_item: { ...item, id: "6cf0d9b6-5e5d-4ff2-b3d4-9d3a4e5f2003" },
      }).success,
    ).toBe(true);
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

  it("acepta un resumen factual de ronda", () => {
    expect(roundSummarySchema.parse({ round_size: 10, votes_cast: 10 })).toEqual({
      round_size: 10,
      votes_cast: 10,
    });
  });
});

describe("profileDisplayNameSchema", () => {
  it("accepts a trimmed display name", () => {
    expect(profileDisplayNameSchema.parse("  PanConQueso ")).toBe("PanConQueso");
  });

  it("allows clearing the optional display name", () => {
    expect(profileDisplayNameSchema.parse("   ")).toBeNull();
  });

  it("rejects names that are too short or too long", () => {
    expect(profileDisplayNameSchema.safeParse("A").success).toBe(false);
    expect(profileDisplayNameSchema.safeParse("x".repeat(33)).success).toBe(false);
  });
});
