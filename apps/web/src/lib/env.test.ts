import { afterEach, describe, expect, it, vi } from "vitest";

import { getPublicEnvironment } from "./env";

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
});
