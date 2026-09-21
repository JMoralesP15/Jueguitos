import { describe, expect, it } from "vitest";

import { magicLinkCredentialsSchema, registerCredentialsSchema, usernameSchema } from "./auth";

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

describe("magicLinkCredentialsSchema", () => {
  it("acepta un correo y una ruta interna", () => {
    expect(
      magicLinkCredentialsSchema.safeParse({ email: "persona@example.com", next: "/jugar" }).success,
    ).toBe(true);
  });

  it("rechaza una URL externa como destino", () => {
    expect(
      magicLinkCredentialsSchema.safeParse({ email: "persona@example.com", next: "https://example.com" }).success,
    ).toBe(false);
  });
});
