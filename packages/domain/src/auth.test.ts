import { describe, expect, it } from "vitest";

import { registerCredentialsSchema, usernameSchema } from "./auth";

describe("usernameSchema", () => {
  it("normaliza un nombre válido", () => {
    expect(usernameSchema.parse("  Usuario_01 ")).toBe("usuario_01");
  });

  it("rechaza espacios y símbolos", () => {
    expect(usernameSchema.safeParse("usuario público").success).toBe(false);
  });
});

describe("registerCredentialsSchema", () => {
  it("exige una contraseña de al menos diez caracteres", () => {
    const result = registerCredentialsSchema.safeParse({
      email: "persona@example.com",
      username: "persona",
      password: "corta",
    });

    expect(result.success).toBe(false);
  });
});
