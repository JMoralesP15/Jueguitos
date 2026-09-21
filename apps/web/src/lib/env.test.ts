import { afterEach, describe, expect, it, vi } from "vitest";

import { getConfiguredSiteUrl, getPublicEnvironment } from "./env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getPublicEnvironment", () => {
  it("acepta la configuración pública mínima de Supabase", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-test-key");

    expect(getPublicEnvironment()).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-test-key",
    });
  });

  it("rechaza una URL inválida", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not-a-url");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-test-key");

    expect(() => getPublicEnvironment()).toThrow();
  });

  it("acepta una URL pública estable para enlaces de acceso", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://juego.example.com");
    expect(getConfiguredSiteUrl()).toBe("https://juego.example.com");
  });

  it("permite omitir la URL estable durante desarrollo local", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(getConfiguredSiteUrl()).toBeNull();
  });
});
