import { describe, expect, it } from "vitest";

import { createBusinessSubmissionSchema } from "./submission";

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
