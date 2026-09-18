import { describe, expect, it } from "vitest";

import { castVoteSchema, createComparisonSchema } from "./comparison";

describe("createComparisonSchema", () => {
  it("acepta una comparación con exactamente dos opciones", () => {
    const result = createComparisonSchema.safeParse({
      title: "¿Cuál afiche representa mejor al evento?",
      description: "Votación de prueba",
      options: ["Afiche azul", "Afiche verde"],
    });

    expect(result.success).toBe(true);
  });

  it("rechaza una comparación que no tiene dos opciones", () => {
    const result = createComparisonSchema.safeParse({
      title: "Elección",
      options: ["Única opción"],
    });

    expect(result.success).toBe(false);
  });
});

describe("castVoteSchema", () => {
  it("requiere identificadores UUID", () => {
    expect(
      castVoteSchema.safeParse({ comparisonId: "no-es-uuid", optionId: "tampoco" }).success,
    ).toBe(false);
  });
});
