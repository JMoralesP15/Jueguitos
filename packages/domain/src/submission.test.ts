import { describe, expect, it } from "vitest";

import { createBusinessSubmissionSchema } from "./submission";

describe("createBusinessSubmissionSchema", () => {
  it("accepts a normalized business contribution", () => {
    expect(
      createBusinessSubmissionSchema.parse({
        category: "Cafetería y pastelería",
        city: "Santiago",
        name: "  Café del Barrio  ",
      }),
    ).toEqual({
      category: "Cafetería y pastelería",
      city: "Santiago",
      name: "Café del Barrio",
    });
  });

  it("rejects a category outside the controlled list", () => {
    expect(
      createBusinessSubmissionSchema.safeParse({
        category: "Cafés",
        city: "Santiago",
        name: "Café del Barrio",
      }).success,
    ).toBe(false);
  });
});
