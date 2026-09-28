import { describe, expect, it } from "vitest";

import { businessResearchBatchSchema, createBusinessSubmissionSchema } from "./submission";

describe("createBusinessSubmissionSchema", () => {
  it("accepts a normalized business contribution", () => {
    expect(
      createBusinessSubmissionSchema.parse({
        address: "Av. Providencia 1234",
        category: "Cafetería y pastelería",
        city: "Santiago",
        latitude: -33.426,
        locationAccuracyMeters: 18,
        locationConfirmed: "true",
        locationSource: "device",
        longitude: -70.61,
        name: "  Café del Barrio  ",
      }),
    ).toEqual({
      address: "Av. Providencia 1234",
      category: "Cafetería y pastelería",
      city: "Santiago",
      latitude: -33.426,
      locationAccuracyMeters: 18,
      locationConfirmed: "true",
      locationSource: "device",
      longitude: -70.61,
      name: "Café del Barrio",
    });
  });

  it("rejects a category outside the controlled list", () => {
    expect(
      createBusinessSubmissionSchema.safeParse({
        address: "Av. Providencia 1234",
        category: "Cafés",
        city: "Santiago",
        latitude: -33.426,
        locationSource: "manual",
        longitude: -70.61,
        name: "Café del Barrio",
      }).success,
    ).toBe(false);
  });

  it("requires an explicit map confirmation", () => {
    expect(
      createBusinessSubmissionSchema.safeParse({
        address: "Av. Providencia 1234",
        category: "Cafetería y pastelería",
        city: "Santiago",
        latitude: -33.426,
        locationConfirmed: "",
        locationSource: "manual",
        longitude: -70.61,
        name: "Café del Barrio",
      }).success,
    ).toBe(false);
  });
});

describe("businessResearchBatchSchema", () => {
  const candidate = {
    name: "Café de prueba",
    category: "Cafetería y pastelería",
    city: "Ñuñoa",
    address: "Av. Italia 1234, Ñuñoa",
    sourceUrl: "https://example.com/local",
    addressSourceUrl: "https://example.com/contacto",
  };

  it("accepts sourced candidate drafts for the four selected business types", () => {
    expect(businessResearchBatchSchema.parse([candidate])).toHaveLength(1);
  });

  it("requires HTTPS sources and rejects unrelated business categories", () => {
    expect(businessResearchBatchSchema.safeParse([{ ...candidate, sourceUrl: "http://example.com" }]).success).toBe(false);
    expect(businessResearchBatchSchema.safeParse([{ ...candidate, category: "Restaurante" }]).success).toBe(false);
  });

  it("caps each imported list at fifty records", () => {
    expect(businessResearchBatchSchema.safeParse(Array.from({ length: 51 }, (_, index) => ({ ...candidate, name: `Local ${String(index)}` }))).success).toBe(false);
  });
});
